import AdminService from '../../services/admin';
import { ILogData } from '../reducers/log';
import { IActionCreator } from './index';

export interface IActionCreatorTree {
  getLogData: IActionCreator<string, Promise<ILogData>>;
}

export const LogActionTypes = {
  LOAD_LOG: 'LOAD_LOG'
};

export const LogActions: IActionCreatorTree = {
  getLogData: (input?: string) => {
    if (!input) {
      return undefined;
    }

    return {
      type: LogActionTypes.LOAD_LOG,
      payload: AdminService.getLogData(input)
    };
  }
};
