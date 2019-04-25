import { IArkCommandEntry } from '../store/reducers/arkCommands';
import { IAuthConfig } from '../store/reducers/authConfig';
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
}

export default new AdminService();
