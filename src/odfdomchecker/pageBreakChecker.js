import java from 'java-bridge'

export async function runPageBreakChecker(filePath) {
  try {
    const OdfTextDocument = java.importClass('org.odftoolkit.odfdom.doc.OdfTextDocument')
    const TextPElement = java.importClass('org.odftoolkit.odfdom.dom.element.text.TextPElement')
    const TextSoftPageBreakElement = java.importClass(
      'org.odftoolkit.odfdom.dom.element.text.TextSoftPageBreakElement'
    )

    const odt = await OdfTextDocument.loadDocument(filePath)
    const root = await odt.getContentRoot()

    const elements = await root.getElementsByTagName('*')
    let consecutiveParagraphs = 0
    const result = {
      hasIssue: false,
      message: '',
      details: {
        hasconsecutiveParagraphs: false,
        message: ''
      }
    }

    for (let i = 0; i < (await elements.getLength()); i++) {
      const element = await elements.item(i)

      if (await TextPElement.class.isInstance(element)) {
        consecutiveParagraphs++
      } else if (await TextSoftPageBreakElement.class.isInstance(element)) {
        if (consecutiveParagraphs > 3) {
          result.hasIssue = true
          result.message = '發現不當排版：連續空行分頁'
          result.details.hasconsecutiveParagraphs = true
          result.details.message = '發現不當排版：連續空行分頁'
          break
        }
        consecutiveParagraphs = 0
      } else {
        consecutiveParagraphs = 0
      }
    }
    return result
  } catch (error) {
    console.error('發生錯誤:', error)
    // 添加默認返回值
    return {
      hasIssue: false,
      message: '檢查過程中發生錯誤',
      details: { hasconsecutiveParagraphs: false, message: '檢查過程中發生錯誤' }
    }
  }
}

// module.exports = { runPageBreakChecker }
