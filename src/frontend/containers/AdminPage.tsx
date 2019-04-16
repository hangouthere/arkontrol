import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import AdminPanel from '../components/admin/AdminPanel';
import { AdminActions } from '../store/actions/admin';

interface IProps {
  adminCommand: typeof AdminActions.adminCommand;
  sysCommand: typeof AdminActions.sysCommand;
}

interface IState {
  rawCommand: string;
}

class AdminPage extends React.PureComponent<IProps, IState> {
  state = {
    rawCommand: ''
  };

  updateCommandHandler = (event: React.ChangeEvent<HTMLFormElement>) => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value
    });
  }

  performRawCommand = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    AdminActions.adminCommand(this.state.rawCommand);

    this.setState({
      rawCommand: ''
    });
  }

  render() {
    const commands = {
      admin: this.props.adminCommand,
      sys: this.props.sysCommand
    };

    return (
      <div id="AdminPage" className="flex-display flex-column space-elements-vertical">
        <h1>Administration</h1>

        <AdminPanel
          commands={commands}
          rawCommand={this.state.rawCommand}
          updateCommandHandler={this.updateCommandHandler}
          performRawCommand={this.performRawCommand}
        />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  adminCommand: (command?: string) => dispatch(AdminActions.adminCommand(command)),
  sysCommand: (command?: string) => dispatch(AdminActions.sysCommand(command))
});

export default connect(
  null,
  mapDispatchToProps
)(AdminPage);
