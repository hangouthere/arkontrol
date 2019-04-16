import fs from 'fs-extra';
import path from 'path';
import sqlite from 'sqlite';
import RootPath from '../RootPath';

const dbPath = 'database';
const migrationPath = 'migrations';
const databaseName = 'data.sqlite';

const DATA_PATH = path.join(RootPath, dbPath);
const MIGRATION_PATH = path.join(DATA_PATH, migrationPath);
const USERS_DB = path.join(DATA_PATH, databaseName);

class Database {
  private _instance!: sqlite.Database;

  get instance() {
    return this._instance;
  }

  async init() {
    await fs.ensureDir(path.dirname(USERS_DB));

    this._instance = await sqlite.open(USERS_DB, { verbose: true });
    await this._instance.migrate({
      force: 'development' === process.env.NODE_ENV ? 'last' : '',
      migrationsPath: MIGRATION_PATH
    });
  }
}

export default new Database();
