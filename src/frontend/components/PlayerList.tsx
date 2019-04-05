import { Icon, NonIdealState, Spinner } from '@blueprintjs/core';
import { Cell, Column, Table } from '@blueprintjs/table';
import React from 'react';
import { NavButton } from '../containers/NavButton';
import { IPlayer } from '../services/players';
import { PlayersState } from '../store/reducers/players';

const _buildNonIdealState = () => {
  const RefreshButton = <NavButton text="Reload" intent="warning" to="/" />;

  const description = (
    <React.Fragment>
      Your server hasn't had any Players detected before.
      <br />
      Once Players connect, they'll appear here.
    </React.Fragment>
  );

  return <NonIdealState icon="issue" title="No Players Detected" description={description} action={RefreshButton} />;
};

const _sortPlayerStatus = (players: Array<IPlayer>): Array<IPlayer> => {
  // Sort by isOnline, then lastSeen
  return players.sort((a, b) => {
    const seenNewerSort = new Date(a.lastSeen) < new Date(b.lastSeen);

    return seenNewerSort ? 1 : -1;
  });
};

const _buildPlayerCell = (player: IPlayer, columnIndex: number) => {
  switch (columnIndex) {
    case 0:
      return <Cell>{player.userName}</Cell>;
    case 1:
      return <Cell>{player.steamId}</Cell>;
    case 2:
      return (
        <Cell style={{ textAlign: 'center' }}>
          <React.Fragment>
            <Icon
              icon={player.isOnline ? 'small-tick' : 'small-cross'}
              intent={player.isOnline ? 'success' : 'danger'}
            />
          </React.Fragment>
        </Cell>
      );
    case 3:
      return <Cell>{new Date(player.lastSeen).toLocaleString()}</Cell>;
    default:
      return <Cell>Invalid Column Index: {columnIndex}</Cell>;
  }
};

const _buildPlayerList = (players: Array<IPlayer>) => {
  const playerRenderer = (rowIndex: number, columnIndex: number) => _buildPlayerCell(players[rowIndex], columnIndex);

  const columnWidths = [null, null, 70, 200];

  const playerTable = (
    <Table
      className="playerListTable"
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

const PlayerList: React.FC<PlayersState> = props => {
  let playerDisplay;

  if (props.loading) {
    return <Spinner size={75} />;
  }

  const hasUsers = props.players && props.players.length > 0;
  const players = _sortPlayerStatus(props.players || []);
  playerDisplay = hasUsers ? _buildPlayerList(players) : _buildNonIdealState();

  return <React.Fragment>{playerDisplay}</React.Fragment>;
};

export default PlayerList;
