import { Button, Spinner } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import AdminPlayerList from '../components/players/AdminPlayerList';
import NoPlayersDetected from '../components/players/NoPlayersDetected';
import PlayerList from '../components/players/PlayerList';
import { PlayersActions } from '../store/actions/players';
import { IRootState } from '../store/reducers';
import { IPlayersState } from '../store/reducers/players';
import PlayerMessages from './PlayerMessenger';

const REFRESH_INTERVAL = 60 * 1000;

interface IProps {
  listData: IPlayersState;
  isAuthenticated: boolean;
  loadPlayers: typeof PlayersActions.loadPlayers;
  kickPlayer: typeof PlayersActions.kickPlayer;
  banPlayer: typeof PlayersActions.banPlayer;
}

class PlayerListContainer extends React.PureComponent<IProps> {
  private _intervalId!: NodeJS.Timeout;

  componentDidMount() {
    this._intervalId = setInterval(this._getPlayers, REFRESH_INTERVAL);
    this._getPlayers();
  }

  componentWillUnmount() {
    clearInterval(this._intervalId);
  }

  _getPlayers = async () => {
    await this.props.loadPlayers();
  }

  render() {
    const adminActions = {
      kickPlayer: this.props.kickPlayer,
      banPlayer: this.props.banPlayer
    };

    const hasPlayers = this.props.listData.players && 0 !== this.props.listData.players.length;
    const adminPlayerList = <AdminPlayerList key="pl" playerData={this.props.listData} adminActions={adminActions} />;
    const standardPlayerList = <PlayerList key="pl" playerData={this.props.listData} />;
    const noPlayersDisplay = !hasPlayers ? (
      <NoPlayersDetected key="npd" refreshPlayers={this._getPlayers} />
    ) : (
      undefined
    );
    const ChosenPlayerList = hasPlayers
      ? false === this.props.isAuthenticated
        ? standardPlayerList
        : adminPlayerList
      : undefined;
    const ChosenPlayerMessages = this.props.isAuthenticated ? <PlayerMessages key="pm" /> : undefined;

    const PlayerListOutput =
      false === this.props.listData.loading ? [noPlayersDisplay, ChosenPlayerList] : <Spinner size={75} />;

    return (
      <div id="PlayerListPage">
        <h1>
          Player List&nbsp;
          <Button icon="refresh" minimal={true} onClick={this._getPlayers} disabled={this.props.listData.loading} />
        </h1>

        {PlayerListOutput}
        {ChosenPlayerMessages}
      </div>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  listData: state.Players,
  isAuthenticated: !!state.Auth.user
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadPlayers: () => dispatch(PlayersActions.loadPlayers()),
  kickPlayer: (playerId?: string) => dispatch(PlayersActions.kickPlayer(playerId)),
  banPlayer: (playerId?: string) => dispatch(PlayersActions.banPlayer(playerId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerListContainer);
