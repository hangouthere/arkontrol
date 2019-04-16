import WebSocket from 'ws';
import { PromiseDelay } from '../commonUtil';
import RCONClient from './rcon/RCONClient';
import WebSocketServer from './servers/WebSocketServer';
import LoggerConfig from './util/LoggerConfig';

const Logger = LoggerConfig.instance.getLogger('commands');

const ID_ARK_COMMAND = 'arkCommand::';
const ID_SYS_COMMAND = 'sysCommand::';

export default class SocketMessageProxy {
  private _webSocketServer: WebSocketServer;
  private _rconClient: RCONClient;

  constructor(socketServer: WebSocketServer, rconClient: RCONClient) {
    this._webSocketServer = socketServer;
    this._rconClient = rconClient;
  }

  init() {
    this._webSocketServer.on('connection', this.addConnection);
    this._webSocketServer.on('message', this.consumeMessage);
  }

  addConnection(socket: WebSocket) {
    socket.send('You have connected!');
  }

  consumeMessage = (data: WebSocket.Data /*, _socket: WebSocket */) => {
    const message = data as string;

    if (0 === message.indexOf(ID_ARK_COMMAND)) {
      return this._proxyRCONCommand(message.replace(ID_ARK_COMMAND, ''));
    }

    if (0 === message.indexOf(ID_SYS_COMMAND)) {
      return this._proxySysCommand(message.replace(ID_SYS_COMMAND, ''));
    }

    Logger.warn(`[UICmd] Unsupported Message Recieved: "${message}"`);

    return Promise.resolve();
  }

  async _proxyRCONCommand(command: string) {
    Logger.info(`[UIArkCmd] Exec: ${command}`);

    try {
      await this._rconClient.instance.send(command);
    } catch (err) {
      this._rconClient.markPossibleTimeout(err, `UICmd: ${command.split(' ')[0]}`);
    }
  }

  async _proxySysCommand(command: string) {
    Logger.info(`[UISysCmd] Exec: ${command}`);

    switch (command) {
      case 'reconnect':
        this._rconClient.forceReconnect();
        break;
      case 'shutdown':
        const WARN_1 =
          '' +
          'broadcast System will be <RichColor Color="1, 0, 0, 1">shutting down</> in ' +
          '<RichColor Color="1, 1, 0, 1">5 minutes</>, please get somewhere safe!';

        const WARN_2 =
          '' +
          'broadcast System will be <RichColor Color="1, 0, 0, 1">shutting down</> in ' +
          '<RichColor Color="1, 1, 0, 1">1 minute</>, please get somewhere safe NOW!';

        const WARN_3 = 'broadcast System is <RichColor Color="1, 0, 0, 1">SHUTTING DOWN NOW</>...';

        await this._rconClient.instance.send(WARN_1);
        await PromiseDelay(4 * 60 * 1000);
        await this._rconClient.instance.send(WARN_2);
        await PromiseDelay(1 * 60 * 1000);
        await this._rconClient.instance.send(WARN_3);
        await this._rconClient.instance.send('SaveWorld');
        await PromiseDelay(10 * 1000);
        await this._rconClient.instance.send('DoExit');
        break;
    }
  }
}
