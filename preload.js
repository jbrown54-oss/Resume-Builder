const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('resumeAPI', {
  saveFile: (data, filePath) => ipcRenderer.invoke('save-file', data, filePath),
  openFile: () => ipcRenderer.invoke('open-file'),
  exportPDF: (htmlString) => ipcRenderer.invoke('export-pdf', htmlString),
  setTitle: (title) => ipcRenderer.invoke('set-title', title),
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  }
});
