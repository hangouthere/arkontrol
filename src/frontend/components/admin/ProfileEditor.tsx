import { Button, Callout, Classes, Dialog, FormGroup, InputGroup, Spinner, Tag } from '@blueprintjs/core';
import React from 'react';
import Gravatar from '../../containers/admin/Gravatar';
import { IUser } from '../../services/auth';
import { IProfileState } from '../../store/reducers/profile';
import TagSelector, { ITagSelectItem } from '../common/TagSelector';
import { ShowToaster } from '../../services/toaster';

interface IProps {
  isOpen: boolean;
  title: string;
  initialUser: IUser;
  profileInfo: IProfileState;
  isSelfUser: boolean;
  toggleUserProfile: (force?: boolean) => () => void;
  saveUserProfile: (user: IUser) => void;
}

interface IState {
  hasChanges: boolean;
  user?: IUser;
  selectedItems: Array<ITagSelectItem>;
}

const RoleTagSelectItems: Array<ITagSelectItem> = [
  {
    key: 'superadmin',
    tag: 'superadmin',
    text: 'Super Admin',
    label: 'Owner'
  },
  {
    key: 'admin',
    tag: 'admin',
    text: 'Admin',
    label: 'Helper'
  }
];

class ProfileEditor extends React.PureComponent<IProps, IState> {
  state: IState = {
    hasChanges: false,
    user: undefined,
    selectedItems: []
  };

  componentDidMount() {
    this._resetUser();
  }

  _resetUser() {
    const roles = this._userRoles(this.state.user!);

    this.setState({
      user: this.props.initialUser,
      selectedItems: roles
    });
  }

  _updateProfile = (event: React.ChangeEvent<HTMLFormElement>) => {
    const dataTuple = { [event.target.name]: event.target.value };

    this.setState(state => ({
      ...state,
      hasChanges: true,
      user: {
        ...state.user,
        ...dataTuple
      } as Pick<IUser, keyof IUser>
    }));
  }

  _saveUserProfile = async () => {
    await this.props.saveUserProfile(this.state.user!);

    ShowToaster({
      message: 'Profile Saved',
      intent: 'success'
    });
  }

  _cancelEdit = () => {
    this._resetUser();
    this.props.toggleUserProfile(false)();
  }

  _userRoles = (user: IUser) => {
    let found;

    if (!user) {
      return [];
    }

    return user.roles.reduce<Array<ITagSelectItem>>((roles, item) => {
      found = RoleTagSelectItems.find(i => i.key === item);

      if (found) {
        roles.push(found);
      }

      return roles;
    }, []);
  }

  _buildRoleView() {
    let view;

    if (true === this.props.isSelfUser) {
      view = this.state.user!.roles.map(r => <Tag key={r}>{r}</Tag>);
    } else {
      view = (
        <TagSelector
          items={RoleTagSelectItems}
          selectedItems={this.state.selectedItems}
          onChange={this._onChangeRoles}
        />
      );
    }

    return view;
  }

  _buildProfileEditor() {
    const errorMessage =
      this.props.profileInfo.error &&
      this.props.profileInfo.error.message &&
      this.props.profileInfo.error.message.toString();

    const errorDisplay = !!errorMessage ? (
      <Callout title="Error" intent="danger" className="error-panel">
        {errorMessage}
      </Callout>
    ) : (
      undefined
    );

    return (
      <React.Fragment>
        <div className={`flex-display flex-column space-elements-horizontal ${Classes.DIALOG_BODY}`}>
          {errorDisplay}

          <div className="flex-display space-elements-horizontal">
            <div className="flex-display flex-column column-left">
              <label className="bp3-label">Avatar</label>
              <Gravatar user={this.state.user!} enableHelp={true} gravatarDefault="wavatar" />

              <label className="bp3-label">Roles</label>
              <div className="roleDisplay space-elements-horizontal">{this._buildRoleView()}</div>
            </div>

            <div className="flex-display flex-column flex-grow space-elements-vertical">
              <form onChange={this._updateProfile} className="flex-grow">
                <FormGroup label="Display Name" labelFor="displayName">
                  <InputGroup id="displayName" name="displayName" defaultValue={this.state.user!.displayName} />
                </FormGroup>

                <FormGroup label="Email" labelFor="email">
                  <InputGroup id="email" name="email" defaultValue={this.state.user!.email} />
                </FormGroup>

                <FormGroup label="Old Password" labelFor="oldPassword">
                  <InputGroup
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    defaultValue={this.state.user!.oldPassword}
                  />
                </FormGroup>

                <FormGroup label="New Password" labelFor="newPassword">
                  <InputGroup
                    id="newPassword"
                    name="newPassword"
                    className="bp3-fill"
                    type="password"
                    defaultValue={this.state.user!.newPassword}
                  />
                </FormGroup>
              </form>
            </div>
          </div>
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={this._cancelEdit} intent="danger">
              Cancel
            </Button>
            <Button onClick={this._saveUserProfile} intent="success" disabled={!this.state.hasChanges}>
              Save
            </Button>
          </div>
        </div>
      </React.Fragment>
    );
  }

  _onChangeRoles = (selectedRoles: Array<ITagSelectItem>) => {
    this.setState(state => ({
      hasChanges: true,
      user: {
        ...state.user,
        roles: selectedRoles.map(r => r.tag)
      } as Pick<IUser, keyof IUser>
    }));
  }

  render() {
    let content = <Spinner size={75} />;

    if (this.state.user) {
      content = this._buildProfileEditor();
    }

    return (
      <Dialog
        className="bp3-dark editProfile"
        isOpen={this.props.isOpen}
        title={this.props.title}
        icon="id-number"
        isCloseButtonShown={false}
        canOutsideClickClose={false}
        onClose={this._cancelEdit}
      >
        {content}
      </Dialog>
    );
  }
}

export default ProfileEditor;
