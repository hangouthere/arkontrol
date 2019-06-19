import typeToReducer from 'type-to-reducer';
import { AuthConfigActionTypes } from '../actions/authConfig';

export interface IAuthConfigEntry {
  propName: string;
  propValue: any;
  propDesc: string;
}

export type IAuthConfigUpdateEntry = Pick<IAuthConfigEntry, Exclude<keyof IAuthConfigEntry, 'propDesc'>>;

export interface IAuthConfig {
  host: IAuthConfigEntry;
  port: IAuthConfigEntry;
  password: IAuthConfigEntry;
  discordAdminName: IAuthConfigEntry;
  discordWebhookURL: IAuthConfigEntry;
}

export interface IAuthConfigState {
  config?: IAuthConfig;
  error?: Error;
  loading: boolean;
}

const INITIAL_STATE: IAuthConfigState = {
  error: undefined,
  loading: false,
  config: undefined
};

export const AuthConfigReducers = typeToReducer(
  {
    [AuthConfigActionTypes.LOAD_AUTH_CONFIG]: {
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
          config: { ...action.payload }
        };
      }
    },

    [AuthConfigActionTypes.SAVE_AUTH_CONFIG]: {
      PENDING: state => ({
        ...state,
        error: undefined,
        loading: true
      }),
      REJECTED: (state, action) => {
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      },
      FULFILLED: (state, action) => {
        return {
          ...state,
          error: undefined,
          loading: false,
          config: { ...action.payload }
        };
      }
    }
  },

  INITIAL_STATE
);
