import typeToReducer from 'type-to-reducer';
import { ArkCommandsActionTypes } from '../actions/arkCommands';

export interface IArkCommandEntry {
  id?: number;
  order: number;
  command: string;
}

export interface IArkCommandsState {
  loading: boolean;
  error?: Error;
  list?: Array<IArkCommandEntry>;
}

const INITIAL_STATE: IArkCommandsState = {
  error: undefined,
  loading: false,
  list: undefined
};

export const ArkCommandsReducers = typeToReducer(
  {
    [ArkCommandsActionTypes.LOAD_COMMANDS]: {
      PENDING: state => ({
        ...state,
        loading: true,
        error: undefined
      }),
      REJECTED: (state, action) => ({
        ...state,
        loading: false,
        error: action.payload
      }),
      FULFILLED: (state, action) => {
        return {
          ...state,
          loading: false,
          error: undefined,
          list: [...action.payload]
        };
      }
    }
  },

  INITIAL_STATE
);
