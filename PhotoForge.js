const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;
let editorWindow;
let collageWindow;

// Create main window
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

// Open image editor
function openImageEditor() {
  if (editorWindow) return;

  editorWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.hide(); // just hide, don't close
  editorWindow.loadFile('UI_editor.html');

  editorWindow.on('closed', () => {
    editorWindow = null;
    mainWindow.show(); // show main window again when editor is closed
  });
}

// Open collage editor
function openCollageEditor() {
  if (collageWindow) return;

  collageWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.hide(); // again, just hide
  collageWindow.loadFile('UI_Collage.html');

  collageWindow.on('closed', () => {
    collageWindow = null;
    mainWindow.show(); // show main when collage is closed
  });
}

app.whenReady().then(createWindow);

ipcMain.on('open-image-editor', openImageEditor);
ipcMain.on('open-collage-editor', openCollageEditor);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
