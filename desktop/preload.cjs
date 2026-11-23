// Sandbox'lı preload CommonJS olmalı. Arayüze yalnızca masaüstüne özgü iki işlev açılır;
// geri kalan her şey sayfanın kendi HTTP API'sinden gider.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('varakDesktop', {
  choose: () => ipcRenderer.invoke('varak:choose'),
  saveKey: (provider, key) => ipcRenderer.invoke('varak:saveKey', provider, key)
})
