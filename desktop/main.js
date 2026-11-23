// Varak masaüstü kabuğu: Python sunucusunu başlatır ve arayüzü bir pencerede açar.
// Masaüstüne özgü iki iş burada: yerel dosya seçme penceresi ve API anahtarlarını
// işletim sisteminin anahtarlığıyla (safeStorage) şifreli saklamak.
import { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } from 'electron'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const devUrl = process.env.VARAK_DEV_URL // npm run dev:desktop: arayüz Vite'tan gelir
const PROVIDERS = ['OpenAI', 'Gemini', 'Claude']

let win = null
let server = null
let port = 0
let quitting = false

if (!app.requestSingleInstanceLock()) app.quit()
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus() } })

const keyFile = (provider) => path.join(app.getPath('userData'), `${provider.toLowerCase()}.key`)

function ensureEncryption() {
  if (!safeStorage.isEncryptionAvailable() ||
      (process.platform === 'linux' && safeStorage.getSelectedStorageBackend() === 'basic_text')) {
    throw new Error('Güvenli anahtar deposu kullanılamıyor. Sistem anahtarlığını açın veya sağlayıcının ortam değişkenini kullanın.')
  }
}

function savedKeys() {
  const keys = {}
  for (const provider of PROVIDERS) {
    try {
      const data = fs.readFileSync(keyFile(provider))
      ensureEncryption()
      keys[provider] = safeStorage.decryptString(data)
    } catch { /* kayıt yok ya da açılamadı: kullanıcı yeniden girer */ }
  }
  return keys
}

/** Anahtarı şifreli kaydeder; boş anahtar kaydı siler. */
function saveKey(provider, key) {
  if (!PROVIDERS.includes(provider) || typeof key !== 'string') throw new Error('Geçersiz anahtar.')
  const file = keyFile(provider)
  if (!key.trim()) {
    fs.rmSync(file, { force: true })
    send({ keys: { [provider]: '' } })
    return
  }
  ensureEncryption()
  const temp = `${file}.${process.pid}.tmp`
  try {
    fs.writeFileSync(temp, safeStorage.encryptString(key.trim()), { mode: 0o600 })
    fs.renameSync(temp, file)
  } finally {
    fs.rmSync(temp, { force: true })
  }
  send({ keys: { [provider]: key.trim() } })
}

/** Sunucuya stdin'den satır gönderir; stdin kapanınca sunucu kendini kapatır. */
function send(message) {
  server?.stdin.write(JSON.stringify(message) + '\n')
}

function startServer() {
  return new Promise((resolve, reject) => {
    const python = process.env.VARAK_PYTHON || (process.platform === 'win32' ? 'py' : 'python3')
    const args = python === 'py' ? ['-3'] : []
    server = spawn(python, [...args, '-u', path.join(root, 'server', 'server.py'), '--desktop', '--port', devUrl ? '8765' : '0'], {
      cwd: root, windowsHide: true, env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    })
    let errors = ''
    server.stderr.on('data', (d) => { errors = (errors + d).slice(-2000); process.stderr.write(d) })
    server.stdin.on('error', () => {})
    server.on('error', () => reject(new Error('Python 3.9+ bulunamadı. Python kurup Varak’ı yeniden açın.')))
    server.on('exit', (code) => {
      server = null
      if (!port) return reject(new Error(`Varak sunucusu başlamadı (çıkış ${code}).\n${errors.trim()}`))
      if (!quitting) {
        dialog.showErrorBox('Varak', `Çeviri motoru kapandı.\n${errors.trim()}`)
        app.quit()
      }
    })
    const lines = readline.createInterface({ input: server.stdout })
    lines.once('line', (line) => {
      try {
        port = JSON.parse(line).port
        send({ keys: savedKeys() })
        resolve()
      } catch {
        reject(new Error(`Varak sunucusundan beklenmeyen yanıt: ${line}`))
      }
    })
  })
}

async function api(name, data = {}) {
  const response = await fetch(`http://127.0.0.1:${port}/api/${name}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Varak': '1' }, body: JSON.stringify(data)
  })
  const payload = await response.json()
  if (payload.error) throw new Error(payload.error)
  return payload.value
}

function createWindow() {
  const url = devUrl || `http://127.0.0.1:${port}/`
  const origin = new URL(url).origin
  win = new BrowserWindow({
    width: 1280, height: 840, minWidth: 760, minHeight: 580, title: 'Varak', backgroundColor: '#0e0e0e',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(root, 'desktop', 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false }
  })
  win.removeMenu()
  // Dış bağlantılar (ör. sağlayıcının anahtar sayfası) varsayılan tarayıcıda açılır.
  win.webContents.setWindowOpenHandler(({ url: target }) => {
    if (target.startsWith('https://')) shell.openExternal(target)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (e, target) => { if (new URL(target).origin !== origin) e.preventDefault() })

  const trusted = (e) => new URL(e.senderFrame.url).origin === origin
  ipcMain.handle('varak:choose', async (e) => {
    if (!trusted(e)) throw new Error('Geçersiz pencere.')
    const answer = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: [{ name: 'Word kitabı', extensions: ['docx'] }] })
    return answer.canceled ? null : answer.filePaths[0]
  })
  ipcMain.handle('varak:saveKey', (e, provider, key) => {
    if (!trusted(e)) throw new Error('Geçersiz pencere.')
    saveKey(provider, key)
  })

  // Çeviri sürüyorsa önce sor; işlemdeki parça kaydedilince kapat.
  let checking = false
  win.on('close', async (e) => {
    if (quitting) return
    e.preventDefault()
    if (checking) return
    checking = true
    try {
      if (server && (await api('state')).busy) {
        const { response } = await dialog.showMessageBox(win, {
          type: 'question', buttons: ['Çeviriye dön', 'Kaydet ve kapat'], defaultId: 0, cancelId: 0,
          message: 'İşlemdeki parça kaydedilince kapatılsın mı?'
        })
        if (response === 0) return
        await api('pause')
        while (server && (await api('state')).busy) await new Promise((r) => setTimeout(r, 300))
      }
    } catch { /* sunucu yoksa doğrudan kapat */ } finally {
      checking = false
    }
    quitting = true
    win.close()
  })
  // Geliştirmede Vite birkaç saniye geç açılabilir.
  win.webContents.on('did-fail-load', (_e, code, _desc, failed) => {
    if (devUrl && code !== -3 && failed.startsWith(devUrl)) setTimeout(() => win?.loadURL(url), 500)
  })
  win.loadURL(url)
}

app.whenReady().then(async () => {
  try {
    await startServer()
    createWindow()
  } catch (e) {
    dialog.showErrorBox('Varak açılamadı', e.message)
    quitting = true
    app.quit()
  }
})

app.on('window-all-closed', () => app.quit())
app.on('will-quit', () => {
  quitting = true
  server?.stdin.end()
  server?.kill()
})
