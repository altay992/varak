const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('varak',{call:(name,data={})=>ipcRenderer.invoke('varak',name,data)});
