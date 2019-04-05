import { Button, Classes, FormGroup, InputGroup } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
import { IAuthRequest } from '../services/auth';
import { AuthActions } from '../store/actions/auth';
import { IRootState } from '../store/reducers';
import { AuthState } from '../store/reducers/auth';

interface IProps extends AuthState, RouteComponentProps {
  login: typeof AuthActions.loginRequest;
  setRedirect: typeof AuthActions.setRedirect;
}

interface IState {
  loginInfo: IAuthRequest;
}

class LoginPanel extends React.PureComponent<IProps, IState> {
  state: IState = {
    loginInfo: {
      userName: '',
      password: ''
    }
  };

  performLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await this.props.login(this.state.loginInfo);

      const redirectAfterAuth = this.props.redirectAfterAuth;

      this.props.setRedirect('/');
      this.props.history.replace(redirectAfterAuth);
    } catch (err) {
      //
    }
  }

  handleInputChange = async (event: React.ChangeEvent<HTMLFormElement>) => {
    this.setState({
      loginInfo: {
        ...this.state.loginInfo,
        [event.target.name]: event.target.value
      }
    });
  }

  render() {
    if (this.props.user) {
      return <Redirect to={this.props.redirectAfterAuth} />;
    }

    return (
      <React.Fragment>
        <h1>Login</h1>

        <form id="LoginPanel" onSubmit={this.performLogin} onChange={this.handleInputChange}>
          <FormGroup label="UserName" labelFor="userName" labelInfo="*" disabled={this.props.loading}>
            <InputGroup
              id="userName"
              name="userName"
              placeholder="Enter UserName"
              intent={this.props.error ? 'danger' : undefined}
            />
          </FormGroup>

          <FormGroup label="Password" labelFor="password" labelInfo="*" disabled={this.props.loading}>
            <InputGroup
              id="password"
              name="password"
              type="password"
              placeholder="Enter Password"
              intent={this.props.error ? 'danger' : undefined}
            />
          </FormGroup>

          <div className="formFooter">
            <Button intent="success" text="Login" type="submit" loading={this.props.loading} />
          </div>

          {this.props.error && <span className={Classes.INTENT_DANGER}>{this.props.error.toString()}</span>}
        </form>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  ...state.Auth
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  login: (loginInfo?: IAuthRequest) => dispatch(AuthActions.loginRequest(loginInfo)),
  setRedirect: (uri?: string) => dispatch(AuthActions.setRedirect(uri))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPanel);
