import typeToReducer from 'type-to-reducer';
import { IPlayer } from '../../services/players';
import { PlayersActionTypes } from './../actions/players';

export interface IPlayersState {
  loading: boolean;
  players?: Array<IPlayer>;
  error?: Error;
}

const INITIAL_STATE: IPlayersState = {
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
