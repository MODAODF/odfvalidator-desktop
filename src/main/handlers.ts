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
  console.log('[DEBUG] 從 store 獲取的 jarPath:', jarPath)
  
  if (!jarPath) {
    // If not set, use the default path
    jarPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'libs', 'odfvalidator-0.12.0-jar-with-dependencies.jar')
      : path.join(app.getAppPath(), 'public', 'libs', 'odfvalidator-0.12.0-jar-with-dependencies.jar')
    console.log('[DEBUG] 新設置的 jarPath:', jarPath)
    store.set('odfvalidatorPath', jarPath)
  }
  
  console.log('[DEBUG] 最終使用的 jarPath:', jarPath)
  return jarPath
}

function getOdfformatCheckerPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'libs', 'odfformat_checker-jar-with-dependencies.jar')
    : path.join(app.getAppPath(), 'public', 'libs', 'odfformat_checker-jar-with-dependencies.jar')
}

function canFixBySaveAs(errMsg: string, fileName: string): boolean {
  const escapedFileName = escapeRegExp(fileName);

  // 定義錯誤訊息的正則表達式，若有錯誤會以【整數 + errors】的形式呈現，無錯誤則會以【no errors】的形式呈現
  const manifestXmlErrorPattern: RegExp = new RegExp(`${escapedFileName}/META-INF/manifest.xml:\\s\\s+Info:\\s+(\\d+)\\s+errors`)
  const mimetypeErrorPattern: RegExp = new RegExp(`${escapedFileName}/mimetype:\\s\\s+Info:\\s+(\\d+)\\s+errors`);
  const summaryPattern: RegExp = new RegExp(`${escapedFileName}:\\s\\s+Info:\\s+(\\d+)\\s+errors`);

  // 檢查錯誤訊息是否符合預期的格式
  const manifestError: RegExpMatchArray | null  = errMsg.match(manifestXmlErrorPattern);
  const mimetypeMatch: RegExpMatchArray | null  = errMsg.match(mimetypeErrorPattern);
  const summary: RegExpMatchArray | null  = errMsg.match(summaryPattern);

  // 紀錄指定錯誤的數量
  const manifestErrorCount: number = manifestError ? parseInt(manifestError[1]) : 0
  const mimetypeMatchCount: number = mimetypeMatch ? parseInt(mimetypeMatch[1]) : 0
  const summaryCount: number = summary ? parseInt(summary[1]) : 0

  if (summaryCount !== 0 && manifestErrorCount + mimetypeMatchCount === summaryCount) {
    return true
  }
  return false
}
// 將字串轉換成正則表達式
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default class {
  public static initializeOdfvalidatorPath() {
    console.log('[DEBUG] 開始初始化 odfvalidator 路徑')
    store.clear()
    const jarPath = getOdfvalidatorPath()
    console.log('[DEBUG] 初始化完成，odfvalidator 路徑:', jarPath)
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
    const fileName: string = filePath.split('/').pop() || ''
    const rootDocVersionRegex: RegExp = /ODF version of root document: (\d+\.\d+)/
    const generatorRegex: RegExp = /Info: Generator: ((?:OxOffice\/\w+(\.\d+)*)|(\S+\/\d+(\.\d+)*))/
    const mimetypeRegex: RegExp = /Info: Media Type: (\S+)/

    try {
      const { stdout } = await execPromise(command)
      const rootDocVersionMatch: RegExpMatchArray | null = stdout.match(rootDocVersionRegex)
      const generatorMatch: RegExpMatchArray | null = stdout.match(generatorRegex)
      const mimetypeMatch: RegExpMatchArray | null = stdout.match(mimetypeRegex)

      return {
        standard: true,
        msg: `${fileName} 檔案符合標準的 ODF 格式`,
        rootDocVersion: rootDocVersionMatch ? rootDocVersionMatch[1] : undefined,
        generator: generatorMatch ? generatorMatch[1] : undefined,
        canFix: null,
        mimetype: mimetypeMatch ? mimetypeMatch[1] : undefined
      }
    } catch (error: Error | any) {
      console.error(`[ERROR] 檢測文件時發生錯誤:`, error)
      const errMsg = error.stdout
      const rootDocVersionMatch: RegExpMatchArray | null = errMsg.match(rootDocVersionRegex)
      const mimetypeMatch: RegExpMatchArray | null = errMsg.match(mimetypeRegex)

      if (rootDocVersionMatch !== null) {
        const generatorMatch: RegExpMatchArray | null = errMsg.match(generatorRegex)
        return {
          standard: false,
          msg: `${fileName} 檔案不符合標準的 ODF 格式`,
          rootDocVersion: rootDocVersionMatch ? rootDocVersionMatch[1] : undefined,
          generator: generatorMatch ? generatorMatch[1] : undefined,
          canFix: canFixBySaveAs(errMsg, fileName),
          mimetype: mimetypeMatch ? mimetypeMatch[1] : undefined
        }
      } else {
        return {
          standard: false,
          msg: `${fileName} 檔案非 ODF 文件格式`,
          rootDocVersion: undefined,
          generator: undefined,
          canFix: null,
          mimetype: mimetypeMatch ? mimetypeMatch[1] : undefined
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
      let odfformatResult = {
        hasLayoutGridIssues: false,
        hasPageBreakIssues: false,
        hasSpacingIssues: false
      }
      if (odfvalidatorResult.standard && odfvalidatorResult.mimetype === 'application/vnd.oasis.opendocument.text') {
        odfformatResult = await this.handleOdfformatChecker(filePath)
        console.log(`[DEBUG] ODF format 檢查結果:`, odfformatResult)
      }

      const entry = {
        [filePath]: [
          { standard: odfvalidatorResult.standard },
          { msg: odfvalidatorResult.msg },
          { rootDocVersion: odfvalidatorResult.rootDocVersion },
          { generator: odfvalidatorResult.generator },
          { canFix: odfvalidatorResult.canFix },
          { mimetype: odfvalidatorResult.mimetype },
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