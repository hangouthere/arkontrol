import * as React from 'react';
import { InputGroup, Button, TextArea } from '@blueprintjs/core';

// Declared here, but injected via WebPack.DefinePlugin
declare var SOCKET_URI: string;

interface IState {
  inputMessage: string;
  lastMessage: string;
}

// TODO: Turn URL into a process var

class SocketDemo extends React.PureComponent<{}, IState> {
  _ws!: WebSocket;

  state = {
    inputMessage: '',
    lastMessage: 'Waiting for connection...'
  };

  componentDidMount() {
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

  _submit = (event: React.FormEvent) => {
    event.preventDefault();

    this._ws.send(this.state.inputMessage);

    this.setState({
      inputMessage: ''
    });
  }

  render() {
    return (
      <React.Fragment>
        <h1>Socket Demo</h1>
        <section className="messageInput">
          <form onSubmit={this._submit}>
            <InputGroup
              className="longerTextGroup"
              value={this.state.inputMessage}
              onChange={this._updateText}
              placeholder="Enter Message"
              leftIcon="comment"
            />
            <Button text="Send" intent="success" />
          </form>
        </section>

        <TextArea className="socketLog" readOnly={true} value={this.state.lastMessage} rows={10} cols={66} />
      </React.Fragment>
    );
  }
}

export default SocketDemo;
