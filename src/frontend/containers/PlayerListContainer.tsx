import React from 'react';
import PlayersService from '../services/players';
import PlayerList, { Player } from '../components/PlayerList';

interface State {
  players?: Array<Player>;
}

export default class PlayerListContainer extends React.PureComponent<{}, State> {
  state: State = {
    players: []
  };

  componentWillMount() {
    this._getPlayers();
  }

  async _getPlayers() {
    const players = await PlayersService.getPlayers();

    this.setState({ players: players.users });
  }

  render() {
    return (
      <div className="playerLists">
        <h1>Player List</h1>
        <PlayerList players={this.state.players} />
      </div>
    );
  }
}
