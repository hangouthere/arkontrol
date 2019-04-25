import { IAppStateEntry } from '../models/AppState';
import BaseDAO from './base';

class AppStateDAO extends BaseDAO {
  async getStateEntries() {
    return await this._db.all('SELECT * FROM AppState');
  }

  async saveStatePart({ propName, propValue }: IAppStateEntry) {
    await this._db.run('UPDATE AppState SET propValue = ? WHERE propName = ?', propValue, propName);
  }
}

export default AppStateDAO;
