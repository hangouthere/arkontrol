import koa, { Context } from 'koa';
import Router from 'koa-router';
import Database from '../../util/database';

export default class Routes {
  private _publicRoutes!: Router;
  private _authRoutes!: Router;

  init() {
    this._publicRoutes = new Router({ prefix: '/api/v1' });
    this._authRoutes = new Router({ prefix: '/api/v1/admin' });

    this._createRoutes();
  }

  _createRoutes() {
    this._publicRoutes.get('/players', this.getPlayers);
  }

  bindRouter(app: koa) {
    app.use(this._publicRoutes.routes());
    app.use(this._publicRoutes.allowedMethods());
  }

  getPlayers = async (ctx: Context) => {
    const userInfo = await Database.getAllPlayers();
    ctx.body = {
      users: userInfo
    };
  }
}
