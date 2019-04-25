import { Context } from 'koa';
import compose from 'koa-compose';
import jwt from 'koa-jwt';
import { IMiddleware } from 'koa-router';
import { IUser } from '../../../database/models/User';

export const JWT_SECRET = process.env.SECRET || 'secret';

const catchJWTErrors = (ctx: Context, next: () => Promise<any>) => {
  return next().catch(err => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        error: err.originalError ? err.originalError.message : err.message
      };
    } else {
      throw err;
    }
  });
};

const koaJWT = jwt({
  secret: JWT_SECRET,
  tokenKey: 'token'
});

export const JTWVerify = compose([catchJWTErrors, koaJWT]);

export function hasAnyRole(roles: Array<string>): IMiddleware {
  return async (ctx: Context, next: () => Promise<any>) => {
    const user: IUser = ctx.state.user;

    const hasARole = roles.some(r => (user.roles as Array<string>).includes(r));

    if (false === hasARole) {
      ctx.throw(403, "User doesn't have the right role");
    }

    await next();
  };
}
