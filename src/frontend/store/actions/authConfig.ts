import AdminService from '../../services/admin';
import { IAuthConfig } from '../reducers/authConfig';
import { IActionCreator } from './index';

export interface IActionCreatorTree {
  getAuthConfig: IActionCreator<undefined, Promise<IAuthConfig>>;
  saveAuthConfig: IActionCreator<IAuthConfig, Promise<IAuthConfig>>;
}

export const AuthConfigActionTypes = {
  LOAD_AUTH_CONFIG: 'LOAD_AUTH_CONFIG',
  SAVE_AUTH_CONFIG: 'SAVE_AUTH_CONFIG'
};

export const AuthConfigActions: IActionCreatorTree = {
  getAuthConfig: () => ({
    type: AuthConfigActionTypes.LOAD_AUTH_CONFIG,
    payload: AdminService.getAuthConfig()
  }),

  saveAuthConfig: (input?: IAuthConfig) => {
    if (!input) {
      return undefined;
    }

    return {
      type: AuthConfigActionTypes.SAVE_AUTH_CONFIG,
      payload: AdminService.saveAuthConfig(input)
    };
  }
};
