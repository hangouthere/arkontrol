import WebSocket from 'ws';
import WebSocketServer from './WebSocketServer';

export default class SocketMessageProxy {
  private _webSocketServer: WebSocketServer;

  constructor(socketServer: WebSocketServer) {
    this._webSocketServer = socketServer;
    this._webSocketServer.on('connection', this.addConnection);
    this._webSocketServer.on('message', this.consumeMessage);
  }

  addConnection(socket: WebSocket) {
    socket.send('You have connected!');
  }

  consumeMessage = (socket: WebSocket, data: WebSocket.Data) => {
    const msg = `Message Recieved: "${data}"`;

    console.log(msg);
    socket.send(msg);
  }
}
