import BaseService from './base';

export interface IAuthRequest {
  userName: string;
  password: string;
}

export interface IUser extends IAuthRequest {
  exp: number;
  role: string;
  lastLogin: string;
}

class AuthService extends BaseService {
  async login(loginInfo?: IAuthRequest) {
    if (!loginInfo) {
      return undefined;
    }

    const token = await this._baseUrl
      .url('login')
      .post(loginInfo)
      .json(j => j.token);

    BaseService.token = token;

    localStorage.setItem('_token', token);

    return this.currentUser;
  }

  logout() {
    BaseService.token = undefined;
    localStorage.removeItem('_token');
  }
}

export default new AuthService();
