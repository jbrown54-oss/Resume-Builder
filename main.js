const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow;
let pendingExit = null;

function askToSave(action) {
  const choice = dialog.showMessageBoxSync(mainWindow, {
    type: 'warning',
    buttons: ['Save', "Don't Save", 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    message: `Save changes to your resume before ${action}?`,
    detail: "Your changes will be lost if you don't save them."
  });
  return ['save', 'discard', 'cancel'][choice];
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'Resume Builder'
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // 'close' fires before the renderer's beforeunload; a reload never fires it.
  mainWindow.on('close', () => {
    if (!pendingExit) pendingExit = 'close';
  });

  // The renderer blocks unload while it has unsaved changes.
  mainWindow.webContents.on('will-prevent-unload', event => {
    const exit = pendingExit || 'reload';
    pendingExit = null;
    const choice = askToSave({ close: 'closing', quit: 'quitting', reload: 'reloading' }[exit]);
    if (choice === 'discard') event.preventDefault();
    else if (choice === 'save') mainWindow.webContents.send('save-and-exit', exit);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    pendingExit = null;
  });
}

function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow && mainWindow.webContents.send('menu-action', 'new')
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow && mainWindow.webContents.send('menu-action', 'open')
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow && mainWindow.webContents.send('menu-action', 'save')
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow && mainWindow.webContents.send('menu-action', 'save-as')
        },
        { type: 'separator' },
        {
          label: 'Export PDF...',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow && mainWindow.webContents.send('menu-action', 'export-pdf')
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ── IPC: save-file ──────────────────────────────────────────────────────────
ipcMain.handle('save-file', async (event, data, filePath) => {
  try {
    let savePath = filePath;
    if (!savePath) {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Resume',
        defaultPath: 'resume.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });
      if (result.canceled) return { success: false };
      savePath = result.filePath;
    }
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, filePath: savePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ── IPC: open-file ──────────────────────────────────────────────────────────
ipcMain.handle('open-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Resume',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile']
    });
    if (result.canceled || result.filePaths.length === 0) return { success: false };
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return { success: true, data, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ── IPC: export-pdf ─────────────────────────────────────────────────────────
ipcMain.handle('export-pdf', async (event, htmlString) => {
  let pdfWindow = null;
  try {
    const tmpFile = path.join(os.tmpdir(), 'resume-preview.html');
    fs.writeFileSync(tmpFile, htmlString, 'utf-8');

    pdfWindow = new BrowserWindow({
      width: 816,
      height: 1056,
      show: false,
      webPreferences: { contextIsolation: true }
    });

    await pdfWindow.loadFile(tmpFile);

    const pdfBuffer = await pdfWindow.webContents.printToPDF({
      pageSize: 'Letter',
      printBackground: true,
      preferCSSPageSize: true
    });

    pdfWindow.destroy();
    pdfWindow = null;

    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export PDF',
      defaultPath: 'resume.pdf',
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });
    if (result.canceled) return { success: false };

    fs.writeFileSync(result.filePath, pdfBuffer);
    return { success: true, filePath: result.filePath };
  } catch (err) {
    if (pdfWindow) pdfWindow.destroy();
    return { success: false, error: err.message };
  }
});

// ── IPC: set-title ──────────────────────────────────────────────────────────
ipcMain.handle('set-title', (event, title) => {
  if (mainWindow) mainWindow.setTitle(title);
});

// ── IPC: unsaved-changes prompts ────────────────────────────────────────────
ipcMain.handle('ask-to-save', (event, action) => askToSave(action));

ipcMain.handle('finish-exit', (event, exit) => {
  if (exit === 'quit') return app.quit();
  if (!mainWindow) return;
  if (exit === 'close') mainWindow.close();
  else mainWindow.webContents.reload();
});

// ── App lifecycle ───────────────────────────────────────────────────────────
app.on('before-quit', () => {
  pendingExit = 'quit';
});

app.whenReady().then(() => {
  createWindow();
  buildMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
