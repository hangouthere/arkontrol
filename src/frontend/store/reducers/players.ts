import typeToReducer from 'type-to-reducer';
import { PlayersActionTypes } from './../actions/players';
import { IPlayer } from '../../services/players';

export interface PlayersState {
  loading: boolean;
  players?: Array<IPlayer>;
  error?: Error;
}

const INITIAL_STATE: PlayersState = {
  loading: false,
  players: undefined,
  error: undefined
};

export const PlayersReducers = typeToReducer(
  {
    [PlayersActionTypes.LOAD_PLAYERS]: {
      PENDING: () => ({
        ...INITIAL_STATE,
        loading: true
      }),
      REJECTED: (_state, action) => ({
        ...INITIAL_STATE,
        error: action.payload
      }),
      FULFILLED: (_state, action) => {
        return {
          ...INITIAL_STATE,
          players: action.payload
        };
      }
    }
  },

  INITIAL_STATE
);
