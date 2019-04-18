import typeToReducer from 'type-to-reducer';
import { RemoteStatusActionTypes } from '../actions/remoteStatus';

export interface IRemoteStatusState {
  connectedToBot: boolean;
  connectedToServer: boolean;
}

const INITIAL_STATE: IRemoteStatusState = {
  connectedToBot: false,
  connectedToServer: false
};

export const RemoteStatusReducers = typeToReducer(
  {
    [RemoteStatusActionTypes.SET_BOT_STATUS]: (state, action) => ({
      ...state,
      connectedToBot: action.payload
    }),

    [RemoteStatusActionTypes.SET_SERVER_STATUS]: (state, action) => ({
      ...state,
      connectedToServer: action.payload
    }),

    [RemoteStatusActionTypes.GET_SERVER_STATUS]: {
      PENDING: state => state,
      REJECTED: state => state,
      FULFILLED: (state, action) => {
        return {
          ...state,
          ...action.payload
        };
      }
    }
  },

  INITIAL_STATE
);
