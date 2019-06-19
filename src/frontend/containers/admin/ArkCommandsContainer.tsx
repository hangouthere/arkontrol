import { Spinner } from '@blueprintjs/core';
import arrayMove from 'array-move';
import React from 'react';
import { connect } from 'react-redux';
import { SortEnd } from 'react-sortable-hoc';
import { Dispatch } from 'redux';
import ArkCommandsPanel from '../../components/admin/ArkCommandsPanel';
import { ArkCommandsActions } from '../../store/actions/arkCommands';
import { IRootState } from '../../store/reducers';
import { IArkCommandEntry, IArkCommandsState } from '../../store/reducers/arkCommands';

interface IProps {
  commandData: IArkCommandsState;
  getCommands: typeof ArkCommandsActions.getCommands;
  saveCommands: typeof ArkCommandsActions.saveCommands;
}

interface IState {
  hasChange: boolean;
  list: Array<IArkCommandEntry>;
}

class AuthConfigContainer extends React.PureComponent<IProps, IState> {
  componentDidMount() {
    this._loadData();
  }

  async _loadData() {
    const { value: list } = await this.props.getCommands();

    this.setState({
      list: [...list]
    });
  }

  onSortChange = ({ oldIndex, newIndex }: SortEnd) => {
    this.setState(({ list }) => {
      const newList = arrayMove(list, oldIndex, newIndex);

      newList.forEach((entry, index) => {
        entry.order = index + 1;
      });

      return {
        hasChange: true,
        list: newList
      };
    });
  }

  addCommand = (type: string = 'command') => {
    const cmd = type === 'wait' ? 'wait 30' : '';

    this.setState(({ list }) => ({
      hasChange: true,
      list: [...list, { order: list.length + 1, command: cmd }]
    }));
  }

  updateCommand = (index: number) => {
    return (val: string) => {
      this.setState(({ list }) => {
        const newList = [...list];

        newList[index].command = val;

        return {
          hasChange: true,
          list: newList
        };
      });
    };
  }

  removeCommand = (index: number) => {
    return () => {
      this.setState(({ list }) => {
        const newList = [...list.slice(0, index), ...list.slice(index + 1)];

        newList.forEach((entry, index) => {
          entry.order = index + 1;
        });

        return {
          hasChange: true,
          list: newList
        };
      });
    };
  }

  saveCommandList = async () => {
    await this.props.saveCommands(this.state.list);

    this.setState({ hasChange: false });
  }

  render() {
    const hasConfig = !!this.props.commandData.list && false === this.props.commandData.loading;

    if (false === hasConfig) {
      return <Spinner />;
    }

    const list = (this.state && this.state.list) || this.props.commandData.list;

    list.sort((a, b) => (a.order > b.order ? 1 : -1));

    return (
      <ArkCommandsPanel
        hasChange={(this.state && this.state.hasChange) || false}
        list={list}
        addCommand={this.addCommand}
        updateCommand={this.updateCommand}
        removeCommand={this.removeCommand}
        saveCommandList={this.saveCommandList}
        onSortChange={this.onSortChange}
      />
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  commandData: state.ArkCommands
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getCommands: () => dispatch(ArkCommandsActions.getCommands()),
  saveCommands: (config?: Array<IArkCommandEntry>) => dispatch(ArkCommandsActions.saveCommands(config))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthConfigContainer);
