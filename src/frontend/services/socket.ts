import { EventEmitter } from 'events';
import { ShowToaster } from './toaster';

export const EVENTS = {
  CONNECTED: 'socket::CONNECTED',
  DISCONNECTED: 'socket::DISCONNECTED',
  MESSAGE_RECIEVED: 'socket::MESSAGE_RECIEVED'
};

class SocketService extends EventEmitter {
  private _ws!: WebSocket;
  private _hasBeenWarned = false;

  get socket() {
    return this._ws;
  }

  constructor() {
    super();
    this._connect();
  }

  _connect = () => {
    const websocketUri = (window as any).WEBSOCKET_URI;

    if (this._ws) {
      this._ws.removeEventListener('message', this._socketMessageRecieved);
      this._ws.removeEventListener('close', this._socketDisconnected);
    }

    if (!websocketUri) {
      return setTimeout(this._connect, 1000);
    }

    try {
      this._ws = new WebSocket(`ws://${websocketUri}`);
      this._ws.addEventListener('open', this._socketConnected);
      this._ws.addEventListener('message', this._socketMessageRecieved);
      this._ws.addEventListener('close', this._socketDisconnected);
    } catch (err) {
      //
    }

    return undefined;
  }

  _socketConnected = (_event: Event) => {
    this._hasBeenWarned = false;

    this.emit(EVENTS.CONNECTED);

    ShowToaster({
      message: 'Connected to Bot!',
      intent: 'success'
    });
  }

  _socketMessageRecieved = (event: MessageEvent) => {
    try {
      const messageData = JSON.parse(event.data);
      this.emit(EVENTS.MESSAGE_RECIEVED, messageData);
    } catch (err) {
      console.log(`WS Unknown Message Recieved: ${event.data}`);
    }
  }

  _socketDisconnected = (_event: CloseEvent) => {
    this.emit(EVENTS.DISCONNECTED);

    if (false === this._hasBeenWarned) {
      this._hasBeenWarned = true;
      ShowToaster({
        message: 'Connection to Bot lost... Reconnecting',
        intent: 'warning'
      });
    }

    this._connect();
  }

  async sendArkCommand(msg: string) {
    await this._ws.send(`rconCommand::${msg}`);

    ShowToaster({
      message: 'Ark Command Sent',
      intent: 'success'
    });
  }

  async sendSysCommand(msg: string) {
    await this._ws.send(`sysCommand::${msg}`);

    ShowToaster({
      message: 'System Command Sent',
      intent: 'success'
    });
  }
}

export default new SocketService();
