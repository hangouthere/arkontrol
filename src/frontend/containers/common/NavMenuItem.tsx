import { IButtonProps, MenuItem } from '@blueprintjs/core';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface INavMenuItemProps {
  to: string;
  exact?: boolean;
}

export type NavMenuItemType = INavMenuItemProps & IButtonProps & RouteComponentProps;

const NavMenuItemDef: React.FC<NavMenuItemType> = props => {
  const { staticContext, to, exact, ...restProps } = props;

  const goUrl = () => props.history.push(to);

  const isActive = exact && props.location.pathname === to;

  return <MenuItem disabled={isActive} onClick={goUrl} {...restProps} />;
};

export const NavMenuItem = withRouter(NavMenuItemDef);
