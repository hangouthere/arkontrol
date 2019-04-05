import React from 'react';
import FourOhFour from './components/FourOhFour';
import Layout from './components/Layout';
import ProtectedRoute from './containers/ProtectedRoute';
import SocketDemo from './components/SocketDemo';
import LoginPanel from './containers/LoginPanel';
import Logout from './containers/Logout';
import PlayerListContainer from './containers/PlayerListContainer';
import { Switch, Route, RouteComponentProps } from 'react-router';

const AUTH_PATH = '/login';

const ProtectedSocketDemo = (props: RouteComponentProps) => (
  <ProtectedRoute component={SocketDemo} authPath={AUTH_PATH} {...props} />
);

const RouterConfig: React.FC = () => (
  <Layout>
    <Switch>
      <Route path="/" exact={true} component={PlayerListContainer} />
      <Route path="/login" component={LoginPanel} />
      <Route path="/logout" component={Logout} />
      <Route path="/socketDemo" render={ProtectedSocketDemo} />
      <Route component={FourOhFour} />
    </Switch>
  </Layout>
);

export default RouterConfig;
