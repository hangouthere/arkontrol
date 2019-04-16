import React from 'react';
import { Button, Popover, Classes, InputGroup, FormGroup } from '@blueprintjs/core';
import ConfirmAdminAction from './ConfirmAdminAction';

interface IProps {
  commands: {
    admin: (cmd: string) => void;
    sys: (cmd: string) => void;
  };
  rawCommand: string;
  updateCommandHandler: (event: React.ChangeEvent<HTMLFormElement>) => void;
  performRawCommand: (event: React.FormEvent<HTMLFormElement>) => void;
}

const AdminPanel: React.FC<IProps> = props => (
  <React.Fragment>
    <section className="flex-display">
      <div className="flex-display flex-column space-elements-vertical">
        <h3>Server Control</h3>
        <Button
          text="Reconnect ArKontrol"
          icon="refresh"
          alignText="left"
          onClick={props.commands.sys.bind(null, 'reconnect')}
        />
        <Button
          text="Save World"
          icon="floppy-disk"
          alignText="left"
          onClick={props.commands.admin.bind(null, 'SaveWorld')}
        />
        <Button
          text="Show MOTD"
          icon="info-sign"
          alignText="left"
          onClick={props.commands.admin.bind(null, 'ShowMessageOfTheDay')}
        />
        <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
          <Button text="Shutdown" icon="moon" intent="danger" alignText="left" />
          <ConfirmAdminAction onClickConfirm={props.commands.sys.bind(null, 'shutdown')} />
        </Popover>
      </div>

      <div className="flex-display flex-column space-elements-vertical">
        <h3>Time of Day</h3>
        <div className="flex-display flex-column space-elements-vertical">
          <Button text="Dawn" onClick={props.commands.admin.bind(null, 'SetTimeOfDay 03:00')} />
          <Button text="Noon" onClick={props.commands.admin.bind(null, 'SetTimeOfDay 12:00')} />
          <Button text="Dusk" onClick={props.commands.admin.bind(null, 'SetTimeOfDay 20:00')} />
          <Button text="Dark" onClick={props.commands.admin.bind(null, 'SetTimeOfDay 23:00')} />
        </div>
      </div>

      <div className="flex-display flex-column space-elements-vertical">
        <h3>World Control</h3>
        <Button
          text="Kill Wild Dinos"
          icon="flame"
          alignText="left"
          onClick={props.commands.admin.bind(null, 'DestroyWildDinos')}
        />
      </div>
    </section>

    <section className="rawCommand">
      <h1>Raw Command</h1>

      <form
        id="RawCommandForm"
        onChange={props.updateCommandHandler}
        onSubmit={props.performRawCommand}
        className="flex-display space-elements-horizontal"
      >
        <InputGroup
          id="rawCommand"
          name="rawCommand"
          placeholder="Enter Raw Command"
          className="flex-grow"
          autoComplete="off"
        />

        <Button text="Send Command" icon="comment" type="submit" />
      </form>
    </section>
  </React.Fragment>
);

export default AdminPanel;
