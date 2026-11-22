const {app, BrowserWindow, ipcMain, dialog, safeStorage} = require('electron');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const {pathToFileURL} = require('node:url');
const home = path.dirname(__dirname);
let win, worker, seq=0, quitting=false, checking=false;
const pending=new Map();
const credentials = {OpenAI: ['openai.key','OPENAI_API_KEY'], Gemini: ['gemini.key','GEMINI_API_KEY'], Claude: ['claude.key','ANTHROPIC_API_KEY']};
function keyPath(provider) {
  return path.join(app.getPath('userData'), credentials[provider][0]);
}
function ensureEncryption() {
  if (!safeStorage.isEncryptionAvailable() ||
      (process.platform === 'linux' && safeStorage.getSelectedStorageBackend() === 'basic_text')) {
    throw Error('Güvenli anahtar deposu kullanılamıyor. Sistem anahtarlığını açın veya sağlayıcının ortam anahtarını kullanın.');
  }
}
function saveKey(provider,key) {
  ensureEncryption();
  const temp = keyPath(provider) + '.' + process.pid + '.tmp';
  try {
    fs.writeFileSync(temp, safeStorage.encryptString(key), {mode: 0o600});
    fs.renameSync(temp, keyPath(provider));
  } finally {
    fs.rmSync(temp, {force: true});
  }
}
function readKey(provider) {
  if (!fs.existsSync(keyPath(provider))) return '';
  ensureEncryption();
  try {
    return safeStorage.decryptString(fs.readFileSync(keyPath(provider)));
  } catch {
    throw Error('Kayıtlı anahtar açılamadı. Ayarlar’dan anahtarı yeniden kaydedin.');
  }
}
function startWorker(){
  const python=process.env.VARAK_PYTHON || (process.platform==='win32'?'py':'python3');
  const args=python==='py'?['-3']:[];
  worker=spawn(python,[...args,'-u',path.join(home,'panel_bridge.py')],{cwd:home,windowsHide:true,env:{...process.env,PYTHONIOENCODING:'utf-8'}});
  function failed(){for(const task of pending.values())task.reject(Error('Çeviri motoru kapandı. Python 3.9+ kurulumunu kontrol edin.'));pending.clear();worker=null;}
  worker.on('error',failed);worker.on('exit',failed);
  worker.stderr.on('data',()=>{});
  worker.stdin.on('error',()=>{});
  readline.createInterface({input:worker.stdout}).on('line',line=>{
    let msg;try{msg=JSON.parse(line)}catch{return}
    const task=pending.get(msg.id);if(!task)return;
    pending.delete(msg.id);if(msg.error)task.reject(Error(msg.error));else task.resolve(msg.value);
  });
}
function call(name,data={}){
  if(!worker||worker.exitCode!==null)return Promise.reject(Error('Python çeviri motoru çalışmıyor.'));
  return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});
    worker.stdin.write(JSON.stringify({id,name,data})+'\n','utf8',err=>{if(err){pending.delete(id);reject(err)}});
  });
}
const entry=path.join(__dirname,'index.html');
app.whenReady().then(()=>{
  startWorker();
  win=new BrowserWindow({width:1220,height:820,minWidth:760,minHeight:580,title:'Varak 5.0',backgroundColor:'#080b12',autoHideMenuBar:true,
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,sandbox:true,nodeIntegration:false}});
  win.removeMenu();win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());
  ipcMain.handle('varak',async(e,name,data)=>{
    if(e.senderFrame.url!==pathToFileURL(entry).href)throw Error('Geçersiz pencere.');
    if(name==='choose'){const answer=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'Word kitabı',extensions:['docx']}]});return answer.canceled?null:call('select',{path:answer.filePaths[0]});}
    if(!['state','page','save','start','pause','word','folder','archive','preview','open_output','output_folder'].includes(name))throw Error('Geçersiz işlem.');
    if (name === 'state') {
      const state = await call('state');
      state.keys = Object.fromEntries(Object.entries(credentials).map(([provider, [,env]]) =>
        [provider, {saved:fs.existsSync(keyPath(provider)), environment:!!process.env[env]}]));
      return state;
    }
    if (name === 'save' || name === 'start') {
      const state = await call('state');
      const model = name === 'save' ? data.model : state.cfg.model;
      const provider = Object.keys(state.catalog).find(p => state.catalog[p].includes(model));
      if (!provider) throw Error('Bilinmeyen model.');
      if (name === 'save') {
        const {key = '', ...settings} = data;
        const result = await call('save', settings);
        if (key.trim()) saveKey(provider,key.trim());
        return result;
      }
      return call('start', {key:readKey(provider), model});
    }
    return call(name,data);
  });
  win.loadFile(entry);
  win.on('close',async e=>{
    if(quitting)return;e.preventDefault();if(checking)return;checking=true;
    try{if(worker&&(await call('state')).busy){
      const result=await dialog.showMessageBox(win,{type:'question',buttons:['Çeviriye dön','Kaydet ve kapat'],defaultId:0,cancelId:0,message:'İşlemdeki parça kaydedilince kapatılsın mı?'});
      if(result.response===0)return;
      await call('pause');while(worker&&(await call('state')).busy)await new Promise(r=>setTimeout(r,300));
    }}catch{}finally{checking=false}
    quitting=true;win.close();
  });
});
app.on('window-all-closed',()=>{if(worker)worker.kill();app.quit()});
