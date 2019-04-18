import { combineReducers } from 'redux';
import { AuthReducers, IAuthState } from './auth';
import { AuthConfigReducers, IAuthConfigState } from './authConfig';
import { IPlayersState, PlayersReducers } from './players';
import { IRemoteStatusState, RemoteStatusReducers } from './remoteStatus';

export interface IRootState {
  AuthConfig: IAuthConfigState;
  Auth: IAuthState;
  Players: IPlayersState;
  RemoteStatus: IRemoteStatusState;
}

export default class RootReducerCreator {
  rootReducer: any;

  constructor() {
    this.rootReducer = combineReducers({
      AuthConfig: AuthConfigReducers,
      Auth: AuthReducers,
      Players: PlayersReducers,
      RemoteStatus: RemoteStatusReducers
    });
  }
}
