import BaseDAO from './base';
import { IAppStateEntry } from '../models/AppState';

class AppStateDAO extends BaseDAO {
  async getStateEntries() {
    return await this._db.all('SELECT * FROM AppState');
  }

  async saveStatePart({ propName, propValue }: IAppStateEntry) {
    await this._db.run('UPDATE AppState SET propValue = ? WHERE propName = ?', propValue, propName);
  }
}

export default AppStateDAO;
