const { app, BrowserWindow, BrowserView } = require('electron');
const path = require('path');

let mainWindow;
let browserView;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Create browser view for web content
  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setBrowserView(browserView);
  
  // Position the browser view (leave space for navigation bar - 60px)
  const bounds = mainWindow.getContentBounds();
  browserView.setBounds({ x: 0, y: 60, width: bounds.width, height: bounds.height - 60 });
  browserView.setAutoResize({ width: true, height: true });

  // Hide browser view initially
  mainWindow.removeBrowserView(browserView);

  mainWindow.loadFile('index.html');

  // Handle window resize
  mainWindow.on('resize', () => {
    if (mainWindow.getBrowserView()) {
      const bounds = mainWindow.getContentBounds();
      browserView.setBounds({ x: 0, y: 60, width: bounds.width, height: bounds.height - 60 });
    }
  });
}

app.whenReady().then(() => {
  createWindow();

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

// Expose functions to renderer
const { ipcMain } = require('electron');

ipcMain.on('load-url', (event, url) => {
  mainWindow.setBrowserView(browserView);
  const bounds = mainWindow.getContentBounds();
  browserView.setBounds({ x: 0, y: 60, width: bounds.width, height: bounds.height - 60 });
  browserView.webContents.loadURL(url);
});

ipcMain.on('load-search', (event, searchPath, query) => {
  mainWindow.setBrowserView(browserView);
  const bounds = mainWindow.getContentBounds();
  browserView.setBounds({ x: 0, y: 60, width: bounds.width, height: bounds.height - 60 });
  browserView.webContents.loadFile(searchPath, { query: { q: query } });
});

ipcMain.on('go-home', () => {
  mainWindow.removeBrowserView(browserView);
});

ipcMain.on('go-back', () => {
  if (browserView.webContents.canGoBack()) {
    browserView.webContents.goBack();
  }
});

ipcMain.on('go-forward', () => {
  if (browserView.webContents.canGoForward()) {
    browserView.webContents.goForward();
  }
});

ipcMain.on('refresh', () => {
  browserView.webContents.reload();
});

// Send URL updates back to renderer
setInterval(() => {
  if (mainWindow && browserView && mainWindow.getBrowserView()) {
    const url = browserView.webContents.getURL();
    mainWindow.webContents.send('url-changed', url);
  }
}, 500);
