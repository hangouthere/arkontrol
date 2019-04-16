import BaseDAO from './base';
import { IAuthConfigEntry } from '../models/AuthConfig';

class AuthConfigDAO extends BaseDAO {
  async getConfig() {
    return await this._db.all('SELECT * FROM AuthConfig');
  }

  async saveConfigPart({ propName, propValue }: IAuthConfigEntry) {
    await this._db.run('UPDATE AuthConfig SET propValue = ? WHERE propName = ?', propValue, propName);

    return this.getConfig();
  }
}

export default AuthConfigDAO;
