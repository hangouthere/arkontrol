import typeToReducer from 'type-to-reducer';
import { LogActionTypes } from '../actions/log';

export interface ILogData {
  timestamp: string;
  data: string;
  logLevel: string;
}

export interface ILogState {
  loading: boolean;
  error?: Error;
  logData?: Array<ILogData>;
}

const INITIAL_STATE: ILogState = {
  error: undefined,
  loading: false,
  logData: undefined
};

export const LogReducers = typeToReducer(
  {
    [LogActionTypes.LOAD_LOG]: {
      PENDING: state => ({
        ...state,
        loading: true,
        error: undefined,
        logData: undefined
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
          logData: [...action.payload]
        };
      }
    }
  },

  INITIAL_STATE
);
