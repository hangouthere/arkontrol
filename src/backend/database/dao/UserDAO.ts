import crypto from 'crypto';
import { IUser, IAuthRequest } from '../models/User';
import BaseDAO from './base';

const SALT = 'ArKontrolSecretSalt';

class UserDAO extends BaseDAO {
  _getSaltedHash(content: string) {
    return crypto
      .createHash('sha1')
      .update(`${content}${SALT}`)
      .digest('hex');
  }

  async validateUser(authRequest: IAuthRequest): Promise<IUser | undefined> {
    try {
      const user = await this._db.get(
        'SELECT * FROM Users WHERE userName = ? AND password = ?',
        authRequest.userName,
        this._getSaltedHash(authRequest.password)
      );

      if (user) {
        if (user.roles) {
          user.roles = user.roles.split(/\s?,\s?/);
        }

        const now = new Date().toISOString();

        await this._db.run('UPDATE Users SET lastLogin = ? WHERE userName = ?', user.userName, now);

        user.lastLogin = now;
      }

      return user;
    } catch (err) {
      return undefined;
    }
  }

  async createUser(userName: string, passwd: string, role: string = 'admin') {
    await this._db.run(
      `INSERT INTO Users (userName, password, role) VALUES (?, ?, ?)`,
      userName,
      this._getSaltedHash(passwd),
      role
    );
  }
}

export default UserDAO;
