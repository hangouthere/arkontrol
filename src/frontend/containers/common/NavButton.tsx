import { Button, IButtonProps } from '@blueprintjs/core';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface INavButtonProps {
  to: string;
  exact?: boolean;
  // TODO: Review for fix? https://github.com/palantir/blueprint/issues/3450
  type?: 'button' | 'submit';
}

export type NavButtonType = INavButtonProps & IButtonProps & RouteComponentProps;

const NavButtonDef: React.FC<NavButtonType> = props => {
  const { staticContext, to, exact, ...restProps } = props;

  const goUrl = () => props.history.push(to);

  const isActive = exact && props.location.pathname === to;

  return <Button disabled={isActive} onClick={goUrl} {...restProps} />;
};

export const NavButton = withRouter(NavButtonDef);
