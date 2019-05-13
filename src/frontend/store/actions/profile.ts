import { IActionCreator } from '.';
import AdminService from '../../services/admin';
import { IUser } from '../../services/auth';

export interface IActionCreatorTree {
  saveProfile: IActionCreator<IUser, Promise<void>>;
  resetProfile: IActionCreator;
}

export const ProfileActionTypes = {
  SAVE_PROFILE: 'SAVE_PROFILE',
  RESET_PROFILE: 'RESET_PROFILE'
};

export const ProfileActions: IActionCreatorTree = {
  saveProfile: user => {
    if (!user) {
      return undefined;
    }

    return {
      type: ProfileActionTypes.SAVE_PROFILE,
      payload: AdminService.saveProfile(user)
    };
  },

  resetProfile: () => ({
    type: ProfileActionTypes.RESET_PROFILE
  })
};
