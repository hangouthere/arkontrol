import koa, { Context } from 'koa';
import Router from 'koa-router';
import Database from '../../util/database';
import { koaJwt, JWT_SECRET } from './middleware/Auth';
import jwt from 'jsonwebtoken';

export default class Routes {
  private _publicRoutes!: Router;
  private _authRoutes!: Router;

  init() {
    this._publicRoutes = new Router({ prefix: '/api/v1' });
    this._authRoutes = new Router({ prefix: '/api/v1/admin' });

    this._createRoutes();
  }

  _createRoutes() {
    this._publicRoutes.post('/login', this.login);
    this._publicRoutes.get('/players', this.getPlayers);
    this._authRoutes.get('/playersTwo', koaJwt, this.getPlayers);
  }

  bindRouter(app: koa) {
    app.use(this._publicRoutes.routes());
    app.use(this._publicRoutes.allowedMethods());
    app.use(this._authRoutes.routes());
    app.use(this._authRoutes.allowedMethods());
  }

  login = async (ctx: Context) => {
    const user = await Database.validateUser(ctx.request.body);

    if (user) {
      const { password, ...userPayload } = user;

      ctx.body = {
        token: jwt.sign(userPayload, JWT_SECRET, {
          expiresIn: '10m'
        })
      };
    } else {
      ctx.throw(401, 'Invalid Username or Password');
    }
  }

  getPlayers = async (ctx: Context) => {
    const players = await Database.getAllPlayers();
    ctx.body = {
      players
    };
  }
}
