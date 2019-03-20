const path = require('path');

const frontEndName = 'frontend';
const backEndName = 'backend';

const isProd = process.env.NODE_ENV === 'production';
const isHot = process.env.HOT === '1' || process.env.HOT === 'true';
const isConfigOnly = process.env.SHOW_CONFIG_ONLY === '1' || process.env.SHOW_CONFIG_ONLY === 'true';
const forceBuild = process.env.FORCE_BUILD_DLL === '1' || process.env.FORCE_BUILD_DLL === 'true';
const WDSPort = parseInt(process.env.WDSPORT || 8080);
const ServerPort = isHot ? 3000 : parseInt(process.env.SERVER_PORT || 8080);

const rootDir = path.resolve(process.cwd());
const packageJSONPath = path.resolve(rootDir, 'package.json');
const HtmlTemplatePath = path.resolve(rootDir, 'src', frontEndName, 'index.html');
const PackageInfo = JSON.parse(require('fs').readFileSync(packageJSONPath));

// Path configurations
const distDir = '_dist';
const backendPath = 'backend';
const frontendPath = 'public';
const assetsDir = 'assets';
const imagesDir = path.posix.join(assetsDir, 'images');
const fontsDir = path.posix.join(assetsDir, 'fonts');
const scriptsDir = 'js';
const stylesDir = 'css';

const DLLManifestPath = path.join(distDir, frontendPath, scriptsDir, `${frontEndName}_dll.json`);

module.exports = {
  isProd,
  isHot,
  isConfigOnly,
  forceBuild,
  DLLManifestPath,
  HtmlTemplatePath,
  PackageInfo,
  ServerPort,
  WDSPort,

  Outputs: {
    RootDir: rootDir,
    DistDir: distDir,
    Backend: {
      MainName: backEndName,
      Path: backendPath
    },
    Frontend: {
      MainName: frontEndName,
      Path: frontendPath,
      Assets: assetsDir,
      Scripts: scriptsDir,
      Styles: stylesDir,
      Images: imagesDir,
      Fonts: fontsDir
    }
  }
};
