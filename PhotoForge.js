const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadFile('UI.html')
}

app.whenReady().then(createWindow)
