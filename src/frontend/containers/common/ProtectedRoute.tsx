import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
import { AuthActions } from '../../store/actions/auth';
import { IRootState } from '../../store/reducers';
import { IAuthState } from '../../store/reducers/auth';

interface IProps extends RouteComponentProps {
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  authPath: string;
  authState: IAuthState;
  setRedirect: typeof AuthActions.setRedirect;
}

const ProtectedRoute: React.FC<IProps> = props => {
  const { component, authPath, authState, location, setRedirect, ...rest } = props;

  if (authState.user) {
    return <Route {...rest} component={component} />;
  } else {
    setRedirect(location.pathname);
    return <Redirect to={authPath} />;
  }
};

const mapStateToProps = (state: IRootState) => ({
  authState: state.Auth
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setRedirect: (uri?: string) => dispatch(AuthActions.setRedirect(uri))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProtectedRoute);
