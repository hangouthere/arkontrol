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

  hydrateRoles(user: IUser) {
    if (user.roles && 'string' === typeof user.roles) {
      user.roles = (user.roles as string).split(/\s?,\s?/);
    }
  }

  async validateUser(authRequest: IAuthRequest): Promise<IUser | undefined> {
    try {
      const user = await this._db.get(
        'SELECT * FROM Users WHERE userName = ? AND password = ?',
        authRequest.userName.toLowerCase(),
        this._getSaltedHash(authRequest.password)
      );

      if (user) {
        this.hydrateRoles(user);

        const now = new Date().toISOString();

        await this._db.run('UPDATE Users SET lastLogin = ? WHERE id = ?', now, user.id);

        user.lastLogin = now;
      }

      return user;
    } catch (err) {
      return undefined;
    }
  }

  async createUser(user: IUser) {
    return await this._db.run(
      'INSERT INTO Users (displayName, userName, email, password, roles) VALUES (?, ?, ?, ?, ?)',
      user.displayName,
      user.userName.toLowerCase(),
      user.email,
      this._getSaltedHash(user.newPassword!),
      user.roles.sort().join(', ')
    );
  }

  async getById(id: number) {
    const user = await this._db.get('SELECT * FROM Users WHERE id = ?', id);

    this.hydrateRoles(user);

    return user;
  }

  async getUsers() {
    const users = await this._db.all('SELECT * FROM Users');

    users.forEach((u: IUser) => this.hydrateRoles(u));

    return users;
  }

  async saveUser(user: IUser) {
    return await this._db.run(
      'UPDATE Users SET displayName = ?, username = ?, email = ?, roles = ? WHERE id = ?',
      user.displayName,
      user.userName.toLowerCase(),
      user.email,
      user.roles.sort().join(', '),
      //
      user.id
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
      throw new Error('New Password is the same as the old password');
    }

    return isPassDiff;
  }

  async saveUserPassword(user: IUser) {
    await this._db.run(
      'UPDATE Users SET password = ? WHERE id = ?',
      this._getSaltedHash(user.newPassword!),
      //
      user.id
    );
  }

  async getSuperCount() {
    return this._db.get("SELECT COUNT(id) FROM Users WHERE roles LIKE '%superadmin%'");
  }

  async deleteUser(user: IUser) {
    return await this._db.run(
      'DELETE FROM Users WHERE id = ?',
      //
      user.id
    );
  }
}

export default UserDAO;
