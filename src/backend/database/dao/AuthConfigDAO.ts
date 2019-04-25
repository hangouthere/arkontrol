import { IAuthConfig, IAuthConfigEntry } from '../models/AuthConfig';
import BaseDAO from './base';

class AuthConfigDAO extends BaseDAO {
  async getConfigEntries(): Promise<Array<IAuthConfigEntry>> {
    return await this._db.all('SELECT * FROM AuthConfig');
  }

  async saveConfig(config: IAuthConfig) {
    await Promise.all(
      Object.entries(config).map(([key, entry]) =>
        this._db.run(
          'UPDATE AuthConfig SET propValue = ? WHERE propName = ?',
          (entry as IAuthConfigEntry).propValue,
          key
        )
      )
    );

    return this.getConfigEntries();
  }
}

export default AuthConfigDAO;
