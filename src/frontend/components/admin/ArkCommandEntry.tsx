import { Button, Icon, InputGroup, NumericInput, Tag, Tooltip } from '@blueprintjs/core';
import React from 'react';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import { IArkCommandEntry } from '../../store/reducers/arkCommands';

interface IProps extends IArkCommandEntry {
  updateCommand: (val: string) => void;
  removeCommand: React.MouseEventHandler;
}

const ArkCommandEntry: React.FC<IProps> = props => {
  const isWait = props.command.startsWith('wait');
  let [wait, time] = isWait ? props.command.split(' ') : [undefined, undefined];

  const waitElement = wait ? <Tag>{wait}</Tag> : undefined;

  const numericChangeHandler = (val: number) => props.updateCommand(`wait ${val}`);

  const inputChangeHandler = (event: React.FormEvent<HTMLInputElement>) =>
    props.updateCommand(event.currentTarget.value);

  const inputType = time ? (
    <div className="flex-display space-elements-horizontal flex-align">
      <NumericInput value={time} fill={true} className="smallNumberInput" onValueChange={numericChangeHandler} />{' '}
      <span>seconds</span>
    </div>
  ) : (
    <InputGroup className="bp3-fill" value={props.command} onChange={inputChangeHandler} />
  );

  const DragHandle = SortableHandle(() => (
    <Tooltip content="Drag to Reorder">
      <Icon icon="drag-handle-vertical" />
    </Tooltip>
  ));

  return (
    <div className="commandEntry bp3-dark flex-display flex-align space-elements-horizontal">
      <DragHandle />
      <Tooltip content={isWait ? 'Wait for <n> Seconds' : 'Command'}>
        <Icon icon={isWait ? 'time' : 'widget-button'} />
      </Tooltip>
      {waitElement} {inputType}
      <div className="flex-grow" />
      <div className="rowActions">
        <Button icon="delete" intent="danger" minimal={true} onClick={props.removeCommand} />
      </div>
    </div>
  );
};

export default SortableElement(ArkCommandEntry);
