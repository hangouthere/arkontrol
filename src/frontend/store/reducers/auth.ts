import typeToReducer from 'type-to-reducer';
import AuthService, { IUser } from '../../services/auth';
import { AuthActionTypes } from '../actions/auth';
import { UsersActionTypes } from '../actions/usersCommands';

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
    }),

    // Derived from ProfileActions
    [UsersActionTypes.SAVE_USER]: {
      // We only care when fulfilled
      FULFILLED: (state, action) => {
        // Only update if we're the logged in user
        if (false === action.meta.isLoggedInUser) {
          return state;
        }

        return {
          ...state,
          loading: false,
          error: undefined,
          user: action.payload
        };
      }
    }
  },

  INITIAL_STATE
);
