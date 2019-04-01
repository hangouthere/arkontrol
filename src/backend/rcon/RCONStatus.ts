import Database from '../util/database';
import LoggerConfig from '../util/LoggerConfig';
import { importPlayers, Player } from './../util/database/models/Player';
import RCONClient from './RCONClient';

const CHAT_BUFFER_FREQ = 10 * 1000;
const USER_LIST_UPDATE_FREQ = 3 * 1000;

const Logger = {
  console: LoggerConfig.instance.getLogger(),
  chat: LoggerConfig.instance.getLogger('chat'),
  presence: LoggerConfig.instance.getLogger('presence')
};

export default class RCONStatus {
  private _client: RCONClient;
  private _interval!: Array<number>;

  constructor(client: RCONClient) {
    this._client = client;

    this.init();
  }

  async init() {
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
      this._client.markPossibleTimeout(err, 'getchat');
    }
  }

  getUsers = async () => {
    try {
      let response = await this._client.instance.send('listplayers');

      // Skip bogus responses...
      if (true === response.includes('No Players Connected')) {
        await this._updatePresence([]);
        await Database.setAllPlayersOffline();
        return;
      }

      let newUserList = importPlayers(response);
      await this._updatePresence(newUserList);
    } catch (err) {
      this._client.markPossibleTimeout(err, 'listplayers');
    }
  }

  async _updatePresence(newUserList: Array<Player>) {
    const joins: Array<Player> = [];
    const leaves: Array<Player> = [];

    const onlinePlayers = await Database.getOnlinePlayers();

    const existingUserNames = onlinePlayers.map(u => u.userName);
    const newUserNames = newUserList.map(u => u.userName);

    onlinePlayers.forEach(user => {
      if (!newUserNames.includes(user.userName)) {
        leaves.push(user);
      }
    });

    newUserList.forEach(user => {
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

    await Database.updatePlayerList(leaves, false);
    await Database.updatePlayerList(joins, true);
  }
}
