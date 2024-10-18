const { MSICreator } = require("electron-wix-msi");
const path = require('path');
const fs = require('fs');

// 定義輸入和輸出路徑
const APP_DIR = path.resolve(__dirname, './dist/win-unpacked');
const OUT_DIR = path.resolve(__dirname, './dist/windows_installer');

console.log('APP_DIR:', APP_DIR);
console.log('OUT_DIR:', OUT_DIR);

// 確保輸出目錄存在
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 定義 LICENSE.rtf 的路徑
const licenseRtfPath = path.resolve(__dirname, 'LICENSE.rtf');

// 檢查 LICENSE.rtf 文件是否存在
if (fs.existsSync(licenseRtfPath)) {
    console.log('LICENSE.rtf 文件存在於路徑:', licenseRtfPath);
    
    // 嘗試讀取文件
    try {
        const licenseContent = fs.readFileSync(licenseRtfPath, 'utf-8');
        console.log('LICENSE.rtf 文件成功讀取，內容長度:', licenseContent.length, '字節');
    } catch (error) {
        console.error('讀取 LICENSE.rtf 文件時發生錯誤:', error.message);
    }
} else {
    console.error('錯誤：LICENSE.rtf 文件不存在於路徑:', licenseRtfPath);
}

// 創建配置對象
const config = {
  arch: ['x64'],
  appDirectory: APP_DIR,
  outputDirectory: OUT_DIR,
  description: 'odfvalidator-desktop',
  exe: 'odfvalidator-desktop.exe',
  name: 'ODF 格式檢測工具',
  manufacturer: 'OSSII',
  version: '1.0.0',
  ui: {
    chooseDirectory: true,
    images: {
      background: path.resolve(__dirname, 'public/icons/256x256.png'),
      banner: path.resolve(__dirname, 'public/icons/pdf_logo.jpg')
    },
    template: `
      <UI>
        <UIRef Id="WixUI_InstallDir" />
      </UI>
      <Property Id="WIXUI_INSTALLDIR" Value="APPLICATIONROOTDIRECTORY" />
      <WixVariable Id="WixUILicenseRtf" Value="${licenseRtfPath}" />
      <WixVariable Id="WixUIDialogBmp" Value="${path.resolve(__dirname, 'public/background.png')}" />
      <WixVariable Id="WixUIBannerBmp" Value="${path.resolve(__dirname, 'public/wix_banner.png')}" />
    `
  },
  language: 1028, // 正體中文的語言代碼
  cultures: ['zh-TW'],
  icon: path.resolve(__dirname, 'public/icons/icon.ico'),
  shortcutName: 'ODF 格式檢測工具',
  programFilesFolderName: 'odfvalidator-desktop',
  upgradeCode: 'b67c1b4d-d911-4863-b9ad-2b9d0501988a',
  // 添加以下選項來減小安裝包大小
  compression: 'high',
  removeDefaultProgramFiles: true,
  removeEmptyFolders: true
};

// 印出配置
console.log('MSI Creator Configuration:', JSON.stringify(config, null, 2));

const msiCreator = new MSICreator(config);

// 創建 MSI 安裝程式
async function createMSI() {
  try {
    // 添加日誌輸出
    console.log("開始創建 MSI...");
    await msiCreator.create();
    await msiCreator.compile();
    console.log("MSI 編譯完成");
  } catch (error) {
    console.error("創建 MSI 時出錯:", error);
    if (error.stderr) console.error("錯誤輸出:", error.stderr);
    if (error.stdout) console.error("標準輸出:", error.stdout);
  }
}

createMSI();
