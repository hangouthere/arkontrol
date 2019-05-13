import typeToReducer from 'type-to-reducer';
import { IUser } from '../../services/auth';
import { ProfileActionTypes } from '../actions/profile';

export interface IProfileState {
  loading: boolean;
  error?: Error;
  user?: IUser;
}

const INITIAL_STATE: IProfileState = {
  error: undefined,
  loading: false,
  user: undefined
};

export const ProfileReducers = typeToReducer(
  {
    [ProfileActionTypes.RESET_PROFILE]: state => ({
      ...state,
      loading: false,
      error: undefined
    }),
    [ProfileActionTypes.SAVE_PROFILE]: {
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
    }
  },

  INITIAL_STATE
);
