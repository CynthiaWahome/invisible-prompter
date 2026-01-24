import { contextBridge, ipcRenderer } from 'electron';

const api = {
  toggleProtection: () => ipcRenderer.invoke('toggle-protection') as Promise<boolean>,
  getProtectionState: () => ipcRenderer.invoke('get-protection-state') as Promise<boolean>,
};

contextBridge.exposeInMainWorld('clueless', api);
