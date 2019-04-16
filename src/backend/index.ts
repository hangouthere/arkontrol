import 'source-map-support/register';

import fetch from 'node-fetch';

import Database from './database';
import ConfigParser from './util/ConfigParser';
import KoaServer from './servers/webserver';
import RCONClient from './rcon/RCONClient';
import RCONCommandList from './rcon/RCONCommandList';
import RCONStatus from './rcon/RCONStatus';
import SocketMessageProxy from './SocketMessageProxy';
import WebSocketServer from './servers/WebSocketServer';

// WebPack will copy this to our dist folder
import './rconConfig';

(global as any).fetch = fetch;

const SERVER_PORT = parseInt(process.env.SERVER_PORT as string);

class BackendApp {
  private _koaServer!: KoaServer;
  private _socketServer!: WebSocketServer;
  private _socketProxy!: SocketMessageProxy;
  private _rconClient!: RCONClient;

  constructor() {
    console.log(`Node Version: ${process.versions.node}`);

    this.init();
  }

  async init() {
    await Database.init();
    await ConfigParser.init();

    this.initWebServer();
    this.initSocketServer();
    this.initRCONClient();
    this.initSocketRCONProxy();
  }

  initWebServer() {
    this._koaServer = new KoaServer({
      port: SERVER_PORT,
      publicPath: '../public'
    });
  }

  initSocketServer() {
    this._socketServer = new WebSocketServer(this._koaServer.httpServer);
  }

  async initRCONClient() {
    this._rconClient = new RCONClient();

    await this._rconClient.init();

    const rconCmdList = new RCONCommandList(this._rconClient);
    const rconStatus = new RCONStatus(this._rconClient);

    await rconCmdList.init();
    await rconStatus.init();
  }

  initSocketRCONProxy() {
    this._socketProxy = new SocketMessageProxy(this._socketServer, this._rconClient);
  }
}

export default new BackendApp();
