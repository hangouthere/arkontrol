import jwtDecode from 'jwt-decode';
import BaseService from './base';

export interface IAuthRequest {
  userName: string;
  password: string;
}

export interface IUser extends IAuthRequest {
  role: string;
  lastLogin: string;
}

class AuthService extends BaseService {
  _user!: IUser;

  get currentUser() {
    return this._user;
  }

  async login(loginInfo?: IAuthRequest) {
    if (!loginInfo) {
      return undefined;
    }

    this._user = await this._baseUrl
      .url('login')
      .post(loginInfo)
      .json(j => jwtDecode(j.token));

    return this._user;
  }
}

export default new AuthService();
