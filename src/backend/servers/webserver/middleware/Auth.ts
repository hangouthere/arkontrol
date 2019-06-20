import { Context } from 'koa';
import compose from 'koa-compose';
import jwt from 'koa-jwt';
import { IMiddleware } from 'koa-router';
import { hasAnyRole, hasRole } from '../../../../commonUtil';
import { IUser } from '../../../database/models/User';

export const JWT_SECRET = process.env.SECRET || 'secret';

const catchJWTErrors = async (ctx: Context, next: () => Promise<any>) => {
  try {
    return next();
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        error: err.originalError ? err.originalError.message : err.message
      };
    } else {
      throw err;
    }
  }
};

const koaJWT = jwt({
  secret: JWT_SECRET,
  tokenKey: 'token'
});

export const JTWVerify = compose([catchJWTErrors, koaJWT]);

export function hasAnyRoleMiddleware(roles: Array<string>): IMiddleware {
  return async (ctx: Context, next: () => Promise<any>) => {
    const user: IUser = ctx.state.user;

    const hasARole = hasAnyRole(roles, user.roles);

    if (false === hasARole) {
      ctx.throw(403, "User doesn't have the right role");
    }

    await next();
  };
}

export function hasRoleMiddleware(role: string): IMiddleware {
  return async (ctx: Context, next: () => Promise<any>) => {
    const user: IUser = ctx.state.user;

    const hasARole = hasRole(role, user.roles);

    if (false === hasARole) {
      ctx.throw(403, "User doesn't have the right role");
    }

    await next();
  };
}
