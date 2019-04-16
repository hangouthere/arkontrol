import { Context } from 'koa';
import Router from 'koa-router';
import AuthConfigDAO from '../../../database/dao/AuthConfigDAO';
import AuthConfig from '../../../database/models/AuthConfig';
import { hasAnyRole, JTWVerify } from '../middleware/Auth';

class AdminRoutes {
  private _router!: Router;
  private _authConfigDAO!: AuthConfigDAO;

  get routes() {
    return this._router.routes();
  }

  constructor() {
    this._router = new Router({ prefix: '/admin' });
    this._authConfigDAO = new AuthConfigDAO();

    this._router.get('/config', JTWVerify, hasAnyRole(['superadmin']), this.getConfig);
    this._router.patch('/config', JTWVerify, hasAnyRole(['superadmin']), this.saveConfigPart);
  }

  getConfig = async (ctx: Context) => {
    const configEntries = await this._authConfigDAO.getConfig();
    const config = AuthConfig.fromDAO(configEntries);

    ctx.body = config;
  }

  saveConfigPart = async (ctx: Context) => {
    ctx.response.body = await this._authConfigDAO.saveConfigPart(ctx.request.body);
  }
}

export default AdminRoutes;
