import { Button, Classes, Popover } from '@blueprintjs/core';
import React from 'react';
import { IPlayer } from '../../services/players';
import { IPlayersState } from '../../store/reducers/players';
import { ITagSelectItem } from '../common/MultiSelectDropdown';
import SelectDropdown from '../common/SelectDropdown';
import ConfirmAction from './ConfirmPlayerAction';
import NoPlayerSelected from './NoPlayerSelected';

interface IAdminActions {
  kickPlayer: (steamId: string) => void;
  banPlayer: (steamId: string) => void;
}

interface IProps {
  playerState: IPlayersState;
  adminActions?: IAdminActions;
}

interface IState {
  selectedPlayer: IPlayer;
}

class PlayerListMobile extends React.PureComponent<IProps, IState> {
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

  _onChangePlayer = (selectedItem: ITagSelectItem) => {
    const selectedPlayer = this.props.playerState.players!.find(p => p.steamId === selectedItem.key);

    this.setState({
      selectedPlayer: selectedPlayer!
    });
  };

  _getUserSelectDisplay(players?: Array<IPlayer>) {
    let onlineCount = 0;
    let playersSelectItems: Array<ITagSelectItem> = [];

    (players || []).forEach(p => {
      playersSelectItems.push({
        key: p.steamId,
        tag: p.userName,
        text: p.userName,
        label: p.isOnline ? 'Online' : 'Offline'
      });

      if (true === p.isOnline) {
        onlineCount++;
      }
    });

    return (
      <div className="flex-display space-elements-horizontal flex-align">
        <SelectDropdown items={playersSelectItems} onChange={this._onChangePlayer} />
        <span className="onlineCount">Online: {onlineCount}</span>
      </div>
    );
  }

  _getUserDisplay(player?: IPlayer) {
    if (!player) {
      return <NoPlayerSelected />;
    }

    return (
      <div className="mobile-playerDisplay">
        <dl>
          <dt>UserName</dt>
          <dd>{player.userName}</dd>

          <dt>Is Online?</dt>
          <dd>{player.isOnline ? 'Yes' : 'No'}</dd>

          <dt>Last Seen</dt>
          <dd>{new Date(player.lastSeen).toLocaleString()}</dd>
        </dl>
      </div>
    );
  }

  _getAdminActions(actions?: IAdminActions) {
    const hasPlayer = this.state && this.state.selectedPlayer;
    if (!hasPlayer || !actions) {
      return undefined;
    }

    const kickPlayer = () => actions.kickPlayer(this.state.selectedPlayer.steamId);
    const banPlayer = () => actions.banPlayer(this.state.selectedPlayer.steamId);

    const actionButtons = (
      <section className="flex-display space-elements-horizontal">
        <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
          <Button icon="trash" text="Kick Player" />
          <ConfirmAction type="Kick" onClickConfirm={kickPlayer} />
        </Popover>
        <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
          <Button icon="build" text="Ban Player" />
          <ConfirmAction type="Ban" onClickConfirm={banPlayer} />
        </Popover>
      </section>
    );

    return actionButtons;
  }

  render() {
    const players = this.props.playerState.players ? this._sortPlayerStatus(this.props.playerState.players) : [];

    return (
      <div className="flex-display flex-column">
        {this._getUserSelectDisplay(players)}
        {this._getUserDisplay(this.state && this.state.selectedPlayer)}
        {this._getAdminActions(this.props.adminActions)}
      </div>
    );
  }
}

export default PlayerListMobile;
