import { applyMiddleware, compose, createStore, Store } from 'redux';
import reduxPromise from 'redux-promise-middleware';
import reduxThunk from 'redux-thunk';
import RootReducerCreator from './reducers';

const composeEnhancers =
  typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const rootReducer = new RootReducerCreator().rootReducer;

class ReduxStore {
  store: Store;

  constructor() {
    this.store = createStore(rootReducer, composeEnhancers(applyMiddleware(reduxThunk, reduxPromise)));
  }
}

export default new ReduxStore();
