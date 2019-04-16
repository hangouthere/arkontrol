import { combineReducers } from 'redux';
import { AuthConfigReducers, IAuthConfigState } from './authConfig';
import { AuthReducers, IAuthState } from './auth';
import { IPlayersState, PlayersReducers } from './players';

export interface IRootState {
  AuthConfig: IAuthConfigState;
  Auth: IAuthState;
  Players: IPlayersState;
}

export default class RootReducerCreator {
  rootReducer: any;

  constructor() {
    this.rootReducer = combineReducers({
      AuthConfig: AuthConfigReducers,
      Auth: AuthReducers,
      Players: PlayersReducers
    });
  }
}
