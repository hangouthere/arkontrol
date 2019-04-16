import { EventEmitter } from 'events';

export const MESSAGE_RECIEVED = 'MESSAGE_RECIEVED';

// Declared here, but injected via WebPack.DefinePlugin
declare var SOCKET_URI: string;

class SocketService extends EventEmitter {
  private _ws!: WebSocket;

  get socket() {
    return this._ws;
  }

  constructor() {
    super();

    this._ws = new WebSocket(`ws://${SOCKET_URI}`);
    this._ws.addEventListener('message', this._socketMessageRecieved.bind(this));
  }

  _socketMessageRecieved(event: MessageEvent) {
    this.emit(MESSAGE_RECIEVED, event.data);
  }

  async sendArkCommand(msg: string) {
    return await this._ws.send(`arkCommand::${msg}`);
  }

  async sendSysCommand(msg: string) {
    return await this._ws.send(`sysCommand::${msg}`);
  }
}

export default new SocketService();
