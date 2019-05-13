import { combineReducers, Reducer } from 'redux';
import { ProfileReducers, IProfileState } from './profile';
import { ArkCommandsReducers, IArkCommandsState } from './arkCommands';
import { AuthReducers, IAuthState } from './auth';
import { AuthConfigReducers, IAuthConfigState } from './authConfig';
import { ILogState, LogReducers } from './log';
import { IPlayersState, PlayersReducers } from './players';
import { IRemoteStatusState, RemoteStatusReducers } from './remoteStatus';

export interface IRootState {
  ArkCommands: IArkCommandsState;
  Auth: IAuthState;
  AuthConfig: IAuthConfigState;
  Log: ILogState;
  Players: IPlayersState;
  Profile: IProfileState;
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
      Profile: ProfileReducers,
      RemoteStatus: RemoteStatusReducers
    });
  }
}
