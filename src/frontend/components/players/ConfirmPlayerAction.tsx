import { Button, Classes, Intent } from '@blueprintjs/core';
import React from 'react';

interface IConfirmActionProps {
  type: string;
  onClickConfirm: (event: React.MouseEvent<HTMLElement>) => void;
}

const ConfirmAction: React.FC<IConfirmActionProps> = props => (
  <React.Fragment>
    <h2>Confirm {props.type}</h2>
    <p>Are you sure you want to {props.type} this user?</p>
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 15 }}>
      <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
        Cancel
      </Button>
      <Button
        intent={Intent.DANGER}
        className={Classes.POPOVER_DISMISS}
        text={props.type}
        onClick={props.onClickConfirm}
      />
    </div>
  </React.Fragment>
);

export default ConfirmAction;
