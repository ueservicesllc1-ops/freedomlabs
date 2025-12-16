const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
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


  // Handle popup windows for OAuth and external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow OAuth popups
    if (url.includes('accounts.google.com') || url.includes('firebaseapp.com')) {
      return { action: 'allow' };
    }
    // Open external URLs (like Google Maps) in default browser
    if (url.includes('google.com/maps') || url.startsWith('http://') || url.startsWith('https://')) {
      const { shell } = require('electron');
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'deny' };
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Check for updates after a delay
  setTimeout(() => {
    checkForUpdates();

    // Also check periodically (every 4 hours)
    setInterval(() => {
      checkForUpdates();
    }, 4 * 60 * 60 * 1000);
  }, 5000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Configure auto-updater (already declared at top)
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Google Drive file ID
const DRIVE_FILE_ID = '1j_cwLaJkfgoimdzt7n7ecGvMfoCpW9_9';
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
    try {
      const response = await fetch(`https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`, {
        method: 'HEAD',
        redirect: 'follow'
      });

      const contentLength = response.headers.get('content-length');
      const lastModified = response.headers.get('last-modified');

      console.log('File info from Drive:', {
        contentLength,
        lastModified,
        status: response.status
      });

      const currentFileInfo = {
        size: contentLength ? parseInt(contentLength) : null,
        lastModified: lastModified,
        checkedAt: new Date().toISOString()
      };

      // Compare with last known info
      if (lastKnownInfo) {
        const sizeChanged = lastKnownInfo.size && currentFileInfo.size &&
          lastKnownInfo.size !== currentFileInfo.size;
        const dateChanged = lastKnownInfo.lastModified && currentFileInfo.lastModified &&
          lastKnownInfo.lastModified !== currentFileInfo.lastModified;

        if (sizeChanged || dateChanged) {
          console.log('New version detected!', {
            oldSize: lastKnownInfo.size,
            newSize: currentFileInfo.size,
            oldDate: lastKnownInfo.lastModified,
            newDate: currentFileInfo.lastModified
          });

          // Show update dialog
          showUpdateDialog();

          // Save new info
          fs.writeFileSync(infoPath, JSON.stringify(currentFileInfo, null, 2));
          return;
        } else {
          console.log('No update available - file unchanged');
        }
      } else {
        // First time checking - save current info
        console.log('First update check - saving file info');
        fs.writeFileSync(infoPath, JSON.stringify(currentFileInfo, null, 2));
      }

    } catch (fetchError) {
      console.error('Error fetching file info from Drive:', fetchError);
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
  if (mainWindow) {
    mainWindow.webContents.send('update-checking');
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
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
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available');
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available', info);
  }
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
  // Fallback: Use custom Google Drive download
  checkForUpdates();
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Velocidad de descarga: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Descargado ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
  if (mainWindow) {
    mainWindow.webContents.send('update-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  if (mainWindow) {
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
  }
});

