import 'source-map-support/register';

import fetch from 'node-fetch';
import Database from './database';
import RCONClient, { IRCONHelperInitOptions } from './rcon/RCONClient';
import RCONCommandList from './rcon/RCONCommandList';
import RCONStatus from './rcon/RCONStatus';
import KoaServer from './servers/webserver';
import WebSocketServer from './servers/WebSocketServer';
import SocketMessageProxy from './SocketMessageProxy';
import ConfigParser from './util/ConfigParser';
import MessagingBus from './util/MessagingBus';

(global as any).fetch = fetch;

const SERVER_PORT = parseInt(process.env.SERVER_PORT as string);

class BackendApp {
  private _koaServer!: KoaServer;
  private _socketServer!: WebSocketServer;
  private _socketProxy!: SocketMessageProxy;
  private _rconClient!: RCONClient;
  private _messagingBus!: MessagingBus;

  constructor() {
    console.log(`Node Version: ${process.versions.node}`);

    this.init();
  }

  async init() {
    this._messagingBus = new MessagingBus();

    await Database.init();
    await ConfigParser.init();

    this.initWebServer();
    this.initSocketServer();
    this.initRCONClient();
    this.initSocketRCONProxy();
  }

  initWebServer() {
    this._koaServer = new KoaServer({
      messagingBus: this._messagingBus,
      port: SERVER_PORT,
      publicPath: '../public'
    });
  }

  initSocketServer() {
    this._socketServer = new WebSocketServer({
      httpServer: this._koaServer.httpServer,
      messagingBus: this._messagingBus
    });
  }

  async initRCONClient() {
    this._rconClient = new RCONClient({
      messagingBus: this._messagingBus
    });

    await this._rconClient.init();

    const rconHelperInitOptions: IRCONHelperInitOptions = {
      messagingBus: this._messagingBus,
      client: this._rconClient
    };

    const rconCmdList = new RCONCommandList(rconHelperInitOptions);
    const rconStatus = new RCONStatus(rconHelperInitOptions);

    await rconCmdList.init();
    await rconStatus.init();
  }

  initSocketRCONProxy() {
    this._socketProxy = new SocketMessageProxy({
      messagingBus: this._messagingBus,
      rconClient: this._rconClient,
      socketServer: this._socketServer
    });

    this._socketProxy.init();
  }
}

export default new BackendApp();
