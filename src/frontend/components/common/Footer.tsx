import { Icon, Intent } from '@blueprintjs/core';
import React from 'react';
import { IRemoteStatusState } from '../../store/reducers/remoteStatus';
import AboutPanel from './AboutPanel';

const Footer: React.FC<IRemoteStatusState> = props => (
  <footer id="StatusFooter" className="flex-display">
    <AboutPanel className="flex-grow">
      <div className="label">Made by nfgCodex</div>
    </AboutPanel>

    <div className="bot">
      Bot Status:&nbsp;
      <Icon
        icon={props.connectedToBot ? 'endorsed' : 'offline'}
        intent={props.connectedToBot ? Intent.SUCCESS : Intent.DANGER}
      />
    </div>
    <div className="server">
      Server Status:&nbsp;
      <Icon
        icon={props.connectedToServer ? 'endorsed' : 'offline'}
        intent={props.connectedToServer ? Intent.SUCCESS : Intent.DANGER}
      />
    </div>
  </footer>
);

export default Footer;
