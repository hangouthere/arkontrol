import { Context } from 'koa';
import Router from 'koa-router';
import { IKoaServerInitOptions } from '..';
import { hasRole } from '../../../../commonUtil';
import ArkCommandsDAO from '../../../database/dao/ArkCommandsDAO';
import AuthConfigDAO from '../../../database/dao/AuthConfigDAO';
import UserDAO from '../../../database/dao/UserDAO';
import ArkCommands from '../../../database/models/ArkCommands';
import AuthConfig from '../../../database/models/AuthConfig';
import { IUser } from '../../../database/models/User';
import { EventMessages } from '../../../util/MessagingBus';
import { hasAnyRoleMiddleware, JTWVerify } from '../middleware/Auth';
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

    this._router.get('/config', JTWVerify, hasAnyRoleMiddleware(['superadmin']), this.getConfig);
    this._router.put('/config', JTWVerify, hasAnyRoleMiddleware(['superadmin']), this.saveConfig);
    this._router.get('/commands', JTWVerify, hasAnyRoleMiddleware(['superadmin']), this.getCommands);
    this._router.put('/commands', JTWVerify, hasAnyRoleMiddleware(['superadmin']), this.saveCommands);
    this._router.put('/profile/:id', JTWVerify, hasAnyRoleMiddleware(['admin', 'superadmin']), this.saveProfile);
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

  saveProfile = async (ctx: Context) => {
    const userDao = new UserDAO();
    const inUser = ctx.request.body as IUser;
    let savedUser = await userDao.getById(ctx.params.id);
    const isSuper = hasRole('superadmin', (ctx.state.user as IUser).roles);
    const isSelf = inUser.id == savedUser.id;

    // Regular users can only save own profile
    if (false === isSuper && false === isSelf) {
      ctx.throw(403, 'Invalid Permission to Save User');
      return;
    }

    // Test Role changes
    const inRoles = [...inUser.roles].sort().join('');
    const savedRoles = [...savedUser.roles].sort().join('');
    if (inRoles != savedRoles) {
      if (false === isSuper) {
        ctx.throw(403, 'Invalid Permission to Save User Roles');
        return;
      }

      if (true === isSuper && true === isSelf) {
        ctx.throw(403, 'You cannot change your own roles, request another SuperAdmin to do it for you.');
        return;
      }
    }

    // Save Password
    try {
      const isValidChange = userDao.validatePasswordChange(inUser, savedUser);

      if (true === isValidChange) {
        await userDao.saveUserPassword(inUser);
      }
    } catch (err) {
      ctx.throw(422, err.message.toString());
      return;
    }

    // Save User
    await userDao.saveUser(inUser);

    savedUser = await userDao.getById(ctx.params.id);

    ctx.body = userDao.signUser(savedUser);
  }
}

export default AdminRoutes;
