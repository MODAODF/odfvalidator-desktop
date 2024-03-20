import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      checkJava: () => Promise<string | null>
      specifyOdfvalidatorPath: () => Promise<string | null>
      checkPlatformAndOdfvalidatorPath: () => Promise<string | null>
    }
  }
}
