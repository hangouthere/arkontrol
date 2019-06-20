import jwtDecode from 'jwt-decode';
import { IArkCommandEntry } from '../store/reducers/arkCommands';
import { IAuthConfig } from '../store/reducers/authConfig';
import { ILogData } from '../store/reducers/log';
import { IUser } from './auth';
import BaseService from './base';

class AdminService extends BaseService {
  async getAuthConfig(): Promise<IAuthConfig> {
    return await this._baseUrl
      .url('admin/config')
      .get()
      .json(j => j.config);
  }

  async saveAuthConfig(authConfig: IAuthConfig): Promise<any> {
    return await this._baseUrl
      .url('admin/config')
      .put(authConfig)
      .json(j => j.config);
  }

  async getCommands(): Promise<Array<IArkCommandEntry>> {
    return await this._baseUrl
      .url('admin/commands')
      .get()
      .json(j => j.list);
  }

  async saveCommands(commands: Array<IArkCommandEntry>): Promise<Array<IArkCommandEntry>> {
    return await this._baseUrl
      .url('admin/commands')
      .put(commands)
      .json(j => j.config);
  }

  async getLogData(logType: string): Promise<ILogData> {
    return await this._baseUrl
      .url(`admin/log/${logType}`)
      .get()
      .json(j => j.logData);
  }

  async getUsers(): Promise<Array<IUser>> {
    return await this._baseUrl
      .url('admin/users')
      .get()
      .json(j => j.users);
  }

  async saveUser(user: IUser, isLoggedInUser: boolean = false): Promise<IUser> {
    let baseUrl = this._baseUrl.url('admin/users');
    let savePromise = !user.id ? baseUrl.post(user) : baseUrl.url(`/${user.id}`).put(user);

    const token = await savePromise.json(j => j.token);

    if (true === isLoggedInUser) {
      BaseService.token = token;
    }

    return jwtDecode(token);
  }

  async deleteUser(user: IUser): Promise<IUser> {
    let baseUrl = this._baseUrl.url(`admin/users/${user.id}`);

    await baseUrl.delete().res();
    return user;
  }
}

export default new AdminService();
