import fs from 'fs-extra';
import { Context } from 'koa';
import Router from 'koa-router';
import path from 'path';
import { IKoaServerInitOptions } from '..';
import { hasAnyRoleMiddleware, JTWVerify } from '../middleware/Auth';
import BaseRoute from './base';

class LogRoutes extends BaseRoute {
  get routes() {
    return this._router.routes();
  }

  constructor(options: IKoaServerInitOptions) {
    super(options);

    this._router = new Router({ prefix: '/admin' });

    this._router.get('/log/:type', JTWVerify, hasAnyRoleMiddleware(['superadmin', 'admin']), this.getLog);
  }

  getLog = async (ctx: Context) => {
    const { type } = ctx.params;
    const fileName = `${type}.json`;
    const filePath = path.join(this._options.logPath, fileName);

    const fileExists = await fs.pathExists(filePath);

    if (false === fileExists) {
      ctx.throw(404, 'Invalid Log File');
    }

    // Read file contents, which is NOT proper JSON, and make it proper JSON.
    let fileData = await fs.readFile(filePath, 'utf8');
    fileData = `[${fileData.slice(0, -3)}]`; // Gets rid of ",/r/n" at end of data

    ctx.body = {
      logData: JSON.parse(fileData)
    };
  }
}

export default LogRoutes;
