import { Button, Callout, FormGroup, InputGroup } from '@blueprintjs/core';
import React from 'react';
import { IAuthState } from '../store/reducers/auth';

interface IProps {
  authState: IAuthState;
  performLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  updateLoginHandler: (event: React.ChangeEvent<HTMLFormElement>) => void;
}

const LoginForm: React.FC<IProps> = props => {
  const errorMessage = props.authState.error && props.authState.error.toString();

  const errorDisplay = !!errorMessage ? (
    <Callout title="Error" intent="danger" className="error-panel">
      {errorMessage}
    </Callout>
  ) : (
    undefined
  );

  return (
    <form id="LoginForm" onSubmit={props.performLogin} onChange={props.updateLoginHandler}>
      {errorDisplay}

      <FormGroup label="UserName" labelFor="userName" labelInfo="*" disabled={props.authState.loading}>
        <InputGroup
          id="userName"
          name="userName"
          placeholder="Enter UserName"
          intent={props.authState.error ? 'danger' : 'none'}
          autoComplete="username"
        />
      </FormGroup>

      <FormGroup label="Password" labelFor="password" labelInfo="*" disabled={props.authState.loading}>
        <InputGroup
          id="password"
          name="password"
          type="password"
          placeholder="Enter Password"
          intent={props.authState.error ? 'danger' : undefined}
          autoComplete="current-password"
        />
      </FormGroup>

      <div className="formFooter">
        <Button intent="success" text="Login" type="submit" loading={props.authState.loading} />
      </div>
    </form>
  );
};

export default LoginForm;
