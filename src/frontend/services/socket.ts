import ReduxStore from '../store';
import { RemoteStatusActions } from '../store/actions/remoteStatus';

// Declared here, but injected via WebPack.DefinePlugin
declare var SOCKET_URI: string;

class SocketService {
  private _ws!: WebSocket;

  get socket() {
    return this._ws;
  }

  constructor() {
    this._connect();
  }

  _connect() {
    if (this._ws) {
      this._ws.removeEventListener('message', this._socketMessageRecieved);
      this._ws.removeEventListener('close', this._socketDisconnected);
    }

    try {
      this._ws = new WebSocket(`ws://${SOCKET_URI}`);
      this._ws.addEventListener('open', this._socketConnected);
      this._ws.addEventListener('message', this._socketMessageRecieved);
      this._ws.addEventListener('close', this._socketDisconnected);
    } catch (err) {
      //
    }
  }

  _socketConnected = (_event: Event) => {
    ReduxStore.store.dispatch(RemoteStatusActions.setBotStatus(true));

    setTimeout(() => {
      // Kick off getting status
      ReduxStore.store.dispatch(RemoteStatusActions.getServerStatus());
    }, 1000);
  }

  _socketMessageRecieved = (event: MessageEvent) => {
    try {
      ReduxStore.store.dispatch(JSON.parse(event.data));
    } catch (err) {
      console.log(`WS Unknown Message Recieved: ${event.data}`);
    }
  }

  _socketDisconnected = (_event: CloseEvent) => {
    ReduxStore.store.dispatch(RemoteStatusActions.setBotStatus(false));
    ReduxStore.store.dispatch(RemoteStatusActions.setServerStatus(false));

    this._connect();
  }

  async sendArkCommand(msg: string) {
    return await this._ws.send(`arkCommand::${msg}`);
  }

  async sendSysCommand(msg: string) {
    return await this._ws.send(`sysCommand::${msg}`);
  }
}

export default new SocketService();
