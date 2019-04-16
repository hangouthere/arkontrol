import { IAuthConfig } from '../store/reducers/authConfig';
import BaseService from './base';

class AdminService extends BaseService {
  async getAuthConfig(): Promise<IAuthConfig> {
    return await this._baseUrl
      .url('admin/config')
      .get()
      .json(j => j.config);
  }

  async saveConfigPart(input: { propName: string; propValue: string }): Promise<any> {
    return await this._baseUrl
      .url('admin/config')
      .patch(input)
      .json(j => j.config);
  }
}

export default new AdminService();
