import typeToReducer from 'type-to-reducer';
import AuthService, { IUser } from '../../services/auth';
import { AuthActionTypes } from '../actions/auth';

export interface IAuthState {
  redirectAfterAuth: string;
  loading: boolean;
  user?: IUser;
  error?: Error;
}

const INITIAL_STATE: IAuthState = {
  redirectAfterAuth: '/',
  loading: false,
  user: AuthService.currentUser,
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
          error: undefined,
          user: action.payload
        };
      }
    },

    [AuthActionTypes.LOGOUT]: () => ({
      ...INITIAL_STATE,
      user: undefined
    })
  },

  INITIAL_STATE
);
