import { Button, HTMLSelect, InputGroup, IOptionProps } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { IUser } from '../services/auth';
import { IPlayer } from '../services/players';
import { AdminActions } from '../store/actions/admin';
import { PlayersActions } from '../store/actions/players';
import { IRootState } from '../store/reducers';
import { IPlayersState } from '../store/reducers/players';

interface IProps {
  playerInfo: IPlayersState;
  serverMessage: typeof AdminActions.serverMessage;
  messagePlayer: typeof PlayersActions.messagePlayer;
  user?: IUser;
}

interface IState {
  chatType: string;
  message: string;
  toPlayer?: string;
}

class PlayerMessages extends React.PureComponent<IProps, IState> {
  state: IState = {
    chatType: 'broadcast',
    message: ''
  };

  _changeInput = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    this.setState({
      [event.currentTarget.name]: event.currentTarget.value
    } as Pick<IState, keyof IState>);

    if ('chatType' === event.currentTarget.name && 'serverchattoplayer' !== event.currentTarget.value) {
      this.setState({
        toPlayer: undefined
      });
    }
  }

  _getPlayers() {
    return this.props.playerInfo.players && 0 !== this.props.playerInfo.players.length
      ? this.props.playerInfo.players
      : [];
  }

  _getPlayerOptions() {
    let players = this._getPlayers();

    players = players.filter(p => p.isOnline);

    const playerOptionProps = players.map<IOptionProps>((p: IPlayer) => ({
      value: p.steamId,
      label: p.userName
    }));

    const playerOptions: Array<IOptionProps> = !players.length
      ? [{ label: 'No Players Online', value: 'plzSelect', disabled: true } as IOptionProps]
      : [{ label: '-- Select a Player --', value: 'plzSelect', disabled: true } as IOptionProps].concat(
          playerOptionProps
        );

    return playerOptions;
  }

  _sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userName = this.props.user ? this.props.user.userName : 'Admin User';

    switch (this.state.chatType) {
      case 'broadcast':
      case 'serverchat':
        this.props.serverMessage({ userName, message: this.state.message, type: this.state.chatType });
        break;
      case 'serverchattoplayer':
        this.props.messagePlayer({
          userName,
          toPlayer: this.state.toPlayer ? this.state.toPlayer : '',
          message: this.state.message
        });
        break;
    }

    this.setState({
      message: ''
    });
  }

  render() {
    const playerOptions = this._getPlayerOptions();

    const canSend =
      2 <= this.state.message.length &&
      ('serverchattoplayer' !== this.state.chatType ||
        ('serverchattoplayer' === this.state.chatType && !!this.state.toPlayer));

    return (
      <div id="PlayerMessages">
        <h1>Messaging</h1>

        <form className="flex-display messageInput" onSubmit={this._sendMessage} autoComplete="off">
          <HTMLSelect name="chatType" value={this.state.chatType} onChange={this._changeInput}>
            <option value="broadcast">Broadcast</option>
            <option value="serverchat">Server Chat</option>
            <option value="serverchattoplayer" disabled={1 >= playerOptions.length}>
              To Player
            </option>
          </HTMLSelect>

          <InputGroup name="message" value={this.state.message} onChange={this._changeInput} className="flex-grow" />

          <HTMLSelect
            name="toPlayer"
            value={this.state.toPlayer || 'plzSelect'}
            options={playerOptions}
            onChange={this._changeInput}
            disabled={this.state.chatType !== 'serverchattoplayer'}
          />

          <Button icon="chat" text="Send" type="submit" disabled={!canSend} />
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  user: state.Auth.user,
  playerInfo: { ...state.Players }
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  serverMessage: (input?: { userName: string; message: string; type: string }) =>
    dispatch(AdminActions.serverMessage(input)),
  messagePlayer: (input?: { userName: string; toPlayer: string; message: string }) =>
    dispatch(PlayersActions.messagePlayer(input))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerMessages);
