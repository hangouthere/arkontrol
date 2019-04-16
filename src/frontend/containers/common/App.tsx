import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter } from 'react-router-dom';
import RouterConfig from '../../RouterConfig';

import '../../assets/styles/app.scss';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <RouterConfig />
    </BrowserRouter>
  );
};

export default hot(App);
