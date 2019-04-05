import { combineReducers } from 'redux';

import { AuthReducers, AuthState } from './auth';
import { PlayersReducers, PlayersState } from './players';

export interface IRootState {
  Auth: AuthState;
  Players: PlayersState;
}

export default class RootReducerCreator {
  rootReducer: any;

  constructor() {
    this.rootReducer = combineReducers({
      Auth: AuthReducers,
      Players: PlayersReducers
    });
  }
}
