import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

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
}
