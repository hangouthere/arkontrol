import * as React from 'react';

// Declared here, but injected via WebPack.DefinePlugin
declare var SOCKET_URI: string;

interface IState {
  inputMessage: string;
  lastMessage: string;
}

// TODO: Turn URL into a process var

class SocketUI extends React.PureComponent<{}, IState> {
  _ws!: WebSocket;

  state = {
    inputMessage: '',
    lastMessage: 'Waiting for connection...'
  };

  componentWillMount() {
    this._ws = new WebSocket(`ws://${SOCKET_URI}`);

    this._ws.addEventListener('open', this._socketOpened.bind(this));
    this._ws.addEventListener('message', this._socketMessageRecieved.bind(this));
  }

  _addMessage(msg: string) {
    this.setState({
      lastMessage: `${this.state.lastMessage}\n${msg}`
    });
  }

  _socketOpened() {
    this._addMessage('Socket Server Connected');
  }

  _socketMessageRecieved(event: MessageEvent) {
    this._addMessage(`Socket Server Message:\n └─» ${event.data}`);
  }

  _updateText = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      inputMessage: event.currentTarget.value
    });
  }

  _submit = (/* event: React.MouseEvent<HTMLButtonElement, MouseEvent> */) => {
    this._ws.send(this.state.inputMessage);

    this.setState({
      inputMessage: ''
    });
  }

  render() {
    return (
      <React.Fragment>
        <div>
          <input type="text" value={this.state.inputMessage} onChange={this._updateText} />
          <button onClick={this._submit}>Send</button>
        </div>
        <textarea readOnly={true} value={this.state.lastMessage} rows={20} cols={50} />
      </React.Fragment>
    );
  }
}

export default SocketUI;
