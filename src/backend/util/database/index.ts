import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import sqlite from 'sqlite';
import RootPath from '../../RootPath';
import { Player } from './models/Player';

const dbPath = 'database';
const migrationPath = 'migrations';
const databaseName = 'data.sqlite';

const DATA_PATH = path.join(RootPath, dbPath);
const MIGRATION_PATH = path.join(DATA_PATH, migrationPath);
const USERS_DB = path.join(DATA_PATH, databaseName);

const SALT = 'ArKontrolSecretSalt';

export interface IAuthRequest {
  userName: string;
  password: string;
}

export interface IUser extends IAuthRequest {
  role: string;
  lastLogin: string;
}

class Database {
  _instance!: sqlite.Database;

  get userDb() {
    return this._instance;
  }

  async init() {
    await fs.ensureDir(path.dirname(USERS_DB));

    this._instance = await sqlite.open(USERS_DB);
    this._instance.migrate({ force: 'latest', migrationsPath: MIGRATION_PATH });
  }

  _getSaltedHash(content: string) {
    return crypto
      .createHash('sha1')
      .update(`${content}${SALT}`)
      .digest('hex');
  }

  async validateUser(authRequest: IAuthRequest): Promise<IUser | undefined> {
    try {
      const user = await this._instance.get(
        'SELECT * FROM Users WHERE userName = ? AND password = ?',
        authRequest.userName,
        this._getSaltedHash(authRequest.password)
      );

      if (user) {
        const now = new Date().toISOString();

        await this._instance.run('UPDATE Users SET lastLogin = ? WHERE userName = ?', user.userName, now);

        user.lastLogin = now;
      }

      return user;
    } catch (err) {
      return undefined;
    }
  }

  async createUser(userName: string, passwd: string, role: string = 'admin') {
    //TODO: Catch errors?
    await this._instance.run(
      `INSERT INTO Users (userName, password, role)
        VALUES (?, ?, ?)`,
      userName,
      this._getSaltedHash(passwd),
      role
    );
  }

  async getOnlinePlayers() {
    return await this._instance.all(`SELECT * FROM Players WHERE isOnline=1`);
  }

  async getAllPlayers() {
    return await this._instance.all(`SELECT * FROM Players`);
  }

  async setAllPlayersOffline() {
    await this._instance.run(`UPDATE Players SET isOnline=0`);
  }

  async updatePlayer(player: Player, isOnline: boolean) {
    await this._instance.run(
      `INSERT INTO Players (userName, steamId, isOnline, lastSeen)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(steamId) DO UPDATE SET
          userName=excluded.userName,
          isOnline=excluded.isOnline,
          lastSeen=excluded.lastSeen`,
      player.userName,
      player.steamId,
      isOnline,
      new Date().toISOString()
    );
  }

  async updatePlayerList(players: Array<Player>, isOnline: boolean) {
    for (let x = 0; x < players.length; x++) {
      await this.updatePlayer(players[x], isOnline);
    }
  }
}

export default new Database();
