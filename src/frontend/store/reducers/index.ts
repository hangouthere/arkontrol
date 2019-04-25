import { combineReducers, Reducer } from 'redux';
import { ArkCommandsReducers, IArkCommandsState } from './arkCommands';
import { AuthReducers, IAuthState } from './auth';
import { AuthConfigReducers, IAuthConfigState } from './authConfig';
import { IPlayersState, PlayersReducers } from './players';
import { IRemoteStatusState, RemoteStatusReducers } from './remoteStatus';

export interface IRootState {
  ArkCommands: IArkCommandsState;
  AuthConfig: IAuthConfigState;
  Auth: IAuthState;
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
      Players: PlayersReducers,
      RemoteStatus: RemoteStatusReducers
    });
  }
}
