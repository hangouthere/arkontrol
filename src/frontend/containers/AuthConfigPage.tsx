import { Spinner } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import AuthConfigPanel from '../components/admin/AuthConfigPanel';
import { AuthConfigActions, IAuthConfigEntry } from '../store/actions/authConfig';
import { IRootState } from '../store/reducers';
import { IAuthConfig, IAuthConfigState, ILoadingParts } from '../store/reducers/authConfig';

interface IProps {
  authConfigData: IAuthConfigState;
  getAuthConfig: typeof AuthConfigActions.getAuthConfig;
  saveAuthConfigPart: typeof AuthConfigActions.saveAuthConfigPart;
}

interface IState {
  config: IAuthConfig;
  loadingParts: ILoadingParts;
}

class AuthConfigPage extends React.PureComponent<IProps, IState> {
  componentDidMount() {
    this._loadConfig();
  }

  async _loadConfig() {
    const { value: authConfig } = await this.props.getAuthConfig();

    this.setState({
      config: { ...authConfig }
    });
  }

  updateLoadingPart = (part: string, value?: string | NodeJS.Timeout) => {
    const loadingParts = { ...this.state.loadingParts };

    if (!value) {
      delete loadingParts[part];
    } else {
      loadingParts[part] = value;
    }

    this.setState({
      loadingParts: { ...loadingParts }
    });
  }

  changeConfigPart = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { name, value } = event.target;

    if (this.state.loadingParts && this.state.loadingParts[name]) {
      clearTimeout(this.state.loadingParts[name]);
    }

    const updatePropTimeout = setTimeout(async () => {
      await this.props.saveAuthConfigPart({
        propName: name,
        propValue: value
      });

      this.updateLoadingPart(name, 'completed');
    }, 3000);

    this.updateLoadingPart(name, updatePropTimeout);
  }

  _configForm() {
    const loadingParts = (this.state && this.state.config && this.state.loadingParts) || {};

    const config = (this.state && this.state.config) || this.props.authConfigData.config;

    return (
      <AuthConfigPanel
        loadingParts={loadingParts}
        config={config}
        updateLoadingPart={this.updateLoadingPart}
        changeConfigPart={this.changeConfigPart}
      />
    );
  }

  render() {
    const hasConfig = !!this.props.authConfigData.config && false === this.props.authConfigData.loading;
    return (
      <div id="AuthConfigPage">
        <h1>Auth Config</h1>

        {!hasConfig ? <Spinner /> : this._configForm()}
      </div>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  authConfigData: state.AuthConfig
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getAuthConfig: () => dispatch(AuthConfigActions.getAuthConfig()),
  saveAuthConfigPart: (input?: IAuthConfigEntry) => dispatch(AuthConfigActions.saveAuthConfigPart(input))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthConfigPage);
