import AdminService from '../../services/admin';
import { IArkCommandEntry } from '../reducers/arkCommands';
import { IActionCreator } from './index';

export interface IActionCreatorTree {
  getCommands: IActionCreator<undefined, Promise<Array<IArkCommandEntry>>>;
  saveCommands: IActionCreator<Array<IArkCommandEntry>, Promise<Array<IArkCommandEntry>>>;
}

export const ArkCommandsActionTypes = {
  LOAD_COMMANDS: 'LOAD_COMMANDS',
  SAVE_COMMANDS: 'SAVE_COMMANDS'
};

export const ArkCommandsActions: IActionCreatorTree = {
  getCommands: () => ({
    type: ArkCommandsActionTypes.LOAD_COMMANDS,
    payload: AdminService.getCommands()
  }),

  saveCommands: (commands?: Array<IArkCommandEntry>) => {
    if (!commands) {
      return undefined;
    }

    return {
      type: ArkCommandsActionTypes.SAVE_COMMANDS,
      payload: AdminService.saveCommands(commands)
    };
  }
};
