import { Button, Classes, Intent } from '@blueprintjs/core';
import React from 'react';

interface IConfirmActionProps {
  onClickConfirm: (event: React.MouseEvent<HTMLElement>) => void;
}

const ConfirmAdminAction: React.FC<IConfirmActionProps> = props => (
  <React.Fragment>
    <h2>Are you sure?</h2>
    <p>Do you really want to do that?</p>
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 15 }}>
      <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
        Cancel
      </Button>
      <Button intent={Intent.DANGER} className={Classes.POPOVER_DISMISS} onClick={props.onClickConfirm} text="Do It" />
    </div>
  </React.Fragment>
);

export default ConfirmAdminAction;
