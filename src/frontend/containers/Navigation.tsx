import { Alignment, Navbar } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { IRootState } from '../store/reducers';
import { AuthState } from '../store/reducers/auth';
import { NavButton } from './NavButton';

interface IProps extends AuthState, React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Navigation: React.FC<IProps> = props => {
  const adminButtons = !props.user ? null : (
    <NavButton icon="clean" text="Socket Demo" to="/socketDemo" exact={true} className="bp3-minimal" />
  );

  return (
    <Navbar className="Navbar">
      <Navbar.Group>
        <Navbar.Heading>ArKontrol</Navbar.Heading>
        <Navbar.Divider />
        <NavButton icon="user" text="Players" to="/" exact={true} className="bp3-minimal" />

        {adminButtons}
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
