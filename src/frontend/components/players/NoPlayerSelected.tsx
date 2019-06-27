import { NonIdealState } from '@blueprintjs/core';
import React from 'react';

const NoPlayerSelected: React.FC = () => {
  const description = <React.Fragment>Please select a Player from the dropdown.</React.Fragment>;

  return <NonIdealState icon="issue" title="No User Selected" description={description} />;
};

export default NoPlayerSelected;
