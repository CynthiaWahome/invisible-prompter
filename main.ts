import { app, BrowserWindow, ipcMain } from 'electron';

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
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setContentProtection(protectionEnabled);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover"
    />
    <title>Electron Shield Test</title>
    <style>
      :root {
        --panel-bg: linear-gradient(135deg, rgba(20, 20, 20, 0.78), rgba(40, 40, 40, 0.72));
        --panel-border: rgba(255, 255, 255, 0.2);
        --text: rgba(255, 255, 255, 0.92);
        --accent: #f39c12;
        --accent-strong: #ffb84a;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        background: transparent;
        color: var(--text);
        font-family: "Trebuchet MS", "Lucida Grande", "Segoe UI", sans-serif;
      }

      body {
        display: grid;
        place-items: center;
      }

      .panel {
        width: 320px;
        padding: 16px 18px;
        border-radius: 14px;
        border: 1px solid var(--panel-border);
        background: var(--panel-bg);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
        -webkit-app-region: drag;
        animation: float-in 420ms ease-out both;
      }

      .title {
        font-size: 15px;
        letter-spacing: 0.3px;
      }

      .status {
        color: var(--accent);
        font-weight: 700;
      }

      body[data-enabled="on"] .status {
        color: var(--accent-strong);
      }

      .hint {
        margin-top: 8px;
        font-size: 12px;
        line-height: 1.35;
        opacity: 0.8;
      }

      button {
        margin-top: 12px;
        width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.08);
        color: var(--text);
        font-weight: 600;
        cursor: pointer;
        transition: transform 150ms ease, background 150ms ease;
        -webkit-app-region: no-drag;
      }

      button:hover {
        transform: translateY(-1px);
        background: rgba(255, 255, 255, 0.14);
      }

      @keyframes float-in {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    </style>
  </head>
  <body data-enabled="off">
    <div class="panel">
      <div class="title">
        Content Protection: <span class="status" id="status">OFF</span>
      </div>
      <button id="toggle">Enable Protection</button>
      <div class="hint">
        Start your screen recorder. When protection is ON, this panel should
        vanish from recordings but remain visible here.
      </div>
    </div>
    <script>
      const { ipcRenderer } = require('electron');
      const statusEl = document.getElementById('status');
      const toggleBtn = document.getElementById('toggle');

      const setUi = (enabled) => {
        document.body.dataset.enabled = enabled ? 'on' : 'off';
        statusEl.textContent = enabled ? 'ON' : 'OFF';
        toggleBtn.textContent = enabled ? 'Disable Protection' : 'Enable Protection';
      };

      const init = async () => {
        const enabled = await ipcRenderer.invoke('get-protection-state');
        setUi(enabled);
      };

      toggleBtn.addEventListener('click', async () => {
        const enabled = await ipcRenderer.invoke('toggle-protection');
        setUi(enabled);
      });

      init();
    </script>
  </body>
</html>`;

  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

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
