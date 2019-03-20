import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import Counter from './Counter';
import SocketUI from './SocketUI';

const App: React.FC = () => {
  return (
    <div>
      <div className="madeWith">
        <img src={require('../assets/images/logos/webpack.png')} />
        <img src={require('../assets/images/logos/react.png')} />
      </div>

      <Counter />
      <SocketUI />
    </div>
  );
};

export default hot(App);
