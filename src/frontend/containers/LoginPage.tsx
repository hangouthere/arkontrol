import React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
import LoginForm from '../components/LoginForm';
import { IAuthRequest } from '../services/auth';
import { ShowToaster } from '../services/toaster';
import { AuthActions } from '../store/actions/auth';
import { IRootState } from '../store/reducers';
import { IAuthState } from '../store/reducers/auth';

interface IProps extends RouteComponentProps {
  auth: IAuthState;
  login: typeof AuthActions.loginRequest;
  setRedirect: typeof AuthActions.setRedirect;
}

class LoginPage extends React.PureComponent<IProps, IAuthRequest> {
  state: IAuthRequest = {
    userName: '',
    password: ''
  };

  performLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const { redirectAfterAuth } = this.props.auth;

      await this.props.login(this.state);

      ShowToaster({
        message: 'Login Successful',
        intent: 'success'
      });

      this.props.setRedirect('/');
      this.props.history.replace(redirectAfterAuth);
    } catch (err) {
      //
    }
  }

  updateLoginHandler = (event: React.ChangeEvent<HTMLFormElement>) => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value
    });
  }

  render() {
    const { user, redirectAfterAuth } = this.props.auth;

    if (user) {
      return <Redirect to={redirectAfterAuth} />;
    }

    return (
      <React.Fragment>
        <h1>Login</h1>

        <LoginForm
          auth={this.props.auth}
          updateLoginHandler={this.updateLoginHandler}
          performLogin={this.performLogin}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  auth: state.Auth
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  login: (loginInfo?: IAuthRequest) => dispatch(AuthActions.loginRequest(loginInfo)),
  setRedirect: (uri?: string) => dispatch(AuthActions.setRedirect(uri))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);
