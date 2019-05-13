import { applyMiddleware, compose, createStore, Store } from 'redux';
import reduxPromise from 'redux-promise-middleware';
import reduxThunk from 'redux-thunk';
import SocketService, { EVENTS } from '../services/socket';
import RootReducerCreator from './reducers';
import { RemoteStatusActions } from './actions/remoteStatus';

const composeEnhancers =
  typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const rootReducer = new RootReducerCreator().rootReducer;

class ReduxStore {
  store: Store;

  constructor() {
    this.store = createStore(rootReducer, composeEnhancers(applyMiddleware(reduxThunk, reduxPromise)));

    SocketService.on(EVENTS.CONNECTED, this._socketConnected);
    SocketService.on(EVENTS.DISCONNECTED, this._socketDisconnected);
    SocketService.on(EVENTS.MESSAGE_RECIEVED, this._socketMessaged);
  }

  _socketConnected = () => {
    this.store.dispatch(RemoteStatusActions.setBotStatus(true));

    // Kick off getting status
    setTimeout(() => {
      this.store.dispatch(RemoteStatusActions.getServerStatus());
    }, 1000);
  }

  _socketDisconnected = () => {
    this.store.dispatch(RemoteStatusActions.setBotStatus(false));
    this.store.dispatch(RemoteStatusActions.setServerStatus(false));
  }

  _socketMessaged = (messageData: any) => {
    this.store.dispatch(messageData);
  }
}

export default new ReduxStore();
