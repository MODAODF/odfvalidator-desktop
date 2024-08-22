import { exec } from 'child_process'
import { app } from 'electron'
import { glob } from 'glob'
import path from 'path'
import util from 'util'
import Store from 'electron-store'

const store = new Store()
const execPromise = util.promisify(exec)

function getOdfvalidatorPath(): string {
  let jarPath = store.get('odfvalidatorPath') as string | undefined
  if (!jarPath) {
    // If not set, use the default path
    jarPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'libs', 'odfvalidator-0.12.0-jar-with-dependencies.jar')
      : path.join(app.getAppPath(), 'public', 'libs', 'odfvalidator-0.12.0-jar-with-dependencies.jar')
    store.set('odfvalidatorPath', jarPath)
  }
  return jarPath
}

function getOdfformatCheckerPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'libs', 'odfformat_checker-jar-with-dependencies.jar')
    : path.join(app.getAppPath(), 'public', 'libs', 'odfformat_checker-jar-with-dependencies.jar')
}

export default class {
  public static initializeOdfvalidatorPath() {
    store.delete('odfvalidatorPath') // 原本electron store裡的'odfvalidatorPath'值，即使原始碼更改了，再次執行electron也不會變更，因此初始化時將原有的值清空
    const jarPath = getOdfvalidatorPath()
    console.log('Initialized odfvalidator path:', jarPath)
  }
  public static async checkJavaHandler(): Promise<string | null> {
    try {
      const { stdout, stderr } = await execPromise('java --version')
      if (stderr) {
        console.error('stderr:', stderr)
        return null
      }
      console.log('stdout:', stdout)
      return stdout
    } catch (error) {
      console.error('Error checking Java version:', error)
      return null
    }
  }

  private static async handleOdfvalidator(filePath: string, odftoolkitPath: string): Promise<any> {
    const command = `java -jar "${odftoolkitPath}" "${filePath}" -v -e`
    const fileName = filePath.split('/').pop()
    const rootDocVersionRegex: RegExp = /ODF version of root document: (\d+\.\d+)/
    const generatorRegex: RegExp = /Info: Generator: ((?:OxOffice\/\w+(\.\d+)*)|(\S+\/\d+(\.\d+)*))/

    try {
      const { stdout } = await execPromise(command)
      const rootDocVersionMatch: RegExpMatchArray | null = stdout.match(rootDocVersionRegex)
      const generatorMatch: RegExpMatchArray | null = stdout.match(generatorRegex)

      return {
        standard: true,
        msg: `${fileName} 檔案符合標準的 ODF 格式`,
        rootDocVersion: rootDocVersionMatch ? rootDocVersionMatch[1] : undefined,
        generator: generatorMatch ? generatorMatch[1] : undefined
      }
    } catch (error: Error | any) {
      console.error(`[ERROR] 檢測文件時發生錯誤:`, error)
      const errMsg = error.stdout
      const rootDocVersionMatch: RegExpMatchArray | null = errMsg.match(rootDocVersionRegex)

      if (rootDocVersionMatch !== null) {
        const generatorMatch: RegExpMatchArray | null = errMsg.match(generatorRegex)
        return {
          standard: false,
          msg: `${fileName} 檔案不符合標準的 ODF 格式`,
          rootDocVersion: rootDocVersionMatch ? rootDocVersionMatch[1] : undefined,
          generator: generatorMatch ? generatorMatch[1] : undefined,
          canFix: false
        }
      } else {
        return {
          standard: false,
          msg: `${fileName} 檔案非 ODF 文件格式`,
          rootDocVersion: undefined,
          generator: undefined
        }
      }
    }
  }

  private static async handleOdfformatChecker(filePath: string): Promise<any> {
    const checkerPath = getOdfformatCheckerPath()
    const command = `java -jar "${checkerPath}" "${filePath}"`

    try {
      const { stdout } = await execPromise(command)
      const result = JSON.parse(stdout)
      return {
        hasPageBreakIssues: result.hasPageBreakIssues,
        hasLayoutGridIssues: result.hasLayoutGridIssues,
        hasSpacingIssues: result.hasSpacingIssues
      }
    } catch (error) {
      console.error(`[ERROR] ODF format 檢查失敗:`, error)
      throw error
    }
  }

  public static async detectFileHandler(pathList: string[]): Promise<object[] | null> {
    const platform: string = process.platform

    let odftoolkitPath: string | undefined = getOdfvalidatorPath()
    console.log('Odfvalidator path:', odftoolkitPath)
    if (!odftoolkitPath) {
      console.error('Unable to locate odfvalidator jar file')
      return null
    }

    if (platform === 'win32') {
      const odftoolkit: string[] = await glob(odftoolkitPath as string, {
        windowsPathsNoEscape: true
      })
      odftoolkitPath = odftoolkit[0]
    }
    const result: object[] = []

    for (const filePath of pathList) {
      console.log(`[DEBUG] 開始處理文件: ${filePath}`)
      console.log(`[DEBUG] jar path: ${odftoolkitPath}`)
      // 執行 Odfvalidator 檢查
      console.log(`[DEBUG] 開始執行 Odfvalidator 檢查`)
      const odfvalidatorResult = await this.handleOdfvalidator(filePath, odftoolkitPath)
      console.log(`[DEBUG] ODFDOM 檢查結果:`, odfvalidatorResult)

      console.log(`[DEBUG] 開始執行 ODF format 檢查`)
      const odfformatResult = await this.handleOdfformatChecker(filePath)
      console.log(`[DEBUG] ODF format 檢查結果:`, odfformatResult)

      const entry = {
        [filePath]: [
          { standard: odfvalidatorResult.standard },
          { msg: odfvalidatorResult.msg },
          { rootDocVersion: odfvalidatorResult.rootDocVersion },
          { generator: odfvalidatorResult.generator },
          { canFix: odfvalidatorResult.canFix },
          { layoutGridHasIssue: odfformatResult.hasLayoutGridIssues },
          { pageBreakHasIssue: odfformatResult.hasPageBreakIssues },
          { spaceHasIssue: odfformatResult.hasSpacingIssues }
        ]
      }
      result.push(entry)
    }
    return result
  }
}