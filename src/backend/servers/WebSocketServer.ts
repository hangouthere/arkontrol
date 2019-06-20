import http from 'http';
import { decode as JWTDecode } from 'jsonwebtoken';
import { parse as QueryParse } from 'querystring';
import { parse as URLParse } from 'url';
import WebSocket from 'ws';
import { IUser } from '../database/models/User';
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
    this._instance = new WebSocket.Server({ noServer: true });

    this._instance.on('connection', this.onSocketConnect);
    options.httpServer.on('upgrade', this.onUpgradeRequest);
  }

  onUpgradeRequest = (request: http.IncomingMessage, socket: any, head: any) => {
    const parsedUrl = URLParse(request.url!);

    const doUpgrade = (user?: IUser) => {
      this._instance.handleUpgrade(request, socket, head, client => {
        if (user) {
          (client as any).user = user;
        }

        this._instance.emit('connection', client, request);
      });
    };

    if (!parsedUrl.query) {
      return doUpgrade();
    }

    const inboundToken = QueryParse(parsedUrl.query).jwt as string;
    let decodedUser;

    if (inboundToken) {
      try {
        const decode = JWTDecode(inboundToken, { complete: true }) as any;
        decodedUser = decode.payload as IUser;
      } catch (err) {
        //
      }
    }

    return doUpgrade(decodedUser);
  };

  onSocketConnect = (socket: WebSocket) => {
    this._messagingBus.emit(EventMessages.Socket.Connected, socket);

    socket.on('message', (message: WebSocket.Data) => {
      this._messagingBus.emit(EventMessages.Socket.Message, message, socket);
    });

    const user: IUser = (socket as any).user;
    const name = user ? user.userName : 'Guest';
    socket.send(`Connected as ${name}`);
  };
}
