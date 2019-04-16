import AdminService from '../../services/admin';
import { IAuthConfig } from '../reducers/authConfig';
import { IActionCreator } from './index';

export interface IAuthConfigEntry {
  propName: string;
  propValue: string;
}

export interface IActionCreatorTree {
  getAuthConfig: IActionCreator<undefined, Promise<IAuthConfig>>;
  saveAuthConfigPart: IActionCreator<IAuthConfigEntry, Promise<IAuthConfig>>;
}

export const AuthConfigActionTypes = {
  LOAD_AUTH_CONFIG: 'LOAD_AUTH_CONFIG',
  SAVE_AUTH_CONFIG_PART: 'SAVE_AUTH_CONFIG_PART'
};

export const AuthConfigActions: IActionCreatorTree = {
  getAuthConfig: () => ({
    type: AuthConfigActionTypes.LOAD_AUTH_CONFIG,
    payload: AdminService.getAuthConfig()
  }),

  saveAuthConfigPart: (input?: IAuthConfigEntry) => {
    if (!input) {
      return undefined;
    }

    return {
      type: AuthConfigActionTypes.SAVE_AUTH_CONFIG_PART,
      payload: AdminService.saveConfigPart(input),
      meta: input
    };
  }
};
