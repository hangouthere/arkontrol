import { Spinner } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import AuthConfigPanel from '../../components/admin/AuthConfigPanel';
import { ShowToaster } from '../../services/toaster';
import { AdminActions } from '../../store/actions/admin';
import { AuthConfigActions } from '../../store/actions/authConfig';
import { IRootState } from '../../store/reducers';
import { IAuthConfig, IAuthConfigState, IAuthConfigUpdateEntry } from '../../store/reducers/authConfig';

interface IProps {
  authConfigState: IAuthConfigState;
  getAuthConfig: typeof AuthConfigActions.getAuthConfig;
  saveAuthConfig: typeof AuthConfigActions.saveAuthConfig;
  sysCommand: typeof AdminActions.sysCommand;
}

interface IState {
  config: IAuthConfig;
  hasChange: boolean;
  shouldReconnect: boolean;
}

class AuthConfigContainer extends React.PureComponent<IProps, IState> {
  componentDidMount() {
    this._loadData();
  }

  async _loadData() {
    const { value: authConfig } = await this.props.getAuthConfig();

    this.setState({
      config: { ...authConfig }
    });
  }

  saveConfig = async () => {
    await this.props.saveAuthConfig(this.state.config);

    ShowToaster({
      message: 'AuthConfig Updated',
      intent: 'success'
    });

    this.setState({
      hasChange: false,
      shouldReconnect: true
    });
  }

  changeConfigPart = (entry: IAuthConfigUpdateEntry) =>
    this.setState(state => ({
      hasChange: true,
      config: {
        ...state.config,
        [entry.propName]: {
          ...state.config[entry.propName],
          propValue: entry.propValue
        }
      }
    }))

  sendSysCommand = async (cmd: string) => {
    await this.props.sysCommand(cmd);

    this.setState({
      shouldReconnect: false
    });
  }

  render() {
    const hasConfig = !!this.props.authConfigState.config;

    if (false === hasConfig) {
      return <Spinner />;
    }

    const config = (this.state && this.state.config) || this.props.authConfigState.config;

    return (
      <AuthConfigPanel
        config={config}
        isLoading={this.props.authConfigState.loading}
        hasChange={this.state && this.state.hasChange}
        shouldReconnect={this.state && this.state.shouldReconnect}
        changeConfigPart={this.changeConfigPart}
        saveConfig={this.saveConfig}
        sysCommand={this.sendSysCommand}
      />
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  authConfigState: state.AuthConfig
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getAuthConfig: () => dispatch(AuthConfigActions.getAuthConfig()),
  saveAuthConfig: (input?: IAuthConfig) => dispatch(AuthConfigActions.saveAuthConfig(input)),
  sysCommand: (command?: string) => dispatch(AdminActions.sysCommand(command))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthConfigContainer);
