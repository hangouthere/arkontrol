import { Button } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import PlayerList from '../components/PlayerList';
import { PlayersActions } from '../store/actions/players';
import { IRootState } from '../store/reducers';
import { PlayersState } from '../store/reducers/players';

const REFRESH_INTERVAL = 60 * 1000;

interface IProps {
  listData: PlayersState;
  loadPlayers: typeof PlayersActions.loadPlayers;
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
    return (
      <div id="PlayerListContainer">
        <h1>
          Player List <Button minimal={true} icon="refresh" onClick={this._getPlayers} />
        </h1>
        <PlayerList {...this.props.listData} />
      </div>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  listData: state.Players
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadPlayers: () => dispatch(PlayersActions.loadPlayers())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerListContainer);
