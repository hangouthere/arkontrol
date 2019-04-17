// Declared here, but injected via WebPack.DefinePlugin
declare var SOCKET_URI: string;

class SocketService {
  private _ws!: WebSocket;

  get socket() {
    return this._ws;
  }

  constructor() {
    this._ws = new WebSocket(`ws://${SOCKET_URI}`);
    // this._ws.addEventListener('message', this._socketMessageRecieved.bind(this));
  }

  // TODO: Add internal message recieiving
  //   - updating player list ondemand instead of timed
  //   - status of RCON connectivity, system status

  // _socketMessageRecieved(event: MessageEvent) {
  //   this.emit(MESSAGE_RECIEVED, event.data);
  // }

  async sendArkCommand(msg: string) {
    return await this._ws.send(`arkCommand::${msg}`);
  }

  async sendSysCommand(msg: string) {
    return await this._ws.send(`sysCommand::${msg}`);
  }
}

export default new SocketService();
