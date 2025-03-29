const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('UI.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

ipcMain.on('open-image-editor', (event) => {
  if (mainWindow) {
    mainWindow.close();
    mainWindow = null;
  }

  const editorWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  editorWindow.loadFile('UI_editor.html');
});

