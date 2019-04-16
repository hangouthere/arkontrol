import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import FourOhFour from './components/FourOhFour';
import Layout from './components/Layout';
import AdminPage from './containers/AdminPage';
import AuthConfigPage from './containers/AuthConfigPage';
import LoginPage from './containers/LoginPage';
import Logout from './containers/LogoutPage';
import PlayerListPage from './containers/PlayerListPage';
import ProtectedRoute from './containers/ProtectedRoute';

const AUTH_PATH = '/login';

const ProtectedAdminPanel = (props: RouteComponentProps) => (
  <ProtectedRoute component={AdminPage} authPath={AUTH_PATH} {...props} />
);

const ProtectedAuthConfigPage = (props: RouteComponentProps) => (
  <ProtectedRoute component={AuthConfigPage} authPath={AUTH_PATH} {...props} />
);

const RouterConfig: React.FC = () => (
  <Layout>
    <Switch>
      <Route path="/" exact={true} component={PlayerListPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/logout" component={Logout} />
      <Route path="/adminPanel" component={ProtectedAdminPanel} />
      <Route path="/authConfig" component={ProtectedAuthConfigPage} />
      <Route component={FourOhFour} />
    </Switch>
  </Layout>
);

export default RouterConfig;
