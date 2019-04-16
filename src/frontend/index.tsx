import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './containers/common/App';
import ReduxStore from './store';

const store = new ReduxStore().store;

ReactDOM.render(
  // tslint:disable-next-line: jsx-wrap-multiline
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
