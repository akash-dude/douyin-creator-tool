// preload.js — contextBridge 安全桥接
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
  },

  // request → response
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),

  // main → renderer push
  on: (channel, callback) => {
    const handler = (_event, ...args) => callback(...args)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },

  // fire-and-forget
  send: (channel, ...args) => ipcRenderer.send(channel, ...args)
})
