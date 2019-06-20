import BaseService from './base';

export interface IAuthRequest {
  userName: string;
  password: string;
}

export interface IUser extends IAuthRequest {
  exp?: number; //JWT Expiration Date
  id?: number;
  roles: Array<string>;
  lastLogin?: string;
  displayName?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
}

export const NormalizeUserName = (user: IUser) => {
  if (!user) {
    return 'No User';
  }

  return user.displayName ? `${user.displayName} (${user.userName})` : user.userName;
};

class AuthService extends BaseService {
  async login(loginInfo?: IAuthRequest): Promise<IUser | undefined> {
    if (!loginInfo) {
      return undefined;
    }

    const token = await this._baseUrl
      .url('login')
      .post(loginInfo)
      .json(j => j.token);

    BaseService.token = token;

    return BaseService.currentUser;
  }
}

export default new AuthService();
