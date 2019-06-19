import { Icon } from '@blueprintjs/core';
import { Cell, Column, Table } from '@blueprintjs/table';
import React from 'react';
import { IPlayer } from '../../services/players';
import { IPlayersState } from '../../store/reducers/players';

interface IProps {
  playerState: IPlayersState;
}

class PlayerList<P extends IProps> extends React.PureComponent<P> {
  protected _defaultRowHeight = 20;
  protected _classNameModifier = '';

  _sortPlayerStatus(players?: Array<IPlayer>): Array<IPlayer> {
    if (!players) {
      return [];
    }

    // Sort by isOnline, then lastSeen
    return players.sort((a, b) => {
      const seenNewerSort = new Date(a.lastSeen) < new Date(b.lastSeen);

      return seenNewerSort ? 1 : -1;
    });
  }

  _buildPlayerCell(player: IPlayer, columnIndex: number) {
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
  }

  _generateColumns(players: Array<IPlayer>) {
    const playerRenderer = (rowIndex: number, columnIndex: number) =>
      this._buildPlayerCell(players[rowIndex], columnIndex);

    let key = 0;

    return [
      <Column key={key++} name="Player Name" cellRenderer={playerRenderer} />,
      <Column key={key++} name="Steam ID" cellRenderer={playerRenderer} />,
      <Column key={key++} name="Online?" cellRenderer={playerRenderer} />,
      <Column key={key++} name="Last Seen" cellRenderer={playerRenderer} />
    ];
  }

  _buildColumnWidths() {
    return [null, null, 70, 180];
  }

  _buildPlayerTable(players: Array<IPlayer>) {
    const playerTable = (
      <Table
        className={'playerListTable ' + this._classNameModifier}
        numRows={players.length}
        columnWidths={this._buildColumnWidths()}
        enableColumnResizing={false}
        enableRowResizing={false}
        selectionModes={[]}
        defaultRowHeight={this._defaultRowHeight}
      >
        {this._generateColumns(players)}
      </Table>
    );

    return playerTable;
  }

  render() {
    const players = this.props.playerState.players ? this._sortPlayerStatus(this.props.playerState.players) : [];

    return <React.Fragment>{this._buildPlayerTable(players)}</React.Fragment>;
  }
}

export default PlayerList;
