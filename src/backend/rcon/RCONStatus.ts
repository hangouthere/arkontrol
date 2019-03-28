import fs from 'fs-extra';
import path from 'path';
import LoggerConfig from '../LoggerConfig';
import RCONClient from './RCONClient';
import RootPath from '../RootPath';

// Using consts to avoid `pkg` assuming they're assets to include
const statsName = 'stats';
const usersName = 'users.json';

const STAT_PATH = path.resolve(RootPath, statsName);
const USER_INFO_PATH = path.join(STAT_PATH, usersName);

const CHAT_BUFFER_FREQ = 10 * 1000;
const USER_LIST_UPDATE_FREQ = 3 * 1000;

const Logger = {
  console: LoggerConfig.instance.getLogger(),
  chat: LoggerConfig.instance.getLogger('chat'),
  presence: LoggerConfig.instance.getLogger('presence')
};

class User {
  userName: string;
  steamId: string;

  constructor(userText: string) {
    const [userIdName, steamId] = userText.split(', ');
    const [orderId, userName] = userIdName.split('. ');

    this.userName = userName;
    this.steamId = steamId;
  }
}

class UserList {
  users: Array<User> = [];

  import(userListText: string) {
    this.users = userListText.split('\n').reduce<Array<User>>((users, userText) => {
      userText = userText.trim();

      if ('' !== userText) {
        users.push(new User(userText));
      }

      return users;
    }, []);
  }
}

export default class RCONStatus {
  private _client: RCONClient;
  private _interval!: Array<number>;
  private _currentUsers: UserList | undefined;

  constructor(client: RCONClient) {
    this._client = client;

    this.init();
  }

  async init() {
    let userInfoData: any;

    await fs.ensureFile(USER_INFO_PATH);

    userInfoData = await fs.readFile(USER_INFO_PATH);
    userInfoData = userInfoData.toString();

    if (userInfoData != '') {
      this._currentUsers = JSON.parse(userInfoData);
    }

    this._client.instance.onDidConnect(this._startIntervals);

    this._client.instance.onDidDisconnect(() => {
      this._interval.forEach(i => clearInterval(i));
      this._interval = [];
    });

    this._startIntervals();
  }

  _startIntervals = () => {
    setInterval(this.getChat, CHAT_BUFFER_FREQ);
    setInterval(this.getUsers, USER_LIST_UPDATE_FREQ);
  }

  getChat = async () => {
    try {
      let response = await this._client.instance.send('getchat');
      response = response.replace(/\n?\s?\n\s?$/, '');

      // Skip bogus responses...
      if ('Server received, But no response!!' === response) {
        return;
      }

      Logger.chat.info(response);
    } catch (err) {
      Logger.console.warn('[NEEDS WORK] Timeout when performing: getchat', err.message);
      this._client.markTimeout();
    }
  }

  getUsers = async () => {
    try {
      let response = await this._client.instance.send('listplayers');

      // Skip bogus responses...
      if (true === response.includes('No Players Connected')) {
        await fs.writeFile(USER_INFO_PATH, '');
        this._showJoinParts(new UserList());
        this._currentUsers = undefined;
        return;
      }

      const newUserList = new UserList();
      newUserList.import(response);
      await fs.writeFile(USER_INFO_PATH, JSON.stringify(newUserList));

      this._showJoinParts(newUserList);
      this._currentUsers = newUserList;
    } catch (err) {
      Logger.console.warn('[NEEDS WORK] Timeout when performing: listplayers', err.message);
      this._client.markTimeout();
    }
  }

  _showJoinParts(newUserList: UserList) {
    const joins: Array<User> = [];
    const leaves: Array<User> = [];

    const existingUserNames = !this._currentUsers ? [] : this._currentUsers.users.map(u => u.userName);
    const newUserNames = newUserList.users.map(u => u.userName);

    if (this._currentUsers) {
      this._currentUsers.users.forEach(user => {
        if (!newUserNames.includes(user.userName)) {
          leaves.push(user);
        }
      });
    }

    newUserList.users.forEach(user => {
      if (!existingUserNames.includes(user.userName)) {
        joins.push(user);
      }
    });

    leaves.forEach(l => {
      Logger.presence.info(`${l.userName} has left the server.`);
    });

    joins.forEach(l => {
      Logger.presence.info(`${l.userName} has joined the server.`);
    });
  }
}
