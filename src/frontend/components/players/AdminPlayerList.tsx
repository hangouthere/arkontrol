import { Button, Classes, Popover, Tooltip } from '@blueprintjs/core';
import { Cell, Column } from '@blueprintjs/table';
import React from 'react';
import { IPlayer } from '../../services/players';
import { IPlayersState } from '../../store/reducers/players';
import ConfirmAction from './ConfirmPlayerAction';
import PlayerList from './PlayerList';

interface IAdminProps {
  playerState: IPlayersState;
  adminActions: {
    kickPlayer: (steamId: string) => void;
    banPlayer: (steamId: string) => void;
  };
}

class AdminPlayerList extends PlayerList<IAdminProps> {
  _defaultRowHeight = 25;
  _classNameModifier = 'adminPlayerList';

  _buildPlayerCell(player: IPlayer, columnIndex: number) {
    const kickPlayer = () => this.props.adminActions.kickPlayer(player.steamId);
    const banPlayer = () => this.props.adminActions.banPlayer(player.steamId);

    const actionButtons = (
      <React.Fragment>
        <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
          <Tooltip content="Kick Player">
            <Button icon="trash" minimal={true} small={true} />
          </Tooltip>
          <ConfirmAction type="Kick" onClickConfirm={kickPlayer} />
        </Popover>
        <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
          <Tooltip content="Ban Player">
            <Button icon="build" minimal={true} small={true} />
          </Tooltip>
          <ConfirmAction type="Ban" onClickConfirm={banPlayer} />
        </Popover>
      </React.Fragment>
    );

    switch (columnIndex) {
      case 4:
        return <Cell>{player.isOnline ? actionButtons : undefined}</Cell>;
      default:
        return super._buildPlayerCell(player, columnIndex);
    }
  }

  _buildColumnWidths() {
    return super._buildColumnWidths().concat(120);
  }

  _generateColumns(players: Array<IPlayer>) {
    const columns = super._generateColumns(players);

    const playerRenderer = (rowIndex: number, columnIndex: number) =>
      this._buildPlayerCell(players[rowIndex], columnIndex);

    let key = 10;

    columns.push(
      // Add new column(s)
      <Column key={key++} name="Actions" cellRenderer={playerRenderer} />
    );

    return columns;
  }
}

export default AdminPlayerList;
