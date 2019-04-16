import sqlite from 'sqlite';
import Database from '..';

class BaseDAO {
  protected _db: sqlite.Database;

  constructor() {
    this._db = Database.instance;
  }
}

export default BaseDAO;
