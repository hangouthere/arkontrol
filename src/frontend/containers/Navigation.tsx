import { Alignment, Navbar } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { IRootState } from '../store/reducers';
import { IAuthState } from '../store/reducers/auth';
import { NavButton } from './NavButton';

interface IProps extends IAuthState, React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Navigation: React.FC<IProps> = props => {
  const adminButtons = !props.user ? null : (
    <React.Fragment>
      <NavButton icon="crown" text="Admin Panel" to="/adminPanel" exact={true} className="bp3-minimal" />
    </React.Fragment>
  );

  return (
    <Navbar className="Navbar">
      <Navbar.Group>
        <Navbar.Heading className="navbar-heading">ArKontrol</Navbar.Heading>
        <Navbar.Divider />
        <NavButton icon="user" text="Players" to="/" exact={true} className="bp3-minimal" />

        {adminButtons}

        <NavButton icon="badge" text="Auth Config" to="/authConfig" exact={true} className="bp3-minimal" />
      </Navbar.Group>

      <Navbar.Group align={Alignment.RIGHT}>
        <NavButton
          icon={props.user ? 'log-out' : 'log-in'}
          to={props.user ? '/logout' : '/login'}
          exact={true}
          className="bp3-minimal"
          intent={props.user ? (props.loading ? 'warning' : 'danger') : 'success'}
        />
      </Navbar.Group>
    </Navbar>
  );
};

const mapStateToProps = (state: IRootState) => ({
  ...state.Auth
});

export default connect(mapStateToProps)(Navigation);
