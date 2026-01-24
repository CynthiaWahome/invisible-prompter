import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let protectionEnabled = false;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 200,
    transparent: true,
    alwaysOnTop: true,
    frame: false,
    resizable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setContentProtection(protectionEnabled);
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

ipcMain.handle('toggle-protection', () => {
  protectionEnabled = !protectionEnabled;
  mainWindow?.setContentProtection(protectionEnabled);
  return protectionEnabled;
});

ipcMain.handle('get-protection-state', () => protectionEnabled);

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
