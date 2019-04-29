import { Context } from 'koa';
import Router from 'koa-router';
import { IKoaServerInitOptions } from '..';
import ArkCommandsDAO from '../../../database/dao/ArkCommandsDAO';
import AuthConfigDAO from '../../../database/dao/AuthConfigDAO';
import ArkCommands from '../../../database/models/ArkCommands';
import AuthConfig from '../../../database/models/AuthConfig';
import { EventMessages } from '../../../util/MessagingBus';
import { hasAnyRole, JTWVerify } from '../middleware/Auth';
import BaseRoute from './base';

class AdminRoutes extends BaseRoute {
  private _authConfigDAO!: AuthConfigDAO;
  private _commandsDAO!: ArkCommandsDAO;

  get routes() {
    return this._router.routes();
  }

  constructor(options: IKoaServerInitOptions) {
    super(options);

    this._router = new Router({ prefix: '/admin' });
    this._authConfigDAO = new AuthConfigDAO();
    this._commandsDAO = new ArkCommandsDAO();

    this._router.get('/config', JTWVerify, hasAnyRole(['superadmin']), this.getConfig);
    this._router.put('/config', JTWVerify, hasAnyRole(['superadmin']), this.saveConfig);
    this._router.get('/commands', JTWVerify, hasAnyRole(['superadmin']), this.getCommands);
    this._router.put('/commands', JTWVerify, hasAnyRole(['superadmin']), this.saveCommands);
  }

  getConfig = async (ctx: Context) => {
    const configEntries = await this._authConfigDAO.getConfigEntries();
    const config = AuthConfig.fromDAO(configEntries);

    ctx.body = config;
  }

  saveConfig = async (ctx: Context) => {
    await this._authConfigDAO.saveConfig(ctx.request.body);

    return this.getConfig(ctx);
  }

  getCommands = async (ctx: Context) => {
    const commandEntries = await this._commandsDAO.getCommands();
    const commands = new ArkCommands(commandEntries);

    ctx.body = commands;
  }

  saveCommands = async (ctx: Context) => {
    await this._commandsDAO.saveCommands(ctx.request.body);

    this._messagingBus.emit(EventMessages.RCON.CommandsChange);

    return this.getCommands(ctx);
  }
}

export default AdminRoutes;
