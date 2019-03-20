import KoaServer from './KoaServer';
import WebSocketServer from './WebSocketServer';
import SocketMessageProxy from './SocketMessageProxy';

const SERVER_PORT = parseInt(process.env.SERVER_PORT as string);

class BackendApp {
  private _koaServer: KoaServer;
  private _socketServer!: WebSocketServer;
  private _socketProxy!: SocketMessageProxy;

  constructor() {
    console.log(`Node Version: ${process.versions.node}`);

    this._koaServer = new KoaServer({
      port: SERVER_PORT,
      publicPath: '../public'
    });

    this.initSocketServer();
  }

  initSocketServer() {
    this._socketServer = new WebSocketServer(this._koaServer.httpServer);
    this._socketProxy = new SocketMessageProxy(this._socketServer);
  }
}

export default new BackendApp();
