import typeToReducer from 'type-to-reducer';
import { IUser } from '../../services/auth';
import { UsersActionTypes } from '../actions/usersCommands';

export interface IUsersState {
  loading: boolean;
  error?: Error;
  users?: Array<IUser>;
  editUser?: IUser;
}

const INITIAL_STATE: IUsersState = {
  error: undefined,
  loading: false,
  users: undefined
};

export const UsersReducers = typeToReducer(
  {
    [UsersActionTypes.LOAD_USERS]: {
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
          users: [...action.payload]
        };
      }
    },

    [UsersActionTypes.RESET_USER]: state => ({
      ...state,
      loading: false,
      error: undefined,
      editUser: undefined
    }),

    [UsersActionTypes.SAVE_USER]: {
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
          editUser: action.payload
        };
      }
    },

    [UsersActionTypes.DELETE_USER]: {
      PENDING: state => ({
        ...state,
        loading: true,
        error: undefined
      }),
      REJECTED: (state, action) => {
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      },
      FULFILLED: state => {
        return {
          ...state,
          loading: false,
          error: undefined,
          editUser: undefined
        };
      }
    }
  },

  INITIAL_STATE
);
