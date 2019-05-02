import PlayersDAO from '../database/dao/PlayersDAO';
import Player from '../database/models/Player';
import LoggerConfig from '../util/LoggerConfig';
import { EventMessages } from '../util/MessagingBus';
import { IRCONHelperInitOptions } from './RCONManager';

const CHAT_BUFFER_FREQ = 10 * 1000;
const USER_LIST_UPDATE_FREQ = 30 * 1000;

const Logger = {
  console: LoggerConfig.instance.getLogger(),
  chat: LoggerConfig.instance.getLogger('chat'),
  presence: LoggerConfig.instance.getLogger('presence')
};

export default class RCONStatus {
  private _interval: Array<NodeJS.Timeout> = [];
  private _dao!: PlayersDAO;

  constructor(private _options: IRCONHelperInitOptions) {
    this._dao = new PlayersDAO();
  }

  init() {
    this._options.messagingBus.on(EventMessages.RCON.ConnectionChange, this._onConnectionChange);

    if (true === this._options.client.serverIsAccessible) {
      this._startStatus();
    }
  }

  stop() {
    this._stopStatus();
  }

  _onConnectionChange = (isUp: boolean) => {
    return isUp ? this._startStatus() : this._stopStatus();
  }

  async _stopStatus() {
    Logger.console.info('[RCONStatus] Stopping Status Collection...');

    this._clearIntervals();

    await this._markPlayersOffline();
  }

  _startStatus() {
    Logger.console.info('[RCONStatus] Starting Status Collection...');

    this._clearIntervals();

    const int1 = setInterval(this.getChat, CHAT_BUFFER_FREQ);
    const int2 = setInterval(this.getUsers, USER_LIST_UPDATE_FREQ);
    this._interval.push(int1, int2);

    this.getChat();
    this.getUsers();
  }

  _clearIntervals() {
    this._interval.forEach(i => clearInterval(i));
    this._interval = [];
  }

  async _markPlayersOffline() {
    await this._updatePresence([]);
    await this._dao.setAllPlayersOffline();
  }

  getChat = async () => {
    try {
      let response = await this._options.client.execCommand('getchat', { skipLogging: true });
      response = response.replace(/\n?\s?\n\s?$/, '');

      // Skip bogus responses...
      if ('Server received, But no response!!' !== response) {
        Logger.chat.info(response);
      }
    } catch (err) {
      //noop
    }
  }

  getUsers = async () => {
    let response = '';

    try {
      response = await this._options.client.execCommand('listplayers', { skipLogging: true });

      // Skip bogus responses...
      if (true === response.includes('No Players Connected')) {
        await this._markPlayersOffline();
        return;
      }

      let newUserList = Player.fromRCON(response);
      await this._updatePresence(newUserList);
    } catch (err) {
      //noop
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
