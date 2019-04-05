import { applyMiddleware, createStore, compose } from 'redux';
import reduxPromise from 'redux-promise-middleware';
import reduxThunk from 'redux-thunk';
import RootReducerCreator from './reducers';

const composeEnhancers =
  typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

const rootReducer = new RootReducerCreator().rootReducer;

class ReduxStore {
  store: any;

  constructor() {
    this.store = createStore(rootReducer, composeEnhancers(applyMiddleware(reduxThunk, reduxPromise)));
  }
}

export default ReduxStore;
