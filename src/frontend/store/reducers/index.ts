import { combineReducers, Reducer } from 'redux';
import { ArkCommandsReducers, IArkCommandsState } from './arkCommands';
import { AuthReducers, IAuthState } from './auth';
import { AuthConfigReducers, IAuthConfigState } from './authConfig';
import { ILogState, LogReducers } from './log';
import { IPlayersState, PlayersReducers } from './players';
import { IRemoteStatusState, RemoteStatusReducers } from './remoteStatus';

export interface IRootState {
  ArkCommands: IArkCommandsState;
  AuthConfig: IAuthConfigState;
  Auth: IAuthState;
  Log: ILogState;
  Players: IPlayersState;
  RemoteStatus: IRemoteStatusState;
}

export default class RootReducerCreator {
  rootReducer: Reducer<IRootState>;

  constructor() {
    this.rootReducer = combineReducers({
      ArkCommands: ArkCommandsReducers,
      Auth: AuthReducers,
      AuthConfig: AuthConfigReducers,
      Log: LogReducers,
      Players: PlayersReducers,
      RemoteStatus: RemoteStatusReducers
    });
  }
}
