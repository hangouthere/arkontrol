import * as path from 'path';
import http from 'http';
import koa from 'koa';
import koaCors from '@koa/cors';
import koaBodyparser from 'koa-bodyparser';
import koaStatic from 'koa-static';
import RootPath from '../../RootPath';
import LoggerConfig from '../../util/LoggerConfig';
import Routes from './Routes';

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
    const staticPath = path.resolve(RootPath, options.publicPath);
    const routes = new Routes();

    this._instance = new koa();
    this._httpServer = http.createServer(this._instance.callback());
    this._instance.use(koaCors());
    this._instance.use(koaStatic(staticPath));
    this._instance.use(koaBodyparser());

    routes.bindRouter(this._instance);

    this._httpServer.listen(options.port);

    Logger.info(`Server Listening on http://localhost:${options.port}`);
    Logger.info(`Serving Static files from ${staticPath}`);
  }
}
