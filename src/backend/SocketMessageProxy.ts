import WebSocket from 'ws';
import UserDAO from './database/dao/UserDAO';
import { IAuthRequest, IUser } from './database/models/User';
import DiscordWebhook from './DiscordWebhook';
import RCONCommandShutdown from './rcon/RCONCommandShutdown';
import RCONManager from './rcon/RCONManager';
import WebSocketServer from './servers/WebSocketServer';
import LoggerConfig from './util/LoggerConfig';
import MessagingBus, { EventMessages } from './util/MessagingBus';

const Logger = {
  server: LoggerConfig.instance.getLogger('server'),
  commands: LoggerConfig.instance.getLogger('commands')
};

const ID_AUTH_COMMAND = 'authCommand::';
const ID_RCON_COMMAND = 'rconCommand::';
const ID_SYS_COMMAND = 'sysCommand::';

interface ISocketMessageProxyInitOptions {
  rconMgr: RCONManager;
  socketServer: WebSocketServer;
  messagingBus: MessagingBus;
}

export default class SocketMessageProxy {
  constructor(private _options: ISocketMessageProxyInitOptions) {}

  init() {
    this._options.messagingBus.on(EventMessages.Socket.Message, this._consumeMessage);
    this._options.messagingBus.on(EventMessages.RCON.ConnectionChange, this._onConnectionChange);
  }

  _onConnectionChange = (isConnected: boolean) => {
    this._updateSocketClients(isConnected);
    this._updateDiscord(isConnected);
  };

  _updateSocketClients(isConnected: boolean) {
    if (0 < this._options.socketServer.instance.clients.size) {
      Logger.server.info(
        `[SysProxy] Alerting Socket Clients of Status Change: ${this._options.rconMgr.state.client.statusLabel}`
      );
    }

    this._options.socketServer.instance.clients.forEach(client => {
      client.send(
        JSON.stringify({
          type: EventMessages.RCON.ConnectionChange,
          payload: isConnected
        })
      );
    });
  }

  async _updateDiscord(isConnected: boolean) {
    const { discordWebhookURL, discordAdminName } = this._options.rconMgr.state.config.authConfig;

    if (discordWebhookURL.propValue) {
      Logger.server.info(
        `[SysProxy] Alerting Discord of Status Change: ${this._options.rconMgr.state.client.statusLabel}`
      );

      const dwh = new DiscordWebhook({
        webhookUrl: discordWebhookURL.propValue,
        adminName: discordAdminName.propValue
      });

      await dwh.send(isConnected);
    }
  }

  _consumeMessage = (data: WebSocket.Data, socket: WebSocket) => {
    const message = data as string;
    const user = (socket as any).user as IUser;

    if (0 === message.indexOf(ID_AUTH_COMMAND)) {
      return this._manageAuth(message.replace(ID_AUTH_COMMAND, ''), socket);
    }

    // TODO: Add auth checks
    // if (!user) {
    //   socket.send('authResponse::unauthorized');
    //   return Promise.reject();
    // }

    if (0 === message.indexOf(ID_RCON_COMMAND)) {
      return this._proxyRCONCommand(message.replace(ID_RCON_COMMAND, ''));
    }

    if (0 === message.indexOf(ID_SYS_COMMAND)) {
      return this._proxySysCommand(message.replace(ID_SYS_COMMAND, ''));
    }

    Logger.commands.warn(`[MsgProxy] Unsupported Message Recieved: "${message}"`);

    return Promise.resolve();
  };

  async _manageAuth(authInfo: string, socket: WebSocket) {
    const authSplit = authInfo.split(',');
    const authObj: IAuthRequest = {
      userName: authSplit[0],
      password: authSplit[1]
    };

    try {
      const userDao = new UserDAO();
      const validatedUser = userDao.validateUser(authObj);
      (socket as any).user = validatedUser;
    } catch (err) {
      socket.send('authResponse::error', err.message.toString());
    }
  }

  async _proxyRCONCommand(command: string) {
    Logger.commands.info(`[MsgProxy] RCON Exec: ${command}`);

    await this._options.rconMgr.state.client.execCommand(command, {
      skipLogging: true
    });
  }

  async _proxySysCommand(command: string) {
    Logger.commands.info(`[MsgProxy] Sys Exec: ${command}`);

    switch (command) {
      case 'reconnect':
        this._options.rconMgr.state.client.init();
        break;
      case 'shutdown':
        this._options.rconMgr.stop();

        const cmdList = new RCONCommandShutdown(this._options.rconMgr.state.client);
        cmdList.init();
        cmdList.once(EventMessages.RCON.CommandsEnd, () => {
          cmdList.stop();
        });
        break;
    }
  }
}
