import { Alignment, Navbar, Tooltip } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { hasRole } from '../../../commonUtil';
import OverflowListing from '../../components/common/OverflowListing';
import { IRootState } from '../../store/reducers';
import { IAuthState } from '../../store/reducers/auth';
import AdminMenu from '../admin/AdminMenu';
import { NavButton, NavButtonType } from './NavButton';

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

type NavMenuType = Partial<NavButtonType>;

const MakeNavButton = (props: any) => {
  const { ...restProps } = props as NavMenuType;
  return <NavButton exact={true} className="bp3-minimal" {...restProps as NavButtonType} />;
};

const Navigation: React.FC<IAuthState> = props => {
  const LoginStatusDisplay = !props.user ? LoginButton : AdminMenu;

  const adminButtons: Array<NavMenuType> = !props.user
    ? []
    : [{ icon: 'crown', text: 'Admin Panel', to: '/admin/adminPanel' }];

  const superButtons: Array<NavMenuType> =
    !props.user || false === hasRole('superadmin', props.user!.roles)
      ? []
      : [
          { icon: 'document', text: 'Logs', to: '/admin/logs' },
          { icon: 'badge', text: 'Server Config', to: '/admin/serverConfig' }
        ];

  const NavItems: Array<NavMenuType> = [{ icon: 'people', text: 'Players', to: '/' }, ...adminButtons, ...superButtons];

  return (
    <Navbar id="NavBar">
      <Navbar.Group className="menuArea">
        <Navbar.Heading className="heading">ArKontrol</Navbar.Heading>
        <Navbar.Divider />
        <OverflowListing items={NavItems} itemRenderer={MakeNavButton} collapseFrom="end" />
      </Navbar.Group>

      <Navbar.Group align={Alignment.RIGHT}>
        <LoginStatusDisplay {...props} />
      </Navbar.Group>
    </Navbar>
  );
};

const mapStateToProps = (state: IRootState) => state.Auth;

export default connect(mapStateToProps)(Navigation);
