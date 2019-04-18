import { IActionCreator } from '.';
import RemoteStatusService from '../../services/remoteStatus';
import { IRemoteStatusState } from '../reducers/remoteStatus';

export interface IActionCreatorTree {
  getServerStatus: IActionCreator<undefined, Promise<IRemoteStatusState>>;
  setBotStatus: IActionCreator<boolean>;
  setServerStatus: IActionCreator<boolean>;
}

export const RemoteStatusActionTypes = {
  GET_SERVER_STATUS: 'GET_SERVER_STATUS',
  SET_SERVER_STATUS: 'rcon::SET_SERVER_STATUS',
  SET_BOT_STATUS: 'socket::SET_BOT_STATUS'
};

export const RemoteStatusActions: IActionCreatorTree = {
  getServerStatus: () => ({
    type: RemoteStatusActionTypes.GET_SERVER_STATUS,
    payload: RemoteStatusService.getServerStatus()
  }),
  setBotStatus: (isUp?: boolean) => ({
    type: RemoteStatusActionTypes.SET_BOT_STATUS,
    payload: isUp
  }),
  setServerStatus: (isUp?: boolean) => ({
    type: RemoteStatusActionTypes.SET_SERVER_STATUS,
    payload: isUp
  })
};
