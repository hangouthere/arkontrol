import React from 'react';
import { NonIdealState, Icon } from '@blueprintjs/core';
import { Table, Column, Cell } from '@blueprintjs/table';
import { NavButton } from '../containers/NavButton';

export interface Player {
  userName: string;
  steamId: string;
  isOnline: boolean;
  lastSeen: string;
}

const _buildNonIdealState = () => {
  const RefreshButton = <NavButton text="Reload" intent="warning" to="/" />;

  return (
    <NonIdealState
      icon="issue"
      title="No Players Detected"
      description="Your server hasn't had any Players detected before. Once Players connect, they'll appear here."
      action={RefreshButton}
    />
  );
};

const _sortPlayerStatus = (players: Array<Player>): Array<Player> => {
  // Sort by isOnline, then lastSeen
  players.sort((a, b) => {
    const isOnlineSort = Number(a.isOnline) > Number(b.isOnline);
    const seenNewerSort = a.lastSeen > b.lastSeen;

    return Number(isOnlineSort) || Number(seenNewerSort);
  });

  return players;
};

const _buildPlayerCell = (player: Player, columnIndex: number) => {
  switch (columnIndex) {
    case 0:
      return <Cell>{player.userName}</Cell>;
    case 1:
      return <Cell>{player.steamId}</Cell>;
    case 2:
      return (
        <Cell style={{ textAlign: 'center' }}>
          <Icon icon={player.isOnline ? 'small-tick' : 'small-cross'} intent={player.isOnline ? 'success' : 'danger'} />
        </Cell>
      );
    case 3:
      return <Cell>{new Date(player.lastSeen).toLocaleString()}</Cell>;
    default:
      return <Cell>Invalid Column Index: {columnIndex}</Cell>;
  }
};

const _buildPlayerList = (players: Array<Player>) => {
  const playerRenderer = (rowIndex: number, columnIndex: number) => _buildPlayerCell(players[rowIndex], columnIndex);

  const columnWidths = [null, null, 70, 200];

  const playerTable = (
    <Table
      numRows={players.length}
      columnWidths={columnWidths}
      enableColumnResizing={false}
      enableRowResizing={false}
      selectionModes={[]}
    >
      <Column name="Player Name" cellRenderer={playerRenderer} />
      <Column name="Steam ID" cellRenderer={playerRenderer} />
      <Column name="Online?" cellRenderer={playerRenderer} />
      <Column name="Last Seen" cellRenderer={playerRenderer} />
    </Table>
  );

  return playerTable;
};

interface Props {
  players?: Array<Player>;
}

const PlayerList: React.FC<Props> = (props: Props) => {
  let playerDisplay;

  const hasUsers = props.players && props.players.length > 0;
  const players = _sortPlayerStatus(props.players || []);

  playerDisplay = hasUsers ? _buildPlayerList(players) : _buildNonIdealState();

  return <React.Fragment>{playerDisplay}</React.Fragment>;
};

export default PlayerList;
