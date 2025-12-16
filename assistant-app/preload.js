const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: (forceCheck) => ipcRenderer.invoke('check-for-updates', forceCheck),
  platform: process.platform,

  // App lifecycle events
  onAppWillClose: (callback) => {
    ipcRenderer.on('app-will-close', callback);
  },

  // Window state events
  onWindowMinimized: (callback) => {
    ipcRenderer.on('window-minimized', callback);
  },
  onWindowRestored: (callback) => {
    ipcRenderer.on('window-restored', callback);
  },
  onWindowShown: (callback) => {
    ipcRenderer.on('window-shown', callback);
  },

  // System events
  onSystemActive: (callback) => {
    ipcRenderer.on('system-active', callback);
  },
  onSystemInactive: (callback) => {
    ipcRenderer.on('system-inactive', callback);
  },

  // Update events
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
  onUpdateCheckError: (callback) => {
    ipcRenderer.on('update-check-error', (event, message) => callback(message));
  },
  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-progress', (event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (event, info) => callback(info));
  },

  // Productivity tracking functions
  getActiveWindow: () => ipcRenderer.invoke('get-active-window'),
  takeScreenshot: (userId) => ipcRenderer.invoke('take-screenshot', userId)
});
