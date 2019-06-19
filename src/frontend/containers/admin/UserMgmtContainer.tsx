import { Callout, Spinner } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import ProfileEditor from '../../components/admin/ProfileEditor';
import UserMgmtPanel from '../../components/admin/UserMgmtPanel';
import { IUser, NormalizeUserName } from '../../services/auth';
import { ShowToaster } from '../../services/toaster';
import { ISaveUserPayload, UsersActions } from '../../store/actions/usersCommands';
import { IRootState } from '../../store/reducers';
import { IUsersState } from '../../store/reducers/usersCommands';

interface IProps {
  loggedInUser: IUser;
  usersState: IUsersState;
  getUsers: typeof UsersActions.getUsers;
  saveUser: typeof UsersActions.saveUser;
  deleteUser: typeof UsersActions.deleteUser;
  resetUser: typeof UsersActions.resetUser;
}

interface IState {
  users: Array<IUser>;
  editUser: IUser;
  showProfileEditor: boolean;
}

class UserMgmtContainer extends React.PureComponent<IProps, IState> {
  componentDidMount() {
    this._loadData();
  }

  async _loadData() {
    const { value: users } = await this.props.getUsers();

    this.setState({
      users: [...users]
    });
  }

  createUser = () => {
    const newUser = {
      userName: 'newAdmin',
      displayName: 'New Admin',
      password: 'password',
      roles: ['admin']
    };

    this.setState({
      editUser: newUser,
      showProfileEditor: true
    });
  };

  editUser = (user: IUser) => {
    this.setState({
      editUser: user,
      showProfileEditor: true
    });
  };

  deleteUser = async (user: IUser) => {
    try {
      await this.props.deleteUser(user);

      ShowToaster({
        message: `User Deleted: ${NormalizeUserName(user)}`,
        intent: 'success'
      });

      // Reload users to get updated list
      this._loadData();
    } catch (err) {
      //
    }
  };

  saveUserProfile = async (user: IUser) => {
    await this.props.saveUser({ user, isLoggedInUser: this.props.loggedInUser.id === user.id });

    // Force close
    this.toggleUserProfile(false)();
    // Reload users to get updated list
    this._loadData();
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
  };

  render() {
    const errorMessage =
      this.props.usersState.error &&
      this.props.usersState.error.message &&
      this.props.usersState.error.message.toString();

    const errorDisplay = !!errorMessage ? (
      <Callout title="Error" intent="danger" className="error-panel">
        {errorMessage}
      </Callout>
    ) : (
      undefined
    );

    const hasConfig = !!this.state && !!this.state.users && false === this.props.usersState.loading;

    if (false === hasConfig) {
      return <Spinner />;
    }

    const users = this.state.users!;
    users.sort((a, b) => (a.displayName! > b.displayName! ? 1 : a.userName > b.userName ? 1 : -1));

    const isSelfUser = this.state.editUser && this.props.loggedInUser.id === this.state.editUser.id;

    return (
      <React.Fragment>
        <UserMgmtPanel
          users={users}
          createUser={this.createUser}
          editUser={this.editUser}
          deleteUser={this.deleteUser}
          errorDisplay={errorDisplay}
        />

        <ProfileEditor
          title={`Edit Profile: ${NormalizeUserName(this.state.editUser)}`}
          isOpen={this.state.showProfileEditor}
          saveUserProfile={this.saveUserProfile}
          toggleUserProfile={this.toggleUserProfile}
          usersState={this.props.usersState}
          initialUser={this.state.editUser}
          isSelfUser={isSelfUser}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  usersState: state.Users,
  loggedInUser: state.Auth.user!
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getUsers: () => dispatch(UsersActions.getUsers()),
  saveUser: (payload?: ISaveUserPayload) => dispatch(UsersActions.saveUser(payload)),
  deleteUser: (payload?: IUser) => dispatch(UsersActions.deleteUser(payload)),
  resetUser: () => dispatch(UsersActions.resetUser())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserMgmtContainer);
