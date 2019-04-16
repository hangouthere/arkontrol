import { IActionCreator } from '.';
import SocketService from '../../services/socket';

export interface IActionCreatorTree {
  adminCommand: IActionCreator<string, Promise<void>>;
  serverMessage: IActionCreator<{ userName: string; message: string; type: string }, Promise<void>>;
  sysCommand: IActionCreator<string, Promise<void>>;
}

export const AdminActionTypes = {
  ADMIN_COMMAND: 'ADMIN_COMMAND',
  SERVER_MESSAGE: 'SERVER_MESSAGE',
  SYSTEM_COMMAND: 'SYSTEM_COMMAND'
};

export const AdminActions: IActionCreatorTree = {
  serverMessage: (input?) => {
    if (!input) {
      return undefined;
    }

    return {
      type: AdminActionTypes.SERVER_MESSAGE,
      payload: SocketService.sendArkCommand(`${input.type} (${input.userName}) ${input.message}`)
    };
  },

  adminCommand: (command?) => {
    if (!command) {
      return undefined;
    }

    return {
      type: AdminActionTypes.ADMIN_COMMAND,
      payload: SocketService.sendArkCommand(command)
    };
  },

  sysCommand: (command?) => {
    if (!command) {
      return undefined;
    }

    return {
      type: AdminActionTypes.ADMIN_COMMAND,
      payload: SocketService.sendSysCommand(command)
    };
  }
};
