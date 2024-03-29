import { Tab, Tabs } from '@blueprintjs/core';
import React from 'react';
import ArkCommandsContainer from '../../containers/admin/ArkCommandsContainer';
import AuthConfigContainer from '../../containers/admin/AuthConfigContainer';
import UserMgmtContainer from '../../containers/admin/UserMgmtContainer';

const ServerConfigPage: React.FC = () => (
  <div id="ServerConfigPage">
    <h1>Server Config</h1>

    <Tabs id="ServerConfig" large={true} renderActiveTabPanelOnly={true}  >
      <Tab id="AuthConfig" title="Auth" panel={<AuthConfigContainer />} />
      <Tab id="ArkCommands" title="Ark Commands" panel={<ArkCommandsContainer />} />
      <Tab id="UserMgmt" title="Users" panel={<UserMgmtContainer />} />
    </Tabs>
  </div>
);

export default ServerConfigPage;
