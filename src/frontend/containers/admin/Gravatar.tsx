import React from 'react';
import { IUser } from '../../services/auth';
import md5 from 'blueimp-md5';

export type GravatarDefault = '404' | 'blank' | 'identicon' | 'monsterid' | 'mp' | 'retro' | 'robohash' | 'wavatar';

interface IProps {
  user: IUser;
  enableHelp?: boolean;
  gravatarDefault?: GravatarDefault;
}

const GravatarId = (email: string = '') => md5(email);

const OpenAboutGravatar = () => window.open('https://en.gravatar.com/support/', '_blank');

// Converts obj -> &opt1=1&opt2=1
const getUriOptions = (gravatarDefault?: GravatarDefault) => {
  if (!gravatarDefault) {
    return '';
  }

  return `d=${gravatarDefault}`;
};

const Gravatar: React.FC<IProps> = props => (
  <img
    className={`gravatar-icon ${props.enableHelp ? 'gravatar-help' : ''}`}
    onClick={props.enableHelp ? OpenAboutGravatar : undefined}
    src={`https://gravatar.com/avatar/${GravatarId(props.user.email)}?${getUriOptions(props.gravatarDefault)}`}
  />
);

export default Gravatar;
