import { Button, NonIdealState } from '@blueprintjs/core';
import React from 'react';
import { SortableContainer, SortEndHandler } from 'react-sortable-hoc';
import { IArkCommandEntry } from '../../store/reducers/arkCommands';
import ArkCommandEntry from './ArkCommandEntry';

interface IProps {
  hasChange: boolean;
  list: Array<IArkCommandEntry>;
  addCommand: (command?: string) => void;
  updateCommand: (index: number) => (val: string) => void;
  removeCommand: (index: number) => () => void;
  saveCommandList: () => void;
  onSortChange: SortEndHandler;
}

const Entries: React.FC = ({ children }) => <section className="entries space-elements-vertical">{children}</section>;
const EntryContainer = SortableContainer(Entries);

const NoCommands: React.FC = () => (
  <NonIdealState title="No Commands Found" description="You must have at least ONE command!" />
);

const ArkCommandsPanel: React.FC<IProps> = props => {
  const addCommand = () => props.addCommand();
  const addWait = () => props.addCommand('wait');

  const entries = props.list.map((entry, idx) => (
    <ArkCommandEntry
      key={`cmd-${entry.order}`}
      index={idx}
      updateCommand={props.updateCommand(idx)}
      removeCommand={props.removeCommand(idx)}
      {...entry}
    />
  ));

  const chosenDisplay =
    0 === props.list.length ? (
      <NoCommands />
    ) : (
      <EntryContainer lockAxis="y" useDragHandle={true} onSortEnd={props.onSortChange} helperClass="commandEntry-drag">
        {entries}
      </EntryContainer>
    );

  return (
    <div id="ArkCommandsPanel" className="flex-display flex-column space-elements-vertical">
      <section className="actions flex-display space-elements-horizontal">
        <Button icon="widget-button" onClick={addCommand}>
          Add Command
        </Button>
        <Button icon="time" onClick={addWait}>
          Add Wait
        </Button>
        <div className="flex-grow" />
        <Button
          icon="floppy-disk"
          disabled={!props.hasChange || 0 === props.list.length}
          intent={props.hasChange ? 'warning' : 'success'}
          onClick={props.saveCommandList}
        >
          Save
        </Button>
      </section>

      {chosenDisplay}
    </div>
  );
};

export default ArkCommandsPanel;
