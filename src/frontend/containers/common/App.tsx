import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import { HashRouter } from 'react-router-dom';
import '../../assets/styles/app.scss';
import RouterConfig from '../../RouterConfig';

const App: React.FC = () => {
  return (
    <HashRouter>
      <RouterConfig />
    </HashRouter>
  );
};

export default hot(App);
