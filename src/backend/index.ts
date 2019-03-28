import 'source-map-support/register';

import ConfigParser from './ConfigParser';
import KoaServer from './servers/KoaServer';
import RCONClient from './rcon/RCONClient';
import RCONCommandList from './rcon/RCONCommandList';
import RCONStatus from './rcon/RCONStatus';
import SocketMessageProxy from './SocketMessageProxy';
import WebSocketServer from './servers/WebSocketServer';

// WebPack will copy this to our dist folder
import './rconConfig';

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
    await ConfigParser.init();

    this.initWebServer();
    this.initSocketServer();
    this.initRCONClient();
  }

  initWebServer() {
    this._koaServer = new KoaServer({
      port: SERVER_PORT,
      publicPath: '../public'
    });
  }

  initSocketServer() {
    this._socketServer = new WebSocketServer(this._koaServer.httpServer);
    this._socketProxy = new SocketMessageProxy(this._socketServer);
  }

  async initRCONClient() {
    this._rconClient = new RCONClient();

    await this._rconClient.init();

    const rconCmdList = new RCONCommandList(this._rconClient);
    const rconStatus = new RCONStatus(this._rconClient);
  }
}

export default new BackendApp();
