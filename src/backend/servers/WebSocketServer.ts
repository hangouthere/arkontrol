import http from 'http';
import WebSocket from 'ws';
import MessagingBus, { EventMessages } from '../util/MessagingBus';

interface IWebSocketServerInitOptions {
  httpServer: http.Server;
  messagingBus: MessagingBus;
}

export default class WebSocketServer {
  private _instance: WebSocket.Server;
  private _messagingBus: MessagingBus;

  get instance() {
    return this._instance;
  }

  constructor(options: IWebSocketServerInitOptions) {
    this._messagingBus = options.messagingBus;
    this._instance = new WebSocket.Server({ server: options.httpServer });

    this._instance.on('connection', this.onSocketConnect);
  }

  onSocketConnect = (socket: WebSocket) => {
    this._messagingBus.emit(EventMessages.Socket.Connected, socket);

    socket.on('message', (message: WebSocket.Data) => {
      this._messagingBus.emit(EventMessages.Socket.Message, message, socket);
    });
  }
}
