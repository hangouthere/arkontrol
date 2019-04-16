import { Button, Classes, FormGroup, InputGroup } from '@blueprintjs/core';
import React from 'react';
import { IAuthState } from '../store/reducers/auth';

interface IProps {
  auth: IAuthState;
  performLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  updateLoginHandler: (event: React.ChangeEvent<HTMLFormElement>) => void;
}

const LoginForm: React.FC<IProps> = props => (
  <form id="LoginForm" onSubmit={props.performLogin} onChange={props.updateLoginHandler}>
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

    {props.auth.error && <span className={Classes.INTENT_DANGER}>{props.auth.error.toString()}</span>}
  </form>
);

export default LoginForm;
