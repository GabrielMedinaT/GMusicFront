const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  quit: () => ipcRenderer.invoke("app:quit"),
});
