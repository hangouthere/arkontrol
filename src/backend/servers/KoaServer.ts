import * as path from 'path';
import http from 'http';
import koa from 'koa';
import koaStatic from 'koa-static';
import RootPath from '../RootPath';
import LoggerConfig from '../LoggerConfig';

const Logger = LoggerConfig.instance.getLogger('server');

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
    const fullPath = path.resolve(RootPath, options.publicPath);

    this._instance = new koa();
    this._httpServer = http.createServer(this._instance.callback());
    this._instance.use(koaStatic(fullPath));

    this._httpServer.listen(options.port);

    Logger.info(`Server Listening on http://localhost:${options.port}`);
    Logger.info(`Serving Static files from ${fullPath}`);
  }
}
