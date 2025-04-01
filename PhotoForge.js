const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;
let editorWindow;
let collageWindow;

// 🛠️ Function to create the main window
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

// 🌟 Function to open the image editor
function openImageEditor() {
  if (mainWindow) {
    mainWindow.close();
    mainWindow = null;
  }

  editorWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  editorWindow.loadFile('UI_editor.html');

  editorWindow.on('closed', () => {
    editorWindow = null;
  });
}

// 🌟 Function to open the collage maker
function openCollageEditor() {
  if (mainWindow) {
    mainWindow.close();
    mainWindow = null;
  }

  collageWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  collageWindow.loadFile('UI_Collage.html');  // Load collage editor HTML

  collageWindow.on('closed', () => {
    collageWindow = null;
  });
}

// 🛠️ Listen for app ready event
app.whenReady().then(createWindow);

// ✅ Event handlers for opening editors
ipcMain.on('open-image-editor', openImageEditor);
ipcMain.on('open-collage-editor', openCollageEditor);

// 💡 Quit app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
