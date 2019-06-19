import { combineReducers, Reducer } from 'redux';
import { ArkCommandsReducers, IArkCommandsState } from './arkCommands';
import { AuthReducers, IAuthState } from './auth';
import { AuthConfigReducers, IAuthConfigState } from './authConfig';
import { ILogState, LogReducers } from './log';
import { IPlayersState, PlayersReducers } from './players';
import { IRemoteStatusState, RemoteStatusReducers } from './remoteStatus';
import { IUsersState, UsersReducers } from './usersCommands';

export interface IRootState {
  ArkCommands: IArkCommandsState;
  Auth: IAuthState;
  AuthConfig: IAuthConfigState;
  Log: ILogState;
  Players: IPlayersState;
  Users: IUsersState;
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
      Users: UsersReducers,
      RemoteStatus: RemoteStatusReducers
    });
  }
}
