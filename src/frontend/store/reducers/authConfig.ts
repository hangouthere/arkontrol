import typeToReducer from 'type-to-reducer';
import { AuthConfigActionTypes } from '../actions/authConfig';

export interface IAuthConfigTuple {
  desc: string;
  value: string;
}

export interface IAuthConfig {
  discordAdminName: IAuthConfigTuple;
  discordWebhookURL: IAuthConfigTuple;
  host: IAuthConfigTuple;
  maxConnectionAttempts: IAuthConfigTuple;
  maxPacketTimeouts: IAuthConfigTuple;
  password: IAuthConfigTuple;
  port: IAuthConfigTuple;
}

export type ILoadingParts = { [name in keyof IAuthConfig]?: string };

export interface IAuthConfigState {
  config?: IAuthConfig;
  error?: Error;
  loading: boolean;
  loadingParts: ILoadingParts;
}

const INITIAL_STATE: IAuthConfigState = {
  error: undefined,
  loading: false,
  loadingParts: {},
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

    [AuthConfigActionTypes.SAVE_AUTH_CONFIG_PART]: {
      PENDING: (state, action) => ({
        ...state,
        error: undefined,
        loadingParts: {
          ...state.loadingParts,
          [action.meta.part]: true
        }
      }),
      REJECTED: (state, action) => {
        const loadingParts = { ...state.loadingParts };
        delete loadingParts[action.meta.part];

        return {
          ...state,
          loadingParts: { ...loadingParts },
          error: action.payload
        };
      },
      FULFILLED: (state, action) => {
        const loadingParts = { ...state.loadingParts };
        delete loadingParts[action.meta.part];

        return {
          ...state,
          loadingParts: { ...loadingParts },
          error: undefined,
          config: { ...action.payload }
        };
      }
    }
  },

  INITIAL_STATE
);
