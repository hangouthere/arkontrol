import * as path from 'path';
import http from 'http';
import koa from 'koa';
import koaStatic from 'koa-static';

interface IKoaServerInitOptions {
  publicPath: string;
  port: number;
}

export default class KoaServer {
  private _instance: koa;
  private _httpServer: http.Server;

  get httpServer() {
    return this._httpServer;
  }

  get instance() {
    return this._instance;
  }

  constructor(options: IKoaServerInitOptions) {
    const fullPath = path.resolve(__dirname, options.publicPath);

    this._instance = new koa();
    this._httpServer = http.createServer(this._instance.callback());
    this._instance.use(koaStatic(fullPath));

    this._httpServer.listen(options.port);

    console.log(`[KoaServer] Server Listening on http://localhost:${options.port}`);
    console.log(`[KoaServer] Serving Static files from ${fullPath}`);
  }
}
