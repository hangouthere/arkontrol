import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import LogViewer from '../../components/admin/LogViewer';
import { LogActions } from '../../store/actions/log';
import { IRootState } from '../../store/reducers';
import { ILogState, ILogData } from '../../store/reducers/log';

interface IProps {
  logInfo: ILogState;
  getLogData: typeof LogActions.getLogData;
}

interface IState {
  logType: string;
}

export interface ILogViewData {
  day: string;
  data: Array<ILogData>;
}

export interface ILogView {
  loading: boolean;
  error?: Error;
  logData: Array<ILogViewData>;
}

class LogPage extends React.PureComponent<IProps, IState> {
  state = {
    logType: 'chat'
  };

  componentDidMount() {
    this.loadLogData();
  }

  changeLogType = (logType: string) => {
    this.setState(
      {
        logType
      },
      this.loadLogData
    );
  }

  loadLogData = () => {
    this.props.getLogData(this.state.logType);
  }

  logData = (): ILogView => {
    const { logInfo } = this.props;
    const logViewOut: Array<ILogViewData> = [];

    if (logInfo.logData) {
      const logViewMap = {};
      logInfo.logData = logInfo.logData.reverse();

      logInfo.logData.forEach(logData => {
        const ts = new Date(logData.timestamp);
        const day = ts.toLocaleDateString();

        if (false === logViewMap.hasOwnProperty(day)) {
          logViewMap[day] = { day, data: [] };
          logViewOut.push(logViewMap[day]);
        }

        logViewMap[day].data.push(logData);
      });
    }

    return {
      loading: logInfo.loading,
      error: logInfo.error,
      logData: logViewOut
    };
  }

  render() {
    return (
      <div id="LogPage" className="flex-display flex-column space-elements-vertical">
        <h1>Log Page</h1>

        <LogViewer
          logType={this.state.logType}
          changeLogType={this.changeLogType}
          refreshLogData={this.loadLogData}
          logInfo={this.logData()}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  logInfo: state.Log
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getLogData: (logType?: string) => dispatch(LogActions.getLogData(logType))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogPage);
