import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import ServerConfigPage from './components/admin/ServerConfigPage';
import FourOhFour from './components/common/FourOhFour';
import Layout from './components/common/Layout';
import AdminPage from './containers/admin/AdminPage';
import ProtectedRoute from './containers/common/ProtectedRoute';
import LoginPage from './containers/LoginPage';
import Logout from './containers/LogoutPage';
import PlayerListPage from './containers/PlayerListPage';

const AUTH_PATH = '/login';

const ProtectedAdminPanel = (props: RouteComponentProps) => (
  <ProtectedRoute component={AdminPage} authPath={AUTH_PATH} {...props} />
);

const ProtectedServerConfigPage = (props: RouteComponentProps) => (
  <ProtectedRoute component={ServerConfigPage} authPath={AUTH_PATH} {...props} />
);

const RouterConfig: React.FC = () => (
  <Layout>
    <Switch>
      <Route path="/" exact={true} component={PlayerListPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/logout" component={Logout} />
      <Route path="/adminPanel" component={ProtectedAdminPanel} />
      <Route path="/serverConfig" component={ProtectedServerConfigPage} />
      <Route component={FourOhFour} />
    </Switch>
  </Layout>
);

export default RouterConfig;
