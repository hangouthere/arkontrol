import { Button, Callout, FormGroup, InputGroup } from '@blueprintjs/core';
import React from 'react';
import { IAuthState } from '../store/reducers/auth';

interface IProps {
  auth: IAuthState;
  performLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  updateLoginHandler: (event: React.ChangeEvent<HTMLFormElement>) => void;
}

const LoginForm: React.FC<IProps> = props => {
  const errorMessage = props.auth.error && props.auth.error.toString();

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

      <FormGroup label="UserName" labelFor="userName" labelInfo="*" disabled={props.auth.loading}>
        <InputGroup
          id="userName"
          name="userName"
          placeholder="Enter UserName"
          intent={props.auth.error ? 'danger' : 'none'}
          autoComplete="username"
        />
      </FormGroup>

      <FormGroup label="Password" labelFor="password" labelInfo="*" disabled={props.auth.loading}>
        <InputGroup
          id="password"
          name="password"
          type="password"
          placeholder="Enter Password"
          intent={props.auth.error ? 'danger' : undefined}
          autoComplete="current-password"
        />
      </FormGroup>

      <div className="formFooter">
        <Button intent="success" text="Login" type="submit" loading={props.auth.loading} />
      </div>
    </form>
  );
};

export default LoginForm;
