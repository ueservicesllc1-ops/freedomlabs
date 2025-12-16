const { contextBridge, ipcRenderer, shell } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
  openExternal: (url) => shell.openExternal(url),

  // Update events listeners
  onUpdateChecking: (callback) => {
    ipcRenderer.on('update-checking', callback);
  },
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, info) => callback(info));
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.on('update-not-available', (event, info) => callback(info));
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', (event, message) => callback(message));
  },
  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-progress', (event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (event, info) => callback(info));
  }
});
