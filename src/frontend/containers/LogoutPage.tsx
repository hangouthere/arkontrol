import React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
import { ShowToaster } from '../services/toaster';
import { AuthActions } from '../store/actions/auth';

interface IProps extends RouteComponentProps {
  redirectAfterAuth: string;
  logout: typeof AuthActions.logoutRequest;
  setRedirect: typeof AuthActions.setRedirect;
}

const Logout: React.FC<IProps> = props => {
  props.logout();
  props.setRedirect('/');

  ShowToaster({
    message: 'Logout Successful',
    intent: 'success'
  });

  return <Redirect to="/" />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logout: () => dispatch(AuthActions.logoutRequest()),
  setRedirect: (uri?: string) => dispatch(AuthActions.setRedirect(uri))
});

export default connect(
  null,
  mapDispatchToProps
)(Logout);
