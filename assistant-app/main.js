const { app, BrowserWindow, ipcMain, powerMonitor, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const activeWin = require('active-win');
const screenshot = require('screenshot-desktop');


let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Handle popup windows for OAuth and Google Drive
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow OAuth popups and Google Drive links
    if (url.includes('accounts.google.com') ||
      url.includes('firebaseapp.com') ||
      url.includes('drive.google.com') ||
      url.includes('google.com')) {
      return { action: 'allow' };
    }
    // For other URLs, open in default browser
    const { shell } = require('electron');
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Monitor window state changes
  mainWindow.on('minimize', () => {
    mainWindow.webContents.send('window-minimized');
  });

  mainWindow.on('restore', () => {
    mainWindow.webContents.send('window-restored');
  });

  mainWindow.on('show', () => {
    mainWindow.webContents.send('window-shown');
  });

  // Monitor system activity
  powerMonitor.on('resume', () => {
    mainWindow.webContents.send('system-active');
  });

  powerMonitor.on('suspend', () => {
    mainWindow.webContents.send('system-inactive');
  });

  powerMonitor.on('unlock-screen', () => {
    mainWindow.webContents.send('system-active');
  });

  powerMonitor.on('lock-screen', () => {
    mainWindow.webContents.send('system-inactive');
  });

  // Handle window close - give renderer time to update status
  mainWindow.on('close', (event) => {
    // Send message to renderer to update status before closing
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app-will-close');
      // Prevent immediate close, give time for status update
      event.preventDefault();
      // Wait 2 seconds to ensure Firebase update completes
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.destroy();
        }
      }, 2000); // Increased from 1000 to 2000ms
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Auto-updates disabled - using manual notifications instead

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Handle app quit - ensure status is updated
app.on('before-quit', (event) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('app-will-close');
    // Give time for status update before quitting
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.destroy();
      }
    }, 1000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app version and build
ipcMain.handle('get-app-version', () => {
  const packagePath = path.join(__dirname, 'package.json');
  let buildNumber = 'N/A';

  try {
    if (fs.existsSync(packagePath)) {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      buildNumber = packageData.buildNumber || 'N/A';
    }
  } catch (e) {
    console.log('Could not read build number from package.json:', e);
  }

  return {
    version: app.getVersion(),
    buildNumber: buildNumber
  };
});

// Helper function to get build number
function getBuildNumber() {
  const packagePath = path.join(__dirname, 'package.json');
  try {
    if (fs.existsSync(packagePath)) {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageData.buildNumber || 'N/A';
    }
  } catch (e) {
    console.log('Could not read build number:', e);
  }
  return 'N/A';
}

// Handle manual update check request from renderer
ipcMain.handle('check-for-updates', async (event, forceCheck = false) => {
  console.log('Manual update check requested', { forceCheck });

  // If force check, clear the cached file info
  if (forceCheck) {
    const infoPath = getUpdateInfoPath();
    try {
      if (fs.existsSync(infoPath)) {
        fs.unlinkSync(infoPath);
        console.log('Cleared cached update info for forced check');
      }
    } catch (e) {
      console.log('Error clearing update info:', e);
    }
  }

  await checkForUpdates();
  return true;
});

// Configure auto-updater
autoUpdater.autoDownload = false; // We'll handle download manually
autoUpdater.autoInstallOnAppQuit = true;

// Google Drive file ID from: https://drive.google.com/file/d/1DWH-pq1rADzaAHnjeRgSzoAbFKk9wOXS/view?usp=sharing
const DRIVE_FILE_ID = '1DWH-pq1rADzaAHnjeRgSzoAbFKk9wOXS';
const UPDATE_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;
const DRIVE_VIEW_URL = `https://drive.google.com/file/d/${DRIVE_FILE_ID}/view?usp=sharing`;

// Path to store last known file info
function getUpdateInfoPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'update-info.json');
}

// Custom update checker for Google Drive
async function checkForUpdates() {
  try {
    console.log('Checking for updates from Google Drive...');
    const currentVersion = app.getVersion();
    console.log('Current app version:', currentVersion);

    if (!mainWindow) return;

    // Read last known file info
    let lastKnownInfo = null;
    const infoPath = getUpdateInfoPath();
    try {
      if (fs.existsSync(infoPath)) {
        const data = fs.readFileSync(infoPath, 'utf8');
        lastKnownInfo = JSON.parse(data);
        console.log('Last known file info:', lastKnownInfo);
      }
    } catch (e) {
      console.log('No previous update info found');
    }

    // Fetch file info from Google Drive
    // Try multiple methods to get reliable file size
    try {
      console.log('Fetching file info from Google Drive...');

      let fileSize = null;
      let lastModified = null;

      // Method 1: Try HEAD request first
      try {
        const headResponse = await fetch(`https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`, {
          method: 'HEAD',
          redirect: 'follow'
        });

        fileSize = headResponse.headers.get('content-length');
        lastModified = headResponse.headers.get('last-modified') || headResponse.headers.get('date');

        console.log('HEAD response:', {
          status: headResponse.status,
          contentLength: fileSize,
          lastModified: lastModified,
          url: headResponse.url
        });
      } catch (headError) {
        console.log('HEAD request failed, trying GET:', headError.message);
      }

      // Method 2: If HEAD didn't work, try GET with Range header to get file size
      if (!fileSize) {
        try {
          const rangeResponse = await fetch(`https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`, {
            method: 'GET',
            redirect: 'follow',
            headers: {
              'Range': 'bytes=0-1023' // Request first 1KB to get headers
            }
          });

          const contentRange = rangeResponse.headers.get('content-range');
          if (contentRange) {
            // Parse Content-Range: bytes 0-1023/12345678
            const match = contentRange.match(/\/(\d+)/);
            if (match) {
              fileSize = parseInt(match[1]);
            }
          } else {
            fileSize = rangeResponse.headers.get('content-length');
          }

          lastModified = rangeResponse.headers.get('last-modified') || rangeResponse.headers.get('date');

          console.log('Range GET response:', {
            status: rangeResponse.status,
            contentRange: contentRange,
            contentLength: fileSize,
            lastModified: lastModified
          });
        } catch (rangeError) {
          console.log('Range request failed:', rangeError.message);
        }
      }

      // Method 3: Last resort - try to get actual file size by checking response
      if (!fileSize) {
        try {
          console.log('Trying full GET to determine file size...');
          const fullResponse = await fetch(`https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`, {
            method: 'GET',
            redirect: 'follow'
          });

          // Read just enough to determine if file exists and get size hint
          const reader = fullResponse.body.getReader();
          let totalBytes = 0;
          let chunk;
          let maxBytesToRead = 10240; // Read max 10KB to determine size

          while (totalBytes < maxBytesToRead) {
            chunk = await reader.read();
            if (chunk.done) break;
            totalBytes += chunk.value.length;
          }

          reader.cancel(); // Cancel the rest

          // Try to get size from Content-Length header
          fileSize = fullResponse.headers.get('content-length');
          lastModified = fullResponse.headers.get('last-modified') || fullResponse.headers.get('date');

          console.log('Full GET response (partial read):', {
            status: fullResponse.status,
            contentLength: fileSize,
            bytesRead: totalBytes,
            lastModified: lastModified
          });
        } catch (fullError) {
          console.log('Full GET request failed:', fullError.message);
        }
      }

      // Use current timestamp as fallback for lastModified if not available
      if (!lastModified) {
        lastModified = new Date().toISOString();
      }

      const currentFileInfo = {
        size: fileSize ? parseInt(fileSize) : null,
        lastModified: lastModified,
        checkedAt: new Date().toISOString()
      };

      console.log('Final file info:', currentFileInfo);
      console.log('Last known info:', lastKnownInfo);

      // Compare with last known info
      if (lastKnownInfo) {
        const sizeChanged = lastKnownInfo.size && currentFileInfo.size &&
          lastKnownInfo.size !== currentFileInfo.size;
        const dateChanged = lastKnownInfo.lastModified && currentFileInfo.lastModified &&
          lastKnownInfo.lastModified !== currentFileInfo.lastModified;

        console.log('Comparison:', {
          sizeChanged: sizeChanged,
          dateChanged: dateChanged,
          oldSize: lastKnownInfo.size,
          newSize: currentFileInfo.size,
          oldDate: lastKnownInfo.lastModified,
          newDate: currentFileInfo.lastModified
        });

        if (sizeChanged || dateChanged) {
          console.log('New version detected!');

          // Show update dialog
          showUpdateDialog();

          // Save new info
          fs.writeFileSync(infoPath, JSON.stringify(currentFileInfo, null, 2));
          return;
        } else {
          console.log('No update available - file unchanged');
          // Show message to user that no update is available
          if (mainWindow && !mainWindow.isDestroyed()) {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sin actualizaciones',
              message: 'Ya tienes la última versión instalada',
              detail: `Versión actual: ${app.getVersion()}\nBuild: ${getBuildNumber()}\n\nÚltima verificación: ${new Date().toLocaleString()}`,
              buttons: ['OK'],
              defaultId: 0
            }).catch(err => console.log('Error showing no-update dialog:', err));
          }
        }
      } else {
        // First time checking - save current info
        console.log('First update check - saving file info');
        fs.writeFileSync(infoPath, JSON.stringify(currentFileInfo, null, 2));
        // Show message that this is first check
        if (mainWindow && !mainWindow.isDestroyed()) {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Verificación completada',
            message: 'Sistema de actualizaciones configurado',
            detail: `Versión actual: ${app.getVersion()}\nBuild: ${getBuildNumber()}\n\nSe verificará automáticamente cada 30 minutos.`,
            buttons: ['OK'],
            defaultId: 0
          }).catch(err => console.log('Error showing first-check dialog:', err));
        }
      }

    } catch (fetchError) {
      console.error('Error fetching file info from Drive:', fetchError);
      console.error('Error details:', {
        message: fetchError.message,
        stack: fetchError.stack,
        url: `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`
      });

      // Show error to user if window is available
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-check-error', fetchError.message);
      }
    }

  } catch (error) {
    console.error('Error checking for updates:', error);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', error.message);
    }
  }
}

// Function to show update dialog
async function showUpdateDialog() {
  try {
    const { shell } = require('electron');

    const result = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Actualización disponible',
      message: 'Hay una nueva versión disponible',
      detail: 'Se ha detectado una nueva versión en Google Drive. ¿Deseas descargarla ahora?\n\nSe abrirá Google Drive para que puedas descargar el instalador.',
      buttons: ['Sí, descargar ahora', 'Más tarde'],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      // Open download link in browser
      shell.openExternal(DRIVE_VIEW_URL);

      console.log('Opened Google Drive download link');
    }
  } catch (error) {
    console.error('Error showing update dialog:', error);
  }
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
  mainWindow.webContents.send('update-checking');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
  mainWindow.webContents.send('update-available', info);

  // Ask user if they want to download
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización disponible',
    message: 'Hay una nueva versión disponible. ¿Deseas descargarla ahora?',
    buttons: ['Sí', 'Más tarde'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available');
  mainWindow.webContents.send('update-not-available', info);
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
  mainWindow.webContents.send('update-error', err.message);

  // Fallback: Use custom Google Drive download
  checkForUpdates();
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Velocidad de descarga: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Descargado ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
  mainWindow.webContents.send('update-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  mainWindow.webContents.send('update-downloaded', info);

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización descargada',
    message: 'La actualización se ha descargado. La aplicación se reiniciará para instalar la actualización.',
    buttons: ['Reiniciar ahora', 'Más tarde'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// Check for updates when app is ready (moved to existing app.whenReady)

// IPC Handlers for Productivity Tracking

// Get active window information
ipcMain.handle('get-active-window', async () => {
  try {
    const window = await activeWin();
    if (!window) {
      return null;
    }
    return {
      appName: window.owner.name,
      windowTitle: window.title,
      bounds: window.bounds
    };
  } catch (error) {
    console.error('Error getting active window:', error);
    return null;
  }
});

// Take screenshot
ipcMain.handle('take-screenshot', async (event, userId) => {
  try {
    const img = await screenshot({ format: 'jpg', quality: 60 });
    // Return as base64 string
    const base64 = img.toString('base64');
    return base64;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return null;
  }
});

