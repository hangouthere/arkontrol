import 'source-map-support/register';

import fetch from 'node-fetch';
import Database from './database';
import RCONManager from './rcon/RCONManager';
import KoaServer from './servers/webserver';
import WebSocketServer from './servers/WebSocketServer';
import SocketMessageProxy from './SocketMessageProxy';
import MessagingBus from './util/MessagingBus';

(global as any).fetch = fetch;

const SERVER_PORT = parseInt(process.env.SERVER_PORT as string);

class BackendApp {
  private _koaServer!: KoaServer;
  private _socketServer!: WebSocketServer;
  private _socketProxy!: SocketMessageProxy;
  private _messagingBus!: MessagingBus;
  private _rconMgr!: RCONManager;

  constructor() {
    console.log(`Node Version: ${process.versions.node}`);

    this.init();
  }

  async init() {
    this._messagingBus = new MessagingBus();

    await Database.init();

    this.initWebServer();
    this.initSocketServer();
    this.initRCONManager();
    this.initSocketRCONProxy();
  }

  initWebServer() {
    this._koaServer = new KoaServer({
      messagingBus: this._messagingBus,
      port: SERVER_PORT,
      publicPath: '../public',
      logPath: './logs'
    });
  }

  initSocketServer() {
    this._socketServer = new WebSocketServer({
      httpServer: this._koaServer.httpServer,
      messagingBus: this._messagingBus
    });
  }

  async initRCONManager() {
    this._rconMgr = new RCONManager({
      messagingBus: this._messagingBus
    });

    await this._rconMgr.init();
  }

  initSocketRCONProxy() {
    this._socketProxy = new SocketMessageProxy({
      messagingBus: this._messagingBus,
      rconMgr: this._rconMgr,
      socketServer: this._socketServer
    });

    this._socketProxy.init();
  }
}

export default new BackendApp();
