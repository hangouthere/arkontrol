import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import jwt from 'koa-jwt';

export const JWT_SECRET = process.env.SECRET || 'secret';

export const koaJwt = jwt({
  secret: JWT_SECRET,
  tokenKey: 'token'
});

export function hasRoles(roles: Array<string>): IMiddleware {
  return async (ctx: Context, next: () => Promise<any>) => {
    // TODO: Get a user on the state
    const user: any = ctx.state.user;
    // const user: AuthUser = ctx.state.user;

    // TODO: Make `roles` an array to scan through
    if (roles.indexOf(user.roles) < 0) {
      throw new Error("Permission denied: User doesn't have the right role");
    }

    await next();
  };
}
