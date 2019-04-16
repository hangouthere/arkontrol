import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import Router from 'koa-router';
import UserDAO from '../../../database/dao/UserDAO';
import { JWT_SECRET } from '../middleware/Auth';

class AuthRoutes {
  private _router!: Router;
  private _userDAO!: UserDAO;

  get routes() {
    return this._router.routes();
  }

  constructor() {
    this._router = new Router();
    this._userDAO = new UserDAO();

    this._router.post('/login', this.login);
  }

  login = async (ctx: Context) => {
    const user = await this._userDAO.validateUser(ctx.request.body);

    if (user) {
      const { password, ...userPayload } = user;

      ctx.body = {
        token: jwt.sign(userPayload, JWT_SECRET, {
          expiresIn: '48h'
        })
      };
    } else {
      ctx.throw(401, 'Invalid Username or Password');
    }
  }
}

export default AuthRoutes;
