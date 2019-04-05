import AuthService, { IAuthRequest, IUser } from './../../services/auth';
import { IActionCreator } from './index';

export interface IActionCreatorTree {
  setRedirect: IActionCreator<string, string>;
  loginRequest: IActionCreator<IAuthRequest, Promise<IUser | undefined>>;
  logoutRequest: IActionCreator<undefined, undefined>;
}

export const AuthActionTypes = {
  SET_REDIRECT: 'SET_REDIRECT',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT'
};

export const AuthActions: IActionCreatorTree = {
  setRedirect: (uri?: string) => ({
    type: AuthActionTypes.SET_REDIRECT,
    payload: uri
  }),
  loginRequest: (loginData?: IAuthRequest) => ({
    type: AuthActionTypes.LOGIN,
    payload: AuthService.login(loginData)
  }),
  logoutRequest: () => ({
    type: AuthActionTypes.LOGOUT
  })
};
