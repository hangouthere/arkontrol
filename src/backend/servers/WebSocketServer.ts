import http from 'http';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

export default class WebSocketServer extends EventEmitter {
  private _instance: WebSocket.Server;

  get instance() {
    return this._instance;
  }

  constructor(httpServer: http.Server) {
    super();

    this._instance = new WebSocket.Server({ server: httpServer });

    this._instance.on('connection', this.onSocketConnect);
  }

  onSocketConnect = (socket: WebSocket) => {
    this.emit('connection', socket);

    socket.on('message', (message: WebSocket.Data) => {
      this.emit('message', message, socket);
    });
  }
}
