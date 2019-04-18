import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/common/App';
import ReduxStore from './store';
import wretch from 'wretch';

const store = ReduxStore.store;

const renderApp = () => {
  ReactDOM.render(
    // tslint:disable-next-line: jsx-wrap-multiline
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  );
};

const getConnectionData = async () => {
  const connections = await wretch('connections.json')
    .get()
    .json();

  (window as any).ARKONTROL_URI = connections.arkontrol;
  (window as any).WEBSOCKET_URI = connections.websocket;

  renderApp();
};

getConnectionData();
