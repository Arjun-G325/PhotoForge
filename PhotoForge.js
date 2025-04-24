const { app, BrowserWindow, ipcMain } = require('electron');
const sharp = require('sharp');

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

  mainWindow.hide();
  editorWindow.loadFile('UI_editor.html');

  editorWindow.on('closed', () => {
    editorWindow = null;
    mainWindow.show(); // show main window again when editor is closed
  });
}

// Open collage maker
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

const { dialog } = require('electron');
const path = require('path');

ipcMain.on("request-save-dialog", async (event) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Save Image As",
    defaultPath: "edited-image.png",
    filters: [
      { name: "PNG(.png)", extensions: ["png"] },
      { name: "JPEG(.jpg)", extensions: ["jpg", "jpeg"] },
      { name: "Bitmap(.bmp)", extensions: ["bmp"] },
      { name: "TIFF(.tiff)", extensions: ["tiff"] },
      { name: "WebP(.webp)", extensions: ["webp"] }
    ]
  });

  if (!canceled && filePath) {
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    event.sender.send("save-file-path", {
      filePath,
      extension: ext
    });
  }
});

ipcMain.on('save-as-tiff', async (event, { filePath, buffer }) => {
  try {
      await sharp(buffer)
          .tiff({ compression: 'lzw' })
          .toFile(filePath);

      console.log("TIFF saved:", filePath);
  } catch (err) {
      console.error("Error saving TIFF:", err);
  }
});

ipcMain.on("show-error-dialog", (event, { title, message }) => {
  const window = BrowserWindow.getFocusedWindow();
  dialog.showMessageBox(window, {
    type: "error",
    title: title || "Error",
    message: message || "An error occurred.",
    buttons: ["OK"]
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
