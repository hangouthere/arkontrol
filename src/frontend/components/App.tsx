import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Layout from './Layout';
import SocketDemo from './SocketDemo';
import PlayerListContainer from '../containers/PlayerListContainer';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Route exact={true} path="/" component={PlayerListContainer} />
        <Route path="/socketDemo" component={SocketDemo} />
      </Layout>
    </Router>
  );
};

export default hot(App);
