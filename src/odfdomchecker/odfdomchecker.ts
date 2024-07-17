import { OdfdomCheckResult } from './type'
import { runLayoutGridChecker } from './layoutGridChecker'
import { runPageBreakChecker } from './pageBreakChecker'
import { runSpaceChecker } from './spaceChecker'
import { appendClasspath } from 'java-bridge'
import path from 'path'

export async function runOdfdomCheck(filePath: string): Promise<OdfdomCheckResult> {
  const jarPath: string = path.join(
    __dirname,
    '../../public/libs/odfdom-java-0.12.0-jar-with-dependencies.jar'
  )
  console.log(`[DEBUG] ODFDOM jar 庫路徑：${jarPath}`)
  appendClasspath(jarPath)

  console.log(`[DEBUG] runOdfdomCheck 開始處理文件: ${filePath}`)
  // 串行執行檢查器
  const layoutGrid = await runLayoutGridChecker(filePath)
  const pageBreak = await runPageBreakChecker(filePath)
  const space = await runSpaceChecker(filePath)

  console.log('[DEBUG] 所有檢查器運行完成')
  return { layoutGrid, pageBreak, space }
}
