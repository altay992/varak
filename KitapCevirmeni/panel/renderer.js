'use strict';
const $=id=>document.getElementById(id);
const api=(name,data={})=>window.varak.call(name,data);
let s, view='dashboard', ready=false, archive={books:[],files:[]}, filter='', fileId='', page=-1, source=false, drawn='', serial=0, run=-1, toastTimer;
function toast(text){$('toast').textContent=String(text).replace(/^Error invoking remote method 'varak': Error: /,'');$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),5500)}
function bind(id,f){$(id).onclick=async()=>{try{await f()}catch(e){toast(e.message)}}}
function opts(id,values){$(id).replaceChildren(...values.map(v=>new Option(v,v)))}
function config(){if(!s)return;for(const [k,v] of Object.entries(s.cfg))$(k).value=v}
async function navigate(name){
 view=name;document.querySelectorAll('.view').forEach(e=>e.classList.toggle('active',e.id===name));document.querySelectorAll('.nav-item').forEach(e=>e.classList.toggle('active',e.dataset.view===name));
 if(name==='history'||name==='outputs')await loadArchive();
 if(name==='reader'){drawn='';await read()}
}
document.querySelectorAll('.nav-item').forEach(n=>n.onclick=()=>navigate(n.dataset.view).catch(e=>toast(e.message)));
function record(parent,title,detail,click){const b=document.createElement('button');b.className='btn ghost record';b.textContent=title;const small=document.createElement('small');small.textContent=detail;b.append(small);b.onclick=()=>Promise.resolve(click()).catch(e=>toast(e.message));parent.append(b)}
async function loadArchive(){
 archive=await api('archive');$('booksList').replaceChildren();$('bookFilter').replaceChildren(new Option('Tüm kitaplar',''));
 archive.books.forEach(b=>{$('bookFilter').add(new Option(b.title,b.id));record($('booksList'),b.title,b.outputs+' Word çıktısı · '+b.copies+' okuma kopyası',()=>{filter=b.id;fileId='';return navigate('outputs')})});
 if(!archive.books.length)$('booksList').textContent='Henüz kayıtlı kitap yok.';
 if(!archive.books.some(b=>b.id===filter))filter='';$('bookFilter').value=filter;renderFiles()
}
function renderFiles(){$('fileList').replaceChildren();const files=archive.files.filter(f=>!filter||f.project===filter);
 files.forEach(f=>record($('fileList'),f.name,[f.kind,f.edition,f.date,Math.ceil(f.size/1024)+' KB'].filter(Boolean).join(' · '),()=>preview(f.id)));
 if(!files.length)$('fileList').textContent='Bu seçim için çıktı dosyası yok.';
 if(!files.some(f=>f.id===fileId)){fileId='';$('outPreview').hidden=true}
}
async function preview(id){fileId=id;$('outPreview').hidden=false;$('excerpt').textContent='Dosya okunuyor…';const v=await api('preview',{id});if(fileId===id)$('excerpt').textContent=v}
$('bookFilter').onchange=()=>{filter=$('bookFilter').value;renderFiles()};bind('refreshHistory',loadArchive);bind('refreshFiles',loadArchive);bind('openOut',()=>api('open_output',{id:fileId}));bind('openDir',()=>api('output_folder',{id:fileId}));
async function read(){if(!s||view!=='reader')return;const tag=[s.run,page,source].join('/');if(tag===drawn)return;const n=++serial;const v=page>=0?await api('page',{index:page}):null;if(n!==serial)return;drawn=tag;$('reading').textContent=v?v[source?'source':'tr']:'İlk çevrilen parça burada görünecek.';$('reading').scrollTop=0}
for(const [id,src] of [['langIn',true],['langOut',false]])bind(id,async()=>{source=src;$(id).className='btn secondary';$(src?'langOut':'langIn').className='btn ghost';await read()});
$('pageNo').onchange=()=>{page=+$('pageNo').value;$('follow').checked=false;read().catch(e=>toast(e.message))};
bind('testConnectionBtn',async()=>{await api('choose');await update()});
bind('launchChromeBtn',()=>navigate('settings'));bind('openFolderBtn',()=>api('folder'));bind('resetBtn',()=>api('word'));bind('readerWord',()=>api('word'));
function providerOf(model){return Object.keys(s.catalog).find(p=>s.catalog[p].includes(model))}
function keyHint(){
 const provider=providerOf($('model').value);
 if(!provider)return;
 const status=s.keys[provider];
 $('keyLabel').textContent=provider+' API anahtarı';
 $('key').placeholder=status.saved?'Kayıtlı • değiştirmek için yeni anahtar gir':status.environment?'Ortam anahtarı kullanılacak':provider+' anahtarını gir';
}
$('model').onchange=()=>{$('key').value='';keyHint()};
bind('startBtn',async()=>{
 if(!s.book)return $('testConnectionBtn').click();
 const provider=providerOf(s.cfg.model), status=s.keys[provider];
 if(!status.saved&&!status.environment){await navigate('settings');$('key').focus();toast(provider+' anahtarını girip Ayarları Kaydet düğmesine bas.');return}
 await api('start');await update()
});
bind('stopBtn',async()=>{await api('pause');await update()});bind('defaultPrompt',()=>{$('system_prompt').value=s.defaultPrompt});
bind('save',async()=>{const data={};for(const k of Object.keys(s.cfg))data[k]=['limit','tries','interval'].includes(k)?Number($(k).value):$(k).value;await api('save',{...data,key:$('key').value.trim()});$('key').value='';await update();await navigate('dashboard');toast('Ayarlar kaydedildi.')});
async function update(){const v=await api('state');s=v;
 if(!ready){for(const [name,models] of Object.entries(s.catalog)){
   const group=document.createElement('optgroup');group.label=name;
   group.append(...models.map(model=>new Option(model,model)));$('model').append(group)
 }opts('tone',s.tones);opts('source_lang',s.langs);opts('target_lang',s.langs);config();ready=true}
 keyHint();
 const busy=s.busy;const total=s.total,done=s.done;const phase=s.error?'İşlem durdu':s.phase;
 $('statusPill').textContent=phase;$('statusPill').className='pill '+(s.error?'error':busy?'running':'idle');
 $('statusTitle').textContent=s.error?'Çeviri durdu':s.stopping?'Duraklatılıyor':busy?'Çeviri devam ediyor':s.planning?'Kitap inceleniyor':s.phase==='Tamamlandı'?'Çeviri tamamlandı':s.phase==='Duraklatıldı'?'Çeviri duraklatıldı':s.book?'Çeviriye hazır':'Çeviri bekliyor';
 $('statusText').textContent=s.error||s.message||(s.book?'Kayıtlı parçalarla devam edebilirsin.':'Başlamak için bir Word kitabı seç.');
 $('progressBar').style.width=(total?100*done/total:0)+'%';$('progressText').textContent=done+' / '+total+' parça';
 $('currentItem').textContent=s.cfg.source_lang+' → '+s.cfg.target_lang;
 $('connTitle').textContent=s.book||'Kitap seçilmedi';$('connText').textContent=s.book?('Parça boyutu: '+s.cfg.limit.toLocaleString('tr-TR')+' karakter'):'Çevirmek istediğin Word belgesini seç.';
 $('connDot').className='dot large '+(s.book?'on':'off');$('sideConnection').textContent=s.cfg.model;$('sideDot').className='dot '+(busy?'on':'off');
 $('totalItems').textContent=total;$('doneItems').textContent=done;
 $('waitStat').textContent=total?(s.eta?'≈ '+Math.ceil(s.eta/60)+' dk':'0 dk'):'—';$('nextItem').textContent=s.eta&&phase!=='Duraklatıldı'&&!s.error?new Date(Date.now()+1000*s.eta).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):'—';
 $('waitStat').title=s.measured?'Tamamlanan isteklerin ortalaması':'Başlangıç tahmini: kayıtlı olmayan parça başına 20 saniye';
 for(const id of ['save','testConnectionBtn',...Object.keys(s.cfg)])$(id).disabled=busy;
 $('startBtn').disabled=busy||s.planning;$('stopBtn').disabled=!busy||s.stopping;
 $('resetBtn').disabled=$('readerWord').disabled=!s.word;
 if(run!==s.run||$('pageNo').options.length>s.pages){run=s.run;page=-1;drawn='';$('pageNo').replaceChildren()}
 for(let n=$('pageNo').options.length;n<s.pages;n++)$('pageNo').add(new Option('Parça '+(n+1),n));
 if(s.pages&&($('follow').checked||page<0))page=s.pages-1;
 $('pageNo').value=page;$('pageNo').disabled=!s.pages;$('readCount').textContent=s.pages+' parça';$('langOut').textContent=s.cfg.target_lang;$('langIn').textContent=s.cfg.source_lang;await read()
}
async function poll(){try{await update()}catch(e){$('statusTitle').textContent='Çeviri motoru açılamadı';$('statusText').textContent=e.message}setTimeout(poll,750)}poll();
