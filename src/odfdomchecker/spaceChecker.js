import java from 'java-bridge'

export async function runSpaceChecker(filePath) {
  try {
    const OdfTextDocument = java.importClass('org.odftoolkit.odfdom.doc.OdfTextDocument')
    const TextSElement = java.importClass('org.odftoolkit.odfdom.dom.element.text.TextSElement')
    const TextLineBreakElement = java.importClass(
      'org.odftoolkit.odfdom.dom.element.text.TextLineBreakElement'
    )
    const TextSpanElement = java.importClass(
      'org.odftoolkit.odfdom.dom.element.text.TextSpanElement'
    )
    const Node = java.importClass('org.w3c.dom.Node')

    const odt = await OdfTextDocument.loadDocument(filePath)
    const root = await odt.getContentRoot()

    const paragraphs = await root.getElementsByTagName('text:p')
    let improperIndentCount = 0
    const result = {
      hasIssue: false,
      message: '',
      details: {
        hasImproperIndent: false,
        message: ''
      }
    }

    for (let i = 0; i < (await paragraphs.getLength()); i++) {
      const paragraph = await paragraphs.item(i)

      if (
        await checkImproperIndent(
          paragraph,
          TextSElement,
          TextLineBreakElement,
          TextSpanElement,
          Node
        )
      ) {
        improperIndentCount++
      } else {
        improperIndentCount = 0
      }

      if (improperIndentCount > 2 && !result.hasIssue) {
        result.hasIssue = true
        result.message = '發現不當排版：連續空格縮排'
        result.details.hasImproperIndent = true
        result.details.message = '發現不當排版：連續空格縮排'
        break
      }
    }

    return result
  } catch (error) {
    console.error('發生錯誤:', error)
    // 添加默認返回值
    return {
      hasIssue: false,
      message: '檢查過程中發生錯誤',
      details: { hasImproperIndent: false, message: '檢查過程中發生錯誤' }
    }
  }
}

async function checkImproperIndent(
  paragraph,
  TextSElement,
  TextLineBreakElement,
  TextSpanElement,
  Node
) {
  const children = await paragraph.getChildNodes()
  let lastWasLineBreak = false
  let improperIndent = false

  for (let i = 0; i < (await children.getLength()); i++) {
    const child = await children.item(i)
    const elementType = await getElementType(
      child,
      TextSElement,
      TextLineBreakElement,
      TextSpanElement,
      Node
    )

    switch (elementType) {
      case 'TextSElement':
        if (i === 0 || lastWasLineBreak) {
          improperIndent = true
        }
        break

      case 'TextSpanElement':
        improperIndent = await checkSpanElement(
          child,
          i,
          lastWasLineBreak,
          TextSElement,
          TextLineBreakElement,
          TextSpanElement,
          Node
        )
        break

      case 'TextLineBreakElement':
        lastWasLineBreak = true
        break

      default:
        lastWasLineBreak = false
    }

    if (improperIndent) break
  }

  return improperIndent
}

async function checkSpanElement(
  spanElement,
  index,
  lastWasLineBreak,
  TextSElement,
  TextLineBreakElement,
  TextSpanElement,
  Node
) {
  const spanChildren = await spanElement.getChildNodes()
  let spanStartWithS = false

  for (let j = 0; j < (await spanChildren.getLength()); j++) {
    const spanChild = await spanChildren.item(j)
    const spanChildType = await getElementType(
      spanChild,
      TextSElement,
      TextLineBreakElement,
      TextSpanElement,
      Node
    )

    switch (spanChildType) {
      case 'TextLineBreakElement':
        lastWasLineBreak = true
        break

      case 'TextSElement':
        if (j === 0) spanStartWithS = true
        if (lastWasLineBreak) return true
        break

      case 'TEXT_NODE':
        if (j === 0 && (await spanChild.getTextContent()).trim().length === 0) {
          spanStartWithS = true
        }
        break
    }
  }

  return spanStartWithS && (index === 0 || lastWasLineBreak)
}

async function getElementType(element, TextSElement, TextLineBreakElement, TextSpanElement, Node) {
  if (await TextSElement.class.isInstance(element)) return 'TextSElement'
  if (await TextLineBreakElement.class.isInstance(element)) return 'TextLineBreakElement'
  if (await TextSpanElement.class.isInstance(element)) return 'TextSpanElement'
  if ((await Node.TEXT_NODE) == (await element.getNodeType())) return 'TEXT_NODE'
  return 'Unknown'
}

// module.exports = { runSpaceChecker }
