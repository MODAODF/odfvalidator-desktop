import java from 'java-bridge'

export async function runLayoutGridChecker(filePath) {
  try {
    const OdfTextDocument = java.importClass('org.odftoolkit.odfdom.doc.OdfTextDocument')
    const odt = await OdfTextDocument.loadDocument(filePath)

    const stylesDom = await odt.getStylesDom()
    const root = await stylesDom.getDocumentElement()

    const textGrid = await traverseNode(root, 0)
    const result = {
      hasIssue: false,
      message: '',
      details: { hasTextGrid: false, message: '' }
    }

    if (textGrid) {
      result.hasIssue = true
      result.message = '發現不當排版：文字網格'
      result.details = { hasTextGrid: true, message: '發現不當排版：文字網格' }
    }

    return result
  } catch (error) {
    return {
      hasIssue: false,
      message: '檢查過程中發生錯誤',
      details: { hasTextGrid: false, message: '檢查過程中發生錯誤' }
    }
  }

  async function traverseNode(node, level) {
    try {
      const nodeType = await node.getNodeType()
      const nodeName = await node.getNodeName()

      if (nodeType === 1) {
        // ELEMENT_NODE
        if (nodeName === 'style:page-layout-properties') {
          if (await checkLayoutGridMode(node)) {
            return true
          }
        }

        const childNodes = await node.getChildNodes()
        const childLength = await childNodes.getLength()

        for (let i = 0; i < childLength; i++) {
          const childNode = await childNodes.item(i)
          if (await traverseNode(childNode, level + 1)) {
            return true
          }
        }
      }
    } catch (error) {
      console.error('檢查過程中發生錯誤:', error)
    }
    return false
  }

  async function checkLayoutGridMode(element) {
    try {
      const attributes = await element.getAttributes()

      for (let i = 0; i < (await attributes.getLength()); i++) {
        try {
          const attr = await attributes.item(i)
          if ((await attr.getNodeName()) === 'style:layout-grid-mode') {
            const value = await attr.getNodeValue()
            // console.log(`找到 style:layout-grid-mode = "${value}"`);
            if (value !== 'none') {
              return true
            }
          }
        } catch (attrError) {
          console.error(`獲取屬性時發生錯誤:`, attrError)
        }
      }
    } catch (error) {
      console.error(`檢查 layout-grid-mode 時發生錯誤:`, error)
    }
    return false
  }
}
// module.exports = { runLayoutGridChecker }
