import * as util from 'util';
import * as childProcess from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as rimrafLib from 'rimraf';
import * as archiver from 'archiver';
import * as globLib from 'glob';

const VERSION = '1.0.0';

const shortcut: any = require('windows-shortcuts');

const exec = util.promisify(childProcess.exec);
const rimraf = util.promisify(rimrafLib);
const glob = util.promisify(globLib);

class Deployer {
  async deploy() {
    await this._buildRelease();
    await this._migrateBinaries();
    await this._copyDbMigrations();
    await this._copyFrontend();
    await this._copyDependencies();
    await this._generateShortcut();
    await this._buildPackage();
  }

  async _buildRelease() {
    console.log('Building Release...');

    const { stdout, stderr } = await exec('npm run build:release');

    if (stderr) {
      console.error(`error: ${stderr}`);
      process.exit(-1);
    }
  }

  async _migrateBinaries() {
    console.log('Migrating Binaries...');

    try {
      await fs.copy('./_build/index-win.exe', './_build/bin/arkontrol.exe');
    } catch (err) {
      console.error('Cannot copy binary!');
      process.exit(-1);
    }

    await rimraf('./_build/index-*');
  }

  async _copyDependencies() {
    console.log('Copying Dependencies...');

    const sqlite3Src = (await glob('./node_modules/sqlite3/lib/binding/**/*sqlite3.node'))[0];
    const sqlite3Dest = './_build/bin/' + path.basename(sqlite3Src);
    console.log(`  - Copying: ${sqlite3Src} -> ${sqlite3Dest}`);
    await fs.copy(sqlite3Src, sqlite3Dest);

    const connectionsSrc = './src/frontend/connections.json.deploy';
    const connectionsDest = './_build/public/connections.json';
    console.log(`  - Copying: ${connectionsSrc} -> ${connectionsDest}`);
    await fs.copy(connectionsSrc, connectionsDest);
  }

  async _copyDbMigrations() {
    console.log('Copying DB Migrations...');

    await fs.copy('./_dist/backend/database', './_build/bin/database');
  }

  async _copyFrontend() {
    console.log('Copying Frontend GUI Application...');

    await fs.copy('./_dist/public', './_build/public');
  }

  _generateShortcut() {
    console.log('Creating Windows Shortcut...');

    return new Promise(resolve => {
      shortcut.create(
        './_build/ArKontrol.lnk',
        {
          target: path.resolve('./_build/bin/arkontrol.exe'),
          workingDir: path.resolve('./_build/bin/'),
          icon: path.resolve('./_build/public/favicon.ico')
        },
        function(err: any) {
          if (err) {
            console.log(err);
            process.exit(-1);
          }

          resolve();
        }
      );
    });
  }

  async _buildPackage() {
    console.log(`Building Deploy Package for v${VERSION}...`);

    await fs.ensureDir('./_deploy');
    await this._zipDirectory('./_build/', `./_deploy/arkontrol_v${VERSION}.zip`, `arkontrol_v${VERSION}`);
  }

  _zipDirectory(source: string, out: string, subPath: string | false = false) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
      archive
        .directory(source, subPath)
        .on('error', err => reject(err))
        .pipe(stream);

      stream.on('close', () => resolve());
      archive.finalize();
    });
  }
}

const deployer = new Deployer();

deployer.deploy().then(() => {
  console.log('Deployed!');
});
