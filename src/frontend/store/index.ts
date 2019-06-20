import { applyMiddleware, compose, createStore, Dispatch, Store } from 'redux';
import reduxPromise from 'redux-promise-middleware';
import reduxThunk from 'redux-thunk';
import BaseService from '../services/base';
import SocketService, { EVENTS as SocketEvents } from '../services/socket';
import { EVENTS as BaseEvents } from '../services/base';
import { AuthActions } from './actions/auth';
import { RemoteStatusActions } from './actions/remoteStatus';
import RootReducerCreator from './reducers';

const composeEnhancers =
  typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const rootReducer = new RootReducerCreator().rootReducer;

// Check Auth every 5 minutes to auto log out when expired
class AuthStoreFacade {
  static AUTH_VALIDATE_FREQUENCY = 10 * 60 * 1000;

  constructor(private dispatch: Dispatch) {
    setInterval(this.checkToken, AuthStoreFacade.AUTH_VALIDATE_FREQUENCY);
    BaseService.sharedBus.on(BaseEvents.UNAUTHORIZED, this.forceLogout);
  }

  forceLogout = () => {
    this.dispatch(AuthActions.logoutRequest());
  };

  checkToken = () => {
    try {
      if (false === BaseService.checkValidAuth()) {
        this.forceLogout();
      }
    } catch (error) {
      this.forceLogout();
    }
  };
}

// Listen for Socket connectivity and messaging
class SocketStoreFacade {
  constructor(private dispatch: Dispatch) {
    BaseService.sharedBus.on(SocketEvents.CONNECTED, this._socketConnected);
    BaseService.sharedBus.on(SocketEvents.DISCONNECTED, this._socketDisconnected);
    BaseService.sharedBus.on(SocketEvents.MESSAGE_RECIEVED, this._socketMessaged);
    BaseService.sharedBus.on(BaseEvents.TOKEN_SET, this._onTokenChanged);
    BaseService.sharedBus.on(BaseEvents.TOKEN_CLEARED, this._onTokenChanged);
  }

  _socketConnected = () => {
    this.dispatch(RemoteStatusActions.setBotStatus(true));

    // Kick off getting status
    setTimeout(() => {
      this.dispatch(RemoteStatusActions.getServerStatus());
    }, 1000);
  };

  _socketDisconnected = () => {
    this.dispatch(RemoteStatusActions.setBotStatus(false));
    this.dispatch(RemoteStatusActions.setServerStatus(false));
  };

  _socketMessaged = (messageData: any) => {
    this.dispatch(messageData);
  };

  _onTokenChanged = () => {
    SocketService.socket.close();
  };
}

//////////////////////////////////////////////////////////////////////////////////
////
//////////////////////////////////////////////////////////////////////////////////

class ReduxStore {
  store: Store;

  constructor() {
    this.store = createStore(rootReducer, composeEnhancers(applyMiddleware(reduxThunk, reduxPromise)));

    const _ssf = new SocketStoreFacade(this.store.dispatch);
    const _asf = new AuthStoreFacade(this.store.dispatch);
  }
}

export default new ReduxStore();
