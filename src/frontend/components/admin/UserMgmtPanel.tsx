import { Button, Popover, Classes } from '@blueprintjs/core';
import { Cell, Column, Table } from '@blueprintjs/table';
import React from 'react';
import { IUser, NormalizeUserName } from '../../services/auth';
import ConfirmAdminAction from './ConfirmAdminAction';

interface IProps {
  users: Array<IUser>;
  createUser: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  editUser: (user: IUser) => void;
  deleteUser: (user: IUser) => void;
  errorDisplay?: JSX.Element;
}

class PlayerList<P extends IProps> extends React.PureComponent<P> {
  protected _defaultRowHeight = 35;

  _buildUserCell(user: IUser, columnIndex: number) {
    const editUser = () => this.props.editUser(user);
    const deleteUser = () => this.props.deleteUser(user);

    switch (columnIndex) {
      case 0:
        return <Cell>{NormalizeUserName(user)}</Cell>;
      case 1:
        return <Cell>{user.lastLogin ? new Date(user.lastLogin!).toLocaleString() : 'N/A'}</Cell>;
      case 2:
        return (
          <Cell style={{ textAlign: 'center' }}>
            <React.Fragment>
              <Button minimal={true} icon="edit" onClick={editUser} />
              <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
                <Button minimal={true} icon="delete" intent="danger" />
                <ConfirmAdminAction onClickConfirm={deleteUser} />
              </Popover>
            </React.Fragment>
          </Cell>
        );
      default:
        return <Cell>Invalid Column Index: {columnIndex}</Cell>;
    }
  }

  _generateColumns(users: Array<IUser>) {
    const userRenderer = (rowIndex: number, columnIndex: number) => this._buildUserCell(users[rowIndex], columnIndex);

    let key = 0;

    return [
      <Column key={key++} name="Display Name" cellRenderer={userRenderer} />,
      <Column key={key++} name="Last Logged In" cellRenderer={userRenderer} />,
      <Column key={key++} name="Actions" cellRenderer={userRenderer} />
    ];
  }

  _buildColumnWidths() {
    return [null, null, 100];
  }

  _buildUsersTable(users: Array<IUser>) {
    const playerTable = (
      <Table
        className="userListTable"
        numRows={users.length}
        columnWidths={this._buildColumnWidths()}
        enableColumnResizing={false}
        enableRowResizing={false}
        selectionModes={[]}
        defaultRowHeight={this._defaultRowHeight}
      >
        {this._generateColumns(users)}
      </Table>
    );

    return playerTable;
  }

  render() {
    const users = this.props.users || [];

    return (
      <div id="UserMgmtPanel" className="actions flex-display flex-column space-elements-vertical">
        <section className="actions flex-display space-elements-horizontal">
          <div className="flex-grow" />
          <Button icon="add" onClick={this.props.createUser}>
            Add User
          </Button>
        </section>

        {this.props.errorDisplay}

        {this._buildUsersTable(users)}
      </div>
    );
  }
}

export default PlayerList;
