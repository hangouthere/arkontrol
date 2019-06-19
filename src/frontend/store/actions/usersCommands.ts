import AdminService from '../../services/admin';
import { IUser } from '../../services/auth';
import { IActionCreator } from './index';

export interface ISaveUserPayload {
  user: IUser;
  isLoggedInUser?: boolean;
}

export interface IActionCreatorTree {
  getUsers: IActionCreator<undefined, Promise<Array<IUser>>>;
  saveUser: IActionCreator<ISaveUserPayload, Promise<IUser>>;
  deleteUser: IActionCreator<IUser, Promise<IUser>>;
  resetUser: IActionCreator;
}

export const UsersActionTypes = {
  LOAD_USERS: 'LOAD_USERS',
  SAVE_USER: 'SAVE_USER',
  DELETE_USER: 'DELETE_USER',
  RESET_USER: 'RESET_USER'
};

export const UsersActions: IActionCreatorTree = {
  getUsers: () => ({
    type: UsersActionTypes.LOAD_USERS,
    payload: AdminService.getUsers()
  }),

  saveUser: (payload?: ISaveUserPayload) => {
    if (!payload || !payload.user) {
      return undefined;
    }

    return {
      type: UsersActionTypes.SAVE_USER,
      payload: AdminService.saveUser(payload.user, payload.isLoggedInUser),
      meta: {
        isLoggedInUser: payload.isLoggedInUser
      }
    };
  },

  deleteUser(user?: IUser) {
    if (!user) {
      return undefined;
    }

    return {
      type: UsersActionTypes.DELETE_USER,
      payload: AdminService.deleteUser(user)
    };
  },

  resetUser: () => ({ type: UsersActionTypes.RESET_USER })
};
