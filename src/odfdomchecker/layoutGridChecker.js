const { appendClasspath, importClass } = require('java-bridge')
// const path = require("path");

async function main() {
  try {
    // 設置 Java 類路徑
    appendClasspath('./lib/odfdom-java-0.12.0-jar-with-dependencies.jar')

    // 導入需要的 Java 類
    const OdfTextDocument = await importClass('org.odftoolkit.odfdom.doc.OdfTextDocument')

    // 獲取命令行參數中的文件路徑
    const filePath = process.argv[2]
    if (!filePath) {
      console.error('請提供 ODT 文件路徑作為參數')
      process.exit(1)
    }

    // console.log(正在載入文件: ${filePath});

    // 載入 ODT 文件
    const odt = await OdfTextDocument.loadDocument(filePath)
    // console.log("文件載入成功");

    // 獲取樣式 DOM
    const stylesDom = await odt.getStylesDom()
    // console.log("獲取到樣式 DOM");

    // 獲取根元素
    const root = await stylesDom.getDocumentElement()
    // console.log("獲取到根元素");

    // 遍歷文檔樹
    const textGrid = await traverseNode(root, 0)
    const result = {
      hasTextGrid: false,
      message: ''
    }

    if (textGrid) {
      result.hasTextGrid = true
      result.message = '發現不當排版：文字網格'
    }
    console.log(JSON.stringify(result))
  } catch (error) {
    console.error('發生錯誤：', error)
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
    console.error(`處理節點時發生錯誤: ${error.message}`)
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
          // console.log(找到 style:layout-grid-mode = "${value}");
          if (value !== 'none') {
            return true
          }
        }
      } catch (attrError) {
        console.error(`獲取屬性時發生錯誤: ${attrError.message}`)
      }
    }
  } catch (error) {
    console.error(`檢查 字隔線時發生錯誤: ${error.message}`)
  }
  return false
}

main()