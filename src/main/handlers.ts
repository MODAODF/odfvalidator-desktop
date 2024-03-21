import { exec } from 'child_process'
import { dialog } from 'electron'
import { glob } from 'glob'
import path from 'path'
import util from 'util'
import Store from 'electron-store'

const store = new Store()
const execPromise = util.promisify(exec)

function saveOdfvalidatorPathToElectronStore(path: string) {
  store.set('odfvalidatorPath', path)
}

function getOdfvalidatorPathFromElectronStore(): string | undefined {
  return store.get('odfvalidatorPath') as string | undefined
}

export default class {
  public static async checkJavaHandler(): Promise<string | null> {
    let result: string | null
    const { stdout, stderr } = await execPromise('java --version')
    if (stderr) {
      console.error('stderr:', stderr)
      result = null
    } else {
      console.log('stdout:', stdout)
      result = stdout
    }

    if (typeof result === 'string') {
      return result
    } else {
      return result as null
    }
  }

  public static specifyOdfvalidatorPathHandler(): string | null {
    const filePath: string[] | undefined = dialog.showOpenDialogSync({ properties: ['openFile'] })
    if (filePath) {
      const regex: RegExp = /odfvalidator-.*-jar-with-dependencies.jar/
      const fileName: string = path.basename(filePath[0])

      // Check if the file is odfvalidator jar file
      if (regex.test(fileName)) {
        saveOdfvalidatorPathToElectronStore(filePath[0])
        return filePath[0]
      }
    }

    return null
  }

  public static async checkPlatformAndOdfvalidatorPathHandler(): Promise<string | null> {
    const platform: string = process.platform
    const storeedOdfvalidatorPath: string | undefined = getOdfvalidatorPathFromElectronStore()

    // Use the stored path if it exists
    if (storeedOdfvalidatorPath) {
      return storeedOdfvalidatorPath
    }

    let odftoolkitPath: string

    // FIXME: Not working on Windows
    if (platform === 'win32') {
      odftoolkitPath = 'C:\\odftoolkit'
    } else {
      // For Unix-like OS
      odftoolkitPath = '/usr/local/odftoolkit'
    }

    const fileNamePattern: string = 'odfvalidator-*-jar-with-dependencies.jar'
    const searchPattern: string = path.join(odftoolkitPath, fileNamePattern)

    try {
      const files: string[] = await glob(searchPattern)
      saveOdfvalidatorPathToElectronStore(files[0])
      return files[0]
    } catch (error) {
      console.error(error)
    }
    return null
  }
}
