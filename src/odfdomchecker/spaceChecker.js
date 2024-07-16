// src/odfdomchecker/spaceChecker.js

const java = require('java-bridge');

async function runSpaceChecker(filePath) {
  try {
    await java.lock();
    const OdfTextDocument = await java.importClass('org.odftoolkit.odfdom.doc.OdfTextDocument');
    const TextSElement = await java.importClass('org.odftoolkit.odfdom.dom.element.text.TextSElement');
    const TextLineBreakElement = await java.importClass('org.odftoolkit.odfdom.dom.element.text.TextLineBreakElement');
    const TextSpanElement = await java.importClass('org.odftoolkit.odfdom.dom.element.text.TextSpanElement');
    const Node = await java.importClass('org.w3c.dom.Node');

    const odt = await OdfTextDocument.loadDocument(filePath);
    const root = await odt.getContentRoot();

    const paragraphs = await root.getElementsByTagName('text:p');
    let improperIndentCount = 0;
    const result = {
      hasIssue: false,
      message: '',
      details: {
        hasImproperIndent: false,
        message: ''
      }
    };

    for (let i = 0; i < (await paragraphs.getLength()); i++) {
      const paragraph = await paragraphs.item(i);

      if (await checkImproperIndent(paragraph, TextSElement, TextLineBreakElement, TextSpanElement, Node)) {
        improperIndentCount++;
      } else {
        improperIndentCount = 0;
      }

      if (improperIndentCount > 2 && !result.hasIssue) {
        result.hasIssue = true;
        result.message = '發現不當排版：連續空格縮排';
        result.details.hasImproperIndent = true;
        result.details.message = '發現不當排版：連續空格縮排';
        break;
      }
    }

    return result;
  } catch (error) {
    return {
      hasIssue: false,
      message: `錯誤：${error.message}`,
      details: {
        hasImproperIndent: false,
        message: `錯誤：${error.message}`
      }
    };
  } finally {
    await java.unlock();
  }
}

// checkImproperIndent, checkSpanElement, 和 getElementType 函數保持不變

module.exports = { runSpaceChecker };