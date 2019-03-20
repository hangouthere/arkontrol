const fs = require('fs');
const chalk = require('chalk');
const { execSync } = require('child_process');
const {
  BuildTimeDefs: { isConfigOnly, isProd, forceBuild, DLLManifestPath }
} = require('./definitions');

class ConfigUtil {
  /**
   * Warn if DLL already exists
   */
  checkDLLExists() {
    if (!forceBuild && !isProd && fs.existsSync(DLLManifestPath)) {
      console.log(
        chalk.yellow.bgRed.bold(
          'The DLL files already exist.\n' +
            'If you want to rebuild, first clean with "npm run clean" and re-run this build!\n' +
            'Alternatively you can force a build by enabling env var FORCE_BUILD_DLL=1'
        )
      );

      process.exit(99);
    }
  }

  /**
   * Warn and DLL is missing
   */
  checkDLLMissing() {
    if (!isProd && !fs.existsSync(DLLManifestPath)) {
      console.log(
        chalk.black.bgYellow.bold(
          'The DLL files are missing... Running "npm run build:dev:frontend_dll" before continuing this build!'
        )
      );

      execSync('npm run build:dev:frontend_dll', {
        stdio: ['inherit', 'inherit', 'inherit']
      });

      console.log('\n', chalk.black.bgYellow.bold('--- Continuing your build! ---'), '\n');
    }
  }

  /**
   * Determines if the runtime is meant to only show the config output
   */
  checkConfigOnly(config) {
    if (isConfigOnly) {
      console.log(chalk.bgGreen(require('util').inspect(config, false, null)));
      process.exit(0);
    }
  }

  stripExcludes(dependencies, excludes = []) {
    return Object.keys(dependencies).reduce((entries, dep) => {
      if (false === excludes.includes(dep)) {
        entries.push(dep);
      }

      return entries;
    }, []);
  }
}

module.exports = new ConfigUtil();
