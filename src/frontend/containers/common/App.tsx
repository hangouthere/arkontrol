import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import { HashRouter } from 'react-router-dom';
import RouterConfig from '../../RouterConfig';

import '../../assets/styles/app.scss';

const App: React.FC = () => {
  return (
    <HashRouter>
      <RouterConfig />
    </HashRouter>
  );
};

export default hot(App);
