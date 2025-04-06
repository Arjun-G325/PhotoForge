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

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'history.db');
const db = new sqlite3.Database(dbPath);

// 🗃️ Create undo and redo tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS undo_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    data TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS redo_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    data TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// 📥 Save action into undo_history and clear redo
ipcMain.handle('save-action', async (event, action, data) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM redo_history'); // Clear redo stack on new action
      db.run('INSERT INTO undo_history (action, data) VALUES (?, ?)', [action, data], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  });
});

// 🔁 Undo: move last undo to redo
ipcMain.handle('undo-action', async () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM undo_history ORDER BY id DESC LIMIT 1', [], (err, row) => {
      if (err) reject(err);
      else if (row) {
        db.serialize(() => {
          db.run('INSERT INTO redo_history (action, data) VALUES (?, ?)', [row.action, row.data]);
          db.run('DELETE FROM undo_history WHERE id = ?', [row.id]);
          resolve(row);
        });
      } else {
        resolve(null);
      }
    });
  });
});

// 🔄 Redo: move last redo to undo
ipcMain.handle('redo-action', async () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM redo_history ORDER BY id DESC LIMIT 1', [], (err, row) => {
      if (err) reject(err);
      else if (row) {
        db.serialize(() => {
          db.run('INSERT INTO undo_history (action, data) VALUES (?, ?)', [row.action, row.data]);
          db.run('DELETE FROM redo_history WHERE id = ?', [row.id]);
          resolve(row);
        });
      } else {
        resolve(null);
      }
    });
  });
});

