import { exec } from 'child_process'
import { app } from 'electron'
import { glob } from 'glob'
import path from 'path'
import util from 'util'
import Store from 'electron-store'
import os from 'os'
import crypto from 'crypto'
import rimraf from 'rimraf'
import { runOdfdomCheck } from '../odfdomchecker/odfdomchecker'
import { OdfdomCheckResult } from '../odfdomchecker/type'

const store = new Store()
const execPromise = util.promisify(exec)

function getOdfvalidatorPath(): string | undefined {
  let jarPath = store.get('odfvalidatorPath') as string | undefined
  if (!jarPath) {
    // If not set, use the default path
    jarPath = path.join(
      app.getAppPath(),
      'public/libs/odfvalidator-0.12.0-jar-with-dependencies.jar'
    )
    store.set('odfvalidatorPath', jarPath)
  }
  return jarPath
}

export default class {
  public static initializeOdfvalidatorPath() {
    const jarPath = getOdfvalidatorPath()
    console.log('Initialized odfvalidator path:', jarPath)
  }
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
      const command = `java -jar "${odftoolkitPath}" "${filePath}" -v -e`
      const fileName = filePath.split('/').pop()
      const rootDocVersionRegex: RegExp = /ODF version of root document: (\d+\.\d+)/
      const generatorRegex: RegExp =
        /Info: Generator: ((?:OxOffice\/\w+(\.\d+)*)|(\S+\/\d+(\.\d+)*))/
      const mediaTypeRegex: RegExp = /Media Type:\s*(.*)/
      try {
        const { stdout } = await execPromise(command)
        // console.log(`[DEBUG] odfvalidator 檢查結果: ${stdout}`)
        const rootDocVersionMatch: RegExpMatchArray | null = stdout.match(rootDocVersionRegex)
        const generatorMatch: RegExpMatchArray | null = stdout.match(generatorRegex)

        // 執行 ODFDOM 檢查
        console.log(`[DEBUG] 開始執行 ODFDOM 檢查`)
        const odfdomResult: OdfdomCheckResult = await this.handleOdfdomCheck(filePath)
        console.log(`[DEBUG] ODFDOM 檢查結果:`, odfdomResult)

        const entry = {
          [filePath]: [
            { standard: true },
            { msg: `${fileName} 檔案符合標準的 ODF 格式` },
            { rootDocVersion: rootDocVersionMatch ? rootDocVersionMatch[1] : undefined },
            { generator: generatorMatch ? generatorMatch[1] : undefined },
            { layoutGridHasIssue: odfdomResult.layoutGrid.hasIssue },
            { pageBreakHasIssue: odfdomResult.pageBreak.hasIssue },
            { spaceHasIssue: odfdomResult.space.hasIssue }
          ]
        }
        result.push(entry)
      } catch (error: Error | any) {
        console.error(`[ERROR] 檢測文件時發生錯誤:`, error)
        const errMsg = error.stdout
        const rootDocVersionMatch: RegExpMatchArray | null = errMsg.match(rootDocVersionRegex)

        if (rootDocVersionMatch !== null) {
          const generatorMatch: RegExpMatchArray | null = errMsg.match(generatorRegex)
          const mediaTypeMatch: RegExpMatchArray = errMsg.match(mediaTypeRegex)
          const format = this.fetchSaveAsFormat(mediaTypeMatch[1])
          const tmpDir = this.uniquePath()
          const convertCommand = `libreoffice --headless --convert-to ${format} ${filePath} --outdir ${tmpDir}`
          let canFix: boolean = false

          try {
            const { stdout } = await execPromise(convertCommand)
            if (stdout !== null) {
              const redetectCommand = `java -jar ${odftoolkitPath} ${tmpDir}/${fileName} -v -e`
              const redetectRes = await execPromise(redetectCommand)
              if (redetectRes.stdout !== null) {
                canFix = true
              }
            }
          } catch (error) {}

          // remove the temporary directory
          this.rmTmpDir(tmpDir as string)

          // 即使文件不符合標準，我們仍然執行 ODFDOM 檢查
          console.log(`[DEBUG] 開始執行 ODFDOM 檢查（非標準文件）`)
          const odfdomResult: OdfdomCheckResult = await this.handleOdfdomCheck(filePath)
          console.log(`[DEBUG] ODFDOM 檢查結果（非標準文件）:`, odfdomResult)

          const entry = {
            [filePath]: [
              { standard: false },
              { msg: `${fileName} 檔案不符合標準的 ODF 格式` },
              { rootDocVersion: rootDocVersionMatch ? rootDocVersionMatch[1] : undefined },
              { generator: generatorMatch ? generatorMatch[1] : undefined },
              { canFix: canFix },
              { layoutGridHasIssue: odfdomResult.layoutGrid.hasIssue },
              { pageBreakHasIssue: odfdomResult.pageBreak.hasIssue },
              { spaceHasIssue: odfdomResult.space.hasIssue }
            ]
          }
          result.push(entry)
        } else {
          // 非 ODF 文件
          const entry = {
            [filePath]: [
              { standard: false },
              { msg: `${fileName} 檔案非 ODF 文件格式` },
              { rootDocVersion: undefined },
              { generator: undefined },
              { odfdomCheck: null } // 不執行 ODFDOM 檢查
            ]
          }
          result.push(entry)
        }
      }
    }
    return result
  }

  private static fetchSaveAsFormat(mediaType: string) {
    let saveAsFormat: string | null = ''

    switch (mediaType) {
      case 'application/vnd.oasis.opendocument.text':
        saveAsFormat = 'odt'
        break
      case 'application/vnd.oasis.opendocument.spreadsheet':
        saveAsFormat = 'ods'
        break
      case 'application/vnd.oasis.opendocument.presentation':
        saveAsFormat = 'odp'
        break
      default:
        saveAsFormat = null
    }
    return saveAsFormat
  }

  private static uniquePath(): string | null {
    const randomBytes = crypto.randomBytes(16).toString('hex')

    // get the operating system's tmporary directory path
    const osTmpDir = os.tmpdir()

    const tmpDir = path.join(osTmpDir, randomBytes)
    return tmpDir
  }

  private static rmTmpDir(tmpDirPath: string) {
    try {
      rimraf.rimrafSync(tmpDirPath)
      return true
    } catch {
      return false
    }
  }

  public static async handleOdfdomCheck(filePath: string): Promise<OdfdomCheckResult> {
    console.log(`[DEBUG] handleOdfdomCheck 開始處理文件: ${filePath}`)
    try {
      console.log('[DEBUG] 調用 runOdfdomCheck')
      const result = await runOdfdomCheck(filePath)
      console.log('[DEBUG] runOdfdomCheck 完成，結果:', JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error('[ERROR] ODFDOM 檢查時發生錯誤：', error)
      throw error
    } finally {
      console.log('[DEBUG] handleOdfdomCheck 處理完成')
    }
  }
}
