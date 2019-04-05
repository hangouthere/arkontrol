import typeToReducer from 'type-to-reducer';
import { IUser } from '../../services/auth';
import { AuthActionTypes } from '../actions/auth';

export interface AuthState {
  redirectAfterAuth: string;
  loading: boolean;
  user?: IUser;
  error?: Error;
}

const INITIAL_STATE: AuthState = {
  redirectAfterAuth: '/',
  loading: false,
  user: undefined,
  error: undefined
};

export const AuthReducers = typeToReducer(
  {
    [AuthActionTypes.SET_REDIRECT]: (state, action) => ({
      ...state,
      redirectAfterAuth: action.payload
    }),

    [AuthActionTypes.LOGIN]: {
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
          user: action.payload,
          error: undefined
        };
      }
    },

    [AuthActionTypes.LOGOUT]: () => ({
      ...INITIAL_STATE
    })
  },

  INITIAL_STATE
);
