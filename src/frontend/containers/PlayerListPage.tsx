import { Button, Spinner, ResizeSensor, IResizeEntry } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import AdminPlayerList from '../components/players/AdminPlayerList';
import NoPlayersDetected from '../components/players/NoPlayersDetected';
import PlayerList from '../components/players/PlayerList';
import { PlayersActions } from '../store/actions/players';
import { IRootState } from '../store/reducers';
import { IPlayersState } from '../store/reducers/players';
import PlayerMessages from './admin/PlayerMessenger';
import PlayerListMobile from '../components/players/PlayerListMobile';

const DESKTOP_MINIMUM = 769;
const REFRESH_INTERVAL = 2 * 60 * 1000;

interface IProps {
  listData: IPlayersState;
  isAuthenticated: boolean;
  loadPlayers: typeof PlayersActions.loadPlayers;
  kickPlayer: typeof PlayersActions.kickPlayer;
  banPlayer: typeof PlayersActions.banPlayer;
}

interface IState {
  isDesktop: boolean;
}

class PlayerListContainer extends React.PureComponent<IProps, IState> {
  state: IState = {
    isDesktop: true
  };

  private _intervalId!: NodeJS.Timeout;

  get hasPlayers() {
    return this.props.listData.players && 0 !== this.props.listData.players.length;
  }

  get adminActions() {
    return {
      kickPlayer: this.props.kickPlayer,
      banPlayer: this.props.banPlayer
    };
  }

  componentDidMount() {
    this._intervalId = setInterval(this._getPlayers, REFRESH_INTERVAL);
    this._getPlayers();
  }

  componentWillUnmount() {
    clearInterval(this._intervalId);
  }

  _onResize = (entries: IResizeEntry[]) => {
    const tooSmall = entries.some(entry => entry.contentRect.width < DESKTOP_MINIMUM);

    this.setState({
      isDesktop: !tooSmall
    });
  };

  _getPlayers = async () => {
    await this.props.loadPlayers();
  };

  _getNoPlayersDisplay() {
    return <NoPlayersDetected key="npd" refreshPlayers={this._getPlayers} />;
  }

  _getPlayerListDisplay() {
    let playerList;

    if (false === this.props.isAuthenticated) {
      playerList = <PlayerList key="pl" playerState={this.props.listData} />;
    } else {
      playerList = <AdminPlayerList key="pl" playerState={this.props.listData} adminActions={this.adminActions} />;
    }

    return playerList;
  }

  _getPlayerListMobileDisplay() {
    const adminActions = this.props.isAuthenticated ? this.adminActions : undefined;

    return <PlayerListMobile key="pl" playerState={this.props.listData} adminActions={adminActions} />;
  }

  _getPlayerMessagesDisplay() {
    return this.props.isAuthenticated ? <PlayerMessages key="pm" /> : undefined;
  }

  _getDisplay() {
    let outDisplay: React.ReactNode = <Spinner size={75} />;

    if (false === this.props.listData.loading) {
      if (false === this.hasPlayers) {
        outDisplay = [this._getNoPlayersDisplay()];
      } else {
        const { isDesktop } = this.state;
        const listDisplay = isDesktop ? this._getPlayerListDisplay() : this._getPlayerListMobileDisplay();

        outDisplay = [listDisplay, this._getPlayerMessagesDisplay()];
      }
    }

    return outDisplay;
  }

  render() {
    const Display = this._getDisplay();

    return (
      <ResizeSensor onResize={this._onResize}>
        <div id="PlayerListPage">
          <h1>
            Player List&nbsp;
            <Button icon="refresh" minimal={true} onClick={this._getPlayers} disabled={this.props.listData.loading} />
          </h1>
          {Display}
        </div>
      </ResizeSensor>
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
