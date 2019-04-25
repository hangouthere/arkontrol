import PlayersDAO from '../database/dao/PlayersDAO';
import Player from '../database/models/Player';
import LoggerConfig from '../util/LoggerConfig';
import RCONClient, { IRCONHelperInitOptions } from './RCONClient';
import MessagingBus from '../util/MessagingBus';

const CHAT_BUFFER_FREQ = 10 * 1000;
const USER_LIST_UPDATE_FREQ = 3 * 1000;

const Logger = {
  console: LoggerConfig.instance.getLogger(),
  chat: LoggerConfig.instance.getLogger('chat'),
  presence: LoggerConfig.instance.getLogger('presence')
};

export default class RCONStatus {
  private _client: RCONClient;
  private _messagingBus: MessagingBus;
  private _interval: Array<NodeJS.Timeout> = [];
  private _dao!: PlayersDAO;

  constructor(options: IRCONHelperInitOptions) {
    this._client = options.client;
    this._messagingBus = options.messagingBus;
    this._dao = new PlayersDAO();

    this._client.instance.onDidAuthenticate(this._startIntervals);
    this._client.instance.onDidDisconnect(this._stopIntervals);
  }

  async init() {
    if (true === this._client.isAuthenticated) {
      this._startIntervals();
    }
  }

  _stopIntervals = () => {
    this._interval.forEach(i => clearInterval(i));
    this._interval = [];
  }

  _startIntervals = () => {
    this._stopIntervals();
    const int1 = setInterval(this.getChat, CHAT_BUFFER_FREQ);
    const int2 = setInterval(this.getUsers, USER_LIST_UPDATE_FREQ);

    this._interval.push(int1, int2);
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
        await this._dao.setAllPlayersOffline();
        return;
      }

      let newUserList = Player.fromRCON(response);
      await this._updatePresence(newUserList);
    } catch (err) {
      this._client.markPossibleTimeout(err, 'listplayers');
    }
  }

  async _updatePresence(newUserList: Array<Player>) {
    const joins: Array<Player> = [];
    const leaves: Array<Player> = [];

    const onlinePlayers = await this._dao.getOnlinePlayers();

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

    await this._dao.updatePlayerList(leaves, false);
    await this._dao.updatePlayerList(joins, true);
  }
}
