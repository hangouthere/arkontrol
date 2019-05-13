import { Alignment, Navbar, Tooltip } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { IRootState } from '../../store/reducers';
import { IAuthState } from '../../store/reducers/auth';
import { NavButton } from './NavButton';
import AdminMenu from '../admin/AdminMenu';

const LoginButton: React.FC<IAuthState> = props => (
  <Tooltip>
    <NavButton
      icon="log-in"
      to="/login"
      exact={true}
      className="bp3-minimal"
      intent={props.loading ? 'warning' : 'none'}
    />
    Log In as Admin
  </Tooltip>
);

const Navigation: React.FC<IAuthState> = props => {
  const LoginStatusDisplay = !props.user ? LoginButton : AdminMenu;

  // TODO: Role checks!
  const adminButtons = !props.user ? null : (
    <React.Fragment>
      <NavButton icon="crown" text="Admin Panel" to="/admin/adminPanel" exact={true} className="bp3-minimal" />
      <NavButton icon="document" text="Logs" to="/admin/logs" exact={true} className="bp3-minimal" />
      <NavButton icon="badge" text="Server Config" to="/admin/serverConfig" exact={true} className="bp3-minimal" />
    </React.Fragment>
  );

  return (
    <Navbar className="Navbar">
      <Navbar.Group>
        <Navbar.Heading className="navbar-heading">ArKontrol</Navbar.Heading>
        <Navbar.Divider />
        <NavButton icon="people" text="Players" to="/" exact={true} className="bp3-minimal" />

        {adminButtons}
      </Navbar.Group>

      <Navbar.Group align={Alignment.RIGHT}>
        <LoginStatusDisplay {...props} />
      </Navbar.Group>
    </Navbar>
  );
};

const mapStateToProps = (state: IRootState) => state.Auth;

export default connect(mapStateToProps)(Navigation);
