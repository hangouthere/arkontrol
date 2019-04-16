import { Button, NonIdealState } from '@blueprintjs/core';
import React from 'react';

interface IProps {
  refreshPlayers: () => void;
}

const NoPlayersDetected: React.FC<IProps> = props => {
  const RefreshButton = <Button text="Reload" intent="warning" onClick={props.refreshPlayers} />;

  const description = (
    <React.Fragment>
      Your server hasn't had any Players detected before.
      <br />
      Once Players connect, they'll appear here.
    </React.Fragment>
  );

  return <NonIdealState icon="issue" title="No Players Detected" description={description} action={RefreshButton} />;
};

export default NoPlayersDetected;
