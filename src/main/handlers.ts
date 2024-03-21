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
    let result: unknown
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
      const fileName = path.basename(filePath[0])
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

    if (storeedOdfvalidatorPath) {
      return storeedOdfvalidatorPath
    }

    // FIXME: Not working on Windows
    if (platform === 'win32') {
      const odftoolkitPath: string = 'C:\\odftoolkit'
      const fileNamePattern: string = 'odfvalidator-*-jar-with-dependencies.jar'

      const searchPattern = path.join(odftoolkitPath, fileNamePattern)

      try {
        const files = await glob(searchPattern)
        saveOdfvalidatorPathToElectronStore(files[0])
        return files[0]
      } catch (error) {
        console.error(error)
      }
    }

    if (platform === 'linux') {
      const odftoolkitPath: string = '/usr/local/odftoolkit'
      const fileNamePattern: string = 'odfvalidator-*-jar-with-dependencies.jar'

      const searchPattern = path.join(odftoolkitPath, fileNamePattern)

      try {
        const files = await glob(searchPattern)
        saveOdfvalidatorPathToElectronStore(files[0])
        return files[0]
      } catch (error) {
        console.error(error)
      }
    }
    return null
  }
}
