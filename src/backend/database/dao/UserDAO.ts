import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../servers/webserver/middleware/Auth';
import { IAuthRequest, IUser } from '../models/User';
import BaseDAO from './base';

const SALT = 'ArKontrolSecretSalt';

class UserDAO extends BaseDAO {
  private _getSaltedHash(content: string) {
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

        await this._db.run('UPDATE Users SET lastLogin = ? WHERE id = ?', now, user.id);

        user.lastLogin = now;
      }

      return user;
    } catch (err) {
      return undefined;
    }
  }

  async createUser(userName: string, passwd: string, role: string = 'admin') {
    await this._db.run(
      'INSERT INTO Users (userName, password, role) VALUES (?, ?, ?)',
      userName,
      this._getSaltedHash(passwd),
      role
    );
  }

  async getById(id: number) {
    const user = await this._db.get('SELECT * FROM Users WHERE id = ?', id);

    if (user.roles) {
      user.roles = user.roles.split(/\s?,\s?/);
    }

    return user;
  }

  async saveUser(userInfo: IUser) {
    await this._db.run(
      'UPDATE Users SET displayName = ?, email = ?, roles = ? WHERE id = ?',
      userInfo.displayName,
      userInfo.email,
      userInfo.roles.join(', '),
      //
      userInfo.id
    );
  }

  signUser(user: IUser) {
    const { oldPassword, newPassword, password, ...userPayload } = user;

    delete userPayload['exp'];
    delete userPayload['expiresIn'];

    return {
      token: jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: '48h'
      })
    };
  }

  validatePasswordChange(inUser: IUser, savedUser: IUser) {
    const hasOnePasswd = !!inUser.oldPassword || !!inUser.newPassword;
    const hasBothPasswd = !!inUser.oldPassword && !!inUser.newPassword;

    if (false === hasOnePasswd) {
      return false;
    }

    if (true === hasOnePasswd && false === hasBothPasswd) {
      throw new Error('Only supplied one password!');
    }

    const oldPassword = this._getSaltedHash(inUser.oldPassword!);

    if (oldPassword !== savedUser.password) {
      throw new Error('Invalid Password');
    }

    const newPassword = this._getSaltedHash(inUser.newPassword!);
    const isPassDiff = oldPassword !== newPassword && newPassword !== savedUser.password;

    if (false === isPassDiff) {
      throw new Error('New Password is the same as an old password');
    }

    return isPassDiff;
  }

  async saveUserPassword(userInfo: IUser) {
    await this._db.run(
      'UPDATE Users SET password = ? WHERE id = ?',
      this._getSaltedHash(userInfo.newPassword!),
      //
      userInfo.id
    );
  }
}

export default UserDAO;
