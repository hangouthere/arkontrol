import { Menu, MenuDivider, MenuItem, Popover, Tooltip } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
import ProfileEditor from '../../components/admin/ProfileEditor';
import { IUser } from '../../services/auth';
import { IRootState } from '../../store/reducers';
import { IAuthState } from '../../store/reducers/auth';
import Gravatar from './Gravatar';
import { UsersActions, ISaveUserPayload } from '../../store/actions/usersCommands';
import { IUsersState } from '../../store/reducers/usersCommands';

interface IProps extends RouteComponentProps {
  authState: IAuthState;
  usersState: IUsersState;
  saveUser: typeof UsersActions.saveUser;
  resetUser: typeof UsersActions.resetUser;
}

interface IState {
  showProfileEditor: boolean;
}

class AdminMenu extends React.PureComponent<IProps, IState> {
  state: IState = {
    showProfileEditor: false
  };

  toggleUserProfile = (forcedVal?: boolean) => {
    return () => {
      let isOpen = false;

      this.setState(
        ({ showProfileEditor }) => {
          isOpen = forcedVal ? forcedVal : !showProfileEditor;

          return {
            showProfileEditor: isOpen
          };
        },
        // Callback after state set when CLOSING
        false === isOpen ? this.props.resetUser : undefined
      );
    };
  }

  saveUserProfile = async (user: IUser) => {
    try {
      await this.props.saveUser({ user, isLoggedInUser: true });

      // Force close
      this.toggleUserProfile(false)();
    } catch (err) {
      //
    }
  }

  performLogout = () => {
    this.props.history.push('/logout');
  }

  render() {
    const user = this.props.authState.user!;

    return (
      <React.Fragment>
        <Popover className="AdminMenu" position="top-right">
          <Tooltip>
            <div className="flex-display flex-align space-elements-horizontal">
              <h4 className="user-greeting">Hello, {user.displayName || user.userName}</h4>
              <Gravatar user={user} />
            </div>
            User Menu
          </Tooltip>

          <Menu large={true}>
            <MenuItem text="Edit Profile" icon="id-number" onClick={this.toggleUserProfile()} />
            <MenuDivider />
            <MenuItem text="Logout" icon="log-out" intent="danger" onClick={this.performLogout} />
          </Menu>
        </Popover>

        <ProfileEditor
          title="Edit Profile"
          isOpen={this.state.showProfileEditor}
          saveUserProfile={this.saveUserProfile}
          toggleUserProfile={this.toggleUserProfile}
          usersState={this.props.usersState}
          initialUser={user}
          isSelfUser={true}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  authState: state.Auth,
  usersState: state.Users
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  saveUser: (payload?: ISaveUserPayload) => dispatch(UsersActions.saveUser(payload)),
  resetUser: () => dispatch(UsersActions.resetUser())
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AdminMenu)
);
