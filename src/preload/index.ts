import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  checkJava: () => ipcRenderer.invoke('check-java'),
  specifyOdfvalidatorPath: () => ipcRenderer.invoke('specify-odfvalidator-path'),
  checkPlatformAndOdfvalidatorPath: () => ipcRenderer.invoke('check-windows-and-odfvalidator-path'),
  detectFile: (pathList: string[]) => ipcRenderer.invoke('detect-file', pathList)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
