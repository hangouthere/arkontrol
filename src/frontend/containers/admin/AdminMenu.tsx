import { Menu, MenuDivider, MenuItem, Popover, Tooltip } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
import ProfileEditor from '../../components/admin/ProfileEditor';
import { IUser } from '../../services/auth';
import { ProfileActions } from '../../store/actions/profile';
import { IRootState } from '../../store/reducers';
import { IAuthState } from '../../store/reducers/auth';
import { IProfileState } from '../../store/reducers/profile';
import Gravatar from './Gravatar';

interface IProps extends RouteComponentProps {
  userInfo: IAuthState;
  profileInfo: IProfileState;
  saveProfile: typeof ProfileActions.saveProfile;
  resetProfile: typeof ProfileActions.resetProfile;
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
        false === isOpen ? this.props.resetProfile : undefined
      );
    };
  }

  saveUserProfile = async (user: IUser) => {
    try {
      await this.props.saveProfile(user);

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
    const user = this.props.userInfo.user!;

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
          profileInfo={this.props.profileInfo}
          initialUser={user}
          isSelfUser={true}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  userInfo: state.Auth,
  profileInfo: state.Profile
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  saveProfile: (user?: IUser) => dispatch(ProfileActions.saveProfile(user)),
  resetProfile: () => dispatch(ProfileActions.resetProfile())
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AdminMenu)
);
