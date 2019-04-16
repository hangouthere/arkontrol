import koa from 'koa';
import Router from 'koa-router';
import AuthRoutes from './auth';
import PlayersRoutes from './players';
import AdminRoutes from './admin';

export default class Routes {
  private _apiRouter!: Router;

  bindRouter(app: koa) {
    this._apiRouter = new Router({ prefix: '/api/v1' });

    this._apiRouter.use(new AuthRoutes().routes);
    this._apiRouter.use(new PlayersRoutes().routes);
    this._apiRouter.use(new AdminRoutes().routes);

    app.use(this._apiRouter.routes());
    app.use(this._apiRouter.allowedMethods());
  }
}
