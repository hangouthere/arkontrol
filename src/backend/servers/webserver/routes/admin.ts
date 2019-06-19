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
    this._router.get('/users', JTWVerify, hasAnyRoleMiddleware(['superadmin']), this.getUsers);
    this._router.post('/users', JTWVerify, hasAnyRoleMiddleware(['superadmin']), this.createUser);
    this._router.delete('/users/:id', JTWVerify, hasAnyRoleMiddleware(['superadmin']), this.deleteUser);
    this._router.put('/users/:id', JTWVerify, hasAnyRoleMiddleware(['admin', 'superadmin']), this.saveUser);
  }

  getConfig = async (ctx: Context) => {
    const configEntries = await this._authConfigDAO.getConfigEntries();
    const config = AuthConfig.fromDAO(configEntries);

    ctx.body = config;
  };

  saveConfig = async (ctx: Context) => {
    await this._authConfigDAO.saveConfig(ctx.request.body);

    return this.getConfig(ctx);
  };

  getCommands = async (ctx: Context) => {
    const commandEntries = await this._commandsDAO.getCommands();
    const commands = new ArkCommands(commandEntries);

    ctx.body = commands;
  };

  saveCommands = async (ctx: Context) => {
    await this._commandsDAO.saveCommands(ctx.request.body);

    this._messagingBus.emit(EventMessages.RCON.CommandsChange);

    return this.getCommands(ctx);
  };

  getUsers = async (ctx: Context) => {
    const userDao = new UserDAO();

    ctx.body = {
      users: await userDao.getUsers()
    };
  };

  normalizeError(ctx: Context, err: Error, inUser: IUser) {
    if (err.message.toString().includes('UNIQUE constraint failed: Users.userName')) {
      return ctx.throw(422, `UserName already exists: ${inUser.userName}`);
    }

    return ctx.throw(422, err.message.toString());
  }

  createUser = async (ctx: Context) => {
    const userDao = new UserDAO();
    const inUser = ctx.request.body as IUser;

    if (!inUser.userName) {
      return ctx.throw(422, 'Missing UserName');
    }

    if (!inUser.newPassword) {
      return ctx.throw(422, 'Missing Password');
    }

    if (!inUser.roles) {
      return ctx.throw(422, 'Missing Roles');
    }

    try {
      const newUserStatement = await userDao.createUser(inUser);
      const savedUser = await userDao.getById(newUserStatement.lastID);

      ctx.body = userDao.signUser(savedUser);
      return undefined;
    } catch (err) {
      return this.normalizeError(ctx, err, inUser);
    }
  };

  deleteUser = async (ctx: Context) => {
    const userDao = new UserDAO();
    const inUser = await userDao.getById(ctx.params.id);
    const isSelf = inUser.id == ctx.state.user.id;
    const userCount = await userDao.getSuperCount();

    if (userCount <= 1) {
      ctx.throw(
        422,
        'You cannot delete the last SuperAdmin. Either give credentials to another person, or create another SuperAdmin.'
      );
      return;
    }

    if (true === isSelf) {
      ctx.throw(403, 'You cannot delete your own user, ask another SuperAdmin to delete it for you.');
      return;
    }

    await userDao.deleteUser(inUser);

    ctx.body = {
      deleted: true,
      user: inUser
    };

    return undefined;
  };

  saveUser = async (ctx: Context) => {
    const userDao = new UserDAO();
    const inUser = ctx.request.body as IUser;
    let savedUser = await userDao.getById(ctx.params.id);
    const isSuper = hasRole('superadmin', (ctx.state.user as IUser).roles);
    const isSelf = inUser.id == ctx.state.user.id;
    const changedUserName = inUser.userName !== savedUser.userName;

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
        return ctx.throw(403, 'Invalid Permission to Save User Roles');
      }

      if (true === isSuper && true === isSelf) {
        return ctx.throw(403, 'You cannot change your own Roles, request another SuperAdmin to do it for you.');
      }
    }

    if (true === changedUserName && true === isSelf) {
      return ctx.throw(403, 'You cannot change your own UserName, request another SuperAdmin to do it for you.');
    }

    // Save Password
    try {
      if (true === isSelf) {
        const isValidChange = userDao.validatePasswordChange(inUser, savedUser);

        if (true === isValidChange) {
          await userDao.saveUserPassword(inUser);
        }
      } else if (false === isSelf && !isSuper) {
        return ctx.throw(403, 'You cannot change passwords for others without the proper authorization.');
      }

      // Save User
      await userDao.saveUser(inUser);

      savedUser = await userDao.getById(ctx.params.id);

      ctx.body = userDao.signUser(savedUser);
      return undefined;
    } catch (err) {
      return this.normalizeError(ctx, err, inUser);
    }
  };
}

export default AdminRoutes;
