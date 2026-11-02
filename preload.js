const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('resumeAPI', {
  saveFile: (data, filePath) => ipcRenderer.invoke('save-file', data, filePath),
  openFile: () => ipcRenderer.invoke('open-file'),
  exportPDF: (htmlString) => ipcRenderer.invoke('export-pdf', htmlString),
  setTitle: (title) => ipcRenderer.invoke('set-title', title),
  askToSave: (action) => ipcRenderer.invoke('ask-to-save', action),
  finishExit: (exit) => ipcRenderer.invoke('finish-exit', exit),
  onSaveAndExit: (callback) => {
    ipcRenderer.on('save-and-exit', (event, exit) => callback(exit));
  },
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  }
});
