import { contextBridge, ipcRenderer } from 'electron';

type StatusPayload = {
  manualProtectionEnabled: boolean;
  effectiveProtection: boolean;
  autoHideEnabled: boolean;
  shareGuardActive: boolean;
  isHidden: boolean;
};

const api = {
  toggleProtection: () => ipcRenderer.invoke('toggle-protection') as Promise<StatusPayload>,
  toggleAutoHide: () => ipcRenderer.invoke('toggle-auto-hide') as Promise<StatusPayload>,
  getStatus: () => ipcRenderer.invoke('get-status') as Promise<StatusPayload>,
  onStatus: (listener: (status: StatusPayload) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, status: StatusPayload) => {
      listener(status);
    };
    ipcRenderer.on('status', wrapped);
    return () => ipcRenderer.removeListener('status', wrapped);
  },
};

contextBridge.exposeInMainWorld('clueless', api);
