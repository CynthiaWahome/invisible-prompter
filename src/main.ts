import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { exec } from 'child_process';
import * as path from 'path';

type StatusPayload = {
  manualProtectionEnabled: boolean;
  effectiveProtection: boolean;
  autoHideEnabled: boolean;
  shareGuardActive: boolean;
  isHidden: boolean;
};

let mainWindow: BrowserWindow | null = null;
let manualProtectionEnabled = false;
let autoHideEnabled = false;
let shareGuardActive = false;
let userHidden = false;
let shareGuardTimer: NodeJS.Timeout | null = null;
let shareGuardChecking = false;

const shareAppMatchers = [
  /obs/i,
  /streamlabs/i,
  /xsplit/i,
  /bandicam/i,
  /camtasia/i,
  /snagit/i,
  /zoom/i,
  /teams/i,
  /webex/i,
  /gotomeeting/i,
  /discord/i,
  /slack/i,
  /loom/i,
  /screenflow/i,
];

const execAsync = (command: string) =>
  new Promise<string>((resolve) => {
    exec(command, { windowsHide: true }, (error, stdout) => {
      if (error) {
        resolve('');
        return;
      }
      resolve(stdout ?? '');
    });
  });

const listRunningProcesses = async () => {
  if (process.platform === 'win32') {
    const output = await execAsync('tasklist /FO CSV /NH');
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split('","')[0]?.replace(/^"|"$/g, '') ?? '')
      .filter(Boolean)
      .map((name) => name.toLowerCase());
  }

  const output = await execAsync('ps -A -o comm');
  return output
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => path.basename(name).toLowerCase());
};

const detectShareApps = async () => {
  const processes = await listRunningProcesses();
  if (processes.length === 0) {
    return false;
  }

  return processes.some((name) => shareAppMatchers.some((matcher) => matcher.test(name)));
};

const getStatusPayload = (): StatusPayload => {
  const effectiveProtection = manualProtectionEnabled || shareGuardActive;
  const isHidden = userHidden || (autoHideEnabled && shareGuardActive);
  return {
    manualProtectionEnabled,
    effectiveProtection,
    autoHideEnabled,
    shareGuardActive,
    isHidden,
  };
};

const emitStatus = () => {
  if (!mainWindow) {
    return;
  }
  mainWindow.webContents.send('status', getStatusPayload());
};

const applyWindowState = () => {
  if (!mainWindow) {
    return;
  }

  const { effectiveProtection, isHidden } = getStatusPayload();
  mainWindow.setContentProtection(effectiveProtection);

  if (isHidden) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    }
    return;
  }

  if (!mainWindow.isVisible()) {
    mainWindow.show();
  }
};

const startShareGuard = () => {
  if (shareGuardTimer) {
    return;
  }

  shareGuardTimer = setInterval(async () => {
    if (shareGuardChecking) {
      return;
    }
    shareGuardChecking = true;
    try {
      const active = await detectShareApps();
      if (active !== shareGuardActive) {
        shareGuardActive = active;
        applyWindowState();
        emitStatus();
      }
    } finally {
      shareGuardChecking = false;
    }
  }, 2000);
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 260,
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
  applyWindowState();
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  emitStatus();
};

ipcMain.handle('toggle-protection', () => {
  manualProtectionEnabled = !manualProtectionEnabled;
  applyWindowState();
  emitStatus();
  return getStatusPayload();
});

ipcMain.handle('toggle-auto-hide', () => {
  autoHideEnabled = !autoHideEnabled;
  applyWindowState();
  emitStatus();
  return getStatusPayload();
});

ipcMain.handle('get-status', () => getStatusPayload());

app.whenReady().then(() => {
  createWindow();
  startShareGuard();

  globalShortcut.register('CommandOrControl+Shift+H', () => {
    userHidden = !userHidden;
    applyWindowState();
    emitStatus();
  });

  globalShortcut.register('CommandOrControl+Shift+P', () => {
    manualProtectionEnabled = !manualProtectionEnabled;
    applyWindowState();
    emitStatus();
  });

  globalShortcut.register('CommandOrControl+Shift+A', () => {
    autoHideEnabled = !autoHideEnabled;
    applyWindowState();
    emitStatus();
  });
});

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (shareGuardTimer) {
    clearInterval(shareGuardTimer);
    shareGuardTimer = null;
  }
});
