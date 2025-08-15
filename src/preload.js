const { contextBridge, ipcRenderer } = require("electron");

// Exponer APIs seguras al contexto del renderer
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  openPath: (path) => ipcRenderer.invoke("open-path", path),
  showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  getStoragePath: () => ipcRenderer.invoke("get-storage-path"),
  getApiPort: () => ipcRenderer.invoke("get-api-port"),
});

// Configurar variables globales para el frontend
window.addEventListener("DOMContentLoaded", () => {
  // El frontend podrá acceder a estas variables
  if (!window.API_BASE_URL) {
    window.API_BASE_URL = "http://localhost:5000"; // fallback
  }
});
