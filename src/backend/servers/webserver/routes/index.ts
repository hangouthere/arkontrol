import koa from 'koa';
import Router from 'koa-router';
import { IKoaServerInitOptions } from '..';
import AdminRoutes from './admin';
import AuthRoutes from './auth';
import LogRoutes from './log';
import PlayersRoutes from './players';
import RemoteStatusRoutes from './remoteStatus';

export default class Routes {
  private _apiRouter!: Router;
  private _options: IKoaServerInitOptions;

  constructor(options: IKoaServerInitOptions) {
    this._options = options;
  }

  bindRouter(app: koa) {
    this._apiRouter = new Router({ prefix: '/api/v1' });

    this._apiRouter.use(new AdminRoutes(this._options).routes);
    this._apiRouter.use(new AuthRoutes(this._options).routes);
    this._apiRouter.use(new PlayersRoutes(this._options).routes);
    this._apiRouter.use(new RemoteStatusRoutes(this._options).routes);
    this._apiRouter.use(new LogRoutes(this._options).routes);

    app.use(this._apiRouter.routes());
    app.use(this._apiRouter.allowedMethods());
  }
}
