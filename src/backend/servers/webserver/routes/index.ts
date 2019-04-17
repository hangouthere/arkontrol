import koa from 'koa';
import Router from 'koa-router';
import MessagingBus from '../../../util/MessagingBus';
import AdminRoutes from './admin';
import AuthRoutes from './auth';
import PlayersRoutes from './players';

export default class Routes {
  private _apiRouter!: Router;
  private _messagingBus: MessagingBus;

  constructor(messagingBus: MessagingBus) {
    this._messagingBus = messagingBus;
  }

  bindRouter(app: koa) {
    this._apiRouter = new Router({ prefix: '/api/v1' });

    this._apiRouter.use(new AuthRoutes({ messagingBus: this._messagingBus }).routes);
    this._apiRouter.use(new PlayersRoutes({ messagingBus: this._messagingBus }).routes);
    this._apiRouter.use(new AdminRoutes({ messagingBus: this._messagingBus }).routes);

    app.use(this._apiRouter.routes());
    app.use(this._apiRouter.allowedMethods());
  }
}
