import { Button, HTMLSelect, Icon, Intent, NonIdealState, Spinner, Collapse } from '@blueprintjs/core';
import React from 'react';
import { ILogView, ILogViewData } from '../../containers/admin/LogPage';

interface IProps {
  logType: string;
  changeLogType: (logType: string) => void;
  refreshLogData: () => void;
  logInfo: ILogView;
}

interface IState {
  openState: {
    [day: string]: boolean;
  };
}

const IconMap = {
  INFO: 'info-sign',
  WARN: 'warning-sign',
  ERROR: 'error'
};

const IntentMap = {
  INFO: Intent.NONE,
  WARN: Intent.WARNING,
  ERROR: Intent.DANGER
};

const NoLogDataFound: React.FC = () => <NonIdealState title="No Log Data Found" icon="zoom-out" />;

class LogViewer extends React.PureComponent<IProps, IState> {
  state = {
    openState: {}
  };

  componentDidUpdate(prevProps: IProps) {
    // If we go from undefined -> defined, auto open the first entry
    if (0 === prevProps.logInfo.logData.length && 0 < this.props.logInfo.logData.length) {
      this.setState({
        openState: {
          [this.props.logInfo.logData[0].day]: true
        }
      });
    }
  }

  _onClickDayHeader(day: string) {
    return () => {
      this.setState(state => {
        const val = state.openState.hasOwnProperty(day) ? !state.openState[day] : true;

        return {
          openState: {
            ...state.openState,
            [day]: val
          }
        };
      });
    };
  }

  _buildLogEntries(logData: Array<ILogViewData>) {
    return logData.map(dayData => {
      const dayEntries = dayData.data.map((entry, idx) => (
        <div key={idx} className={`logLevel-${entry.logLevel} flex-display space-elements-horizontal`}>
          <Icon icon={IconMap[entry.logLevel]} intent={IntentMap[entry.logLevel]} />
          <div className="timestamp">{new Date(entry.timestamp).toLocaleTimeString()}</div>
          <div className="data" dangerouslySetInnerHTML={{ __html: entry.data.replace(/\n/g, '<br />') }} />
        </div>
      ));

      return (
        <div key={dayData.day} className="dayContainer">
          <div className="dayHeader" onClick={this._onClickDayHeader(dayData.day)}>
            {dayData.day}
          </div>
          <Collapse isOpen={this.state.openState[dayData.day]}>{dayEntries}</Collapse>
        </div>
      );
    });
  }

  _buildLogDisplay() {
    const hasLogData = this.props.logInfo.logData && 0 < this.props.logInfo.logData.length;

    const LogDisplay = this.props.logInfo.loading ? (
      <Spinner size={75} />
    ) : hasLogData ? (
      this._buildLogEntries(this.props.logInfo.logData || [])
    ) : (
      <NoLogDataFound />
    );

    return LogDisplay;
  }

  _onChangeLogType = (event: React.FormEvent<HTMLSelectElement>) => {
    this.props.changeLogType(event.currentTarget.value);
    this.setState({
      openState: {}
    });
  }

  render() {
    return (
      <React.Fragment>
        <div className="actions">
          <form className="flex-display flex-align space-elements-horizontal">
            <div className="logType flex-grow">{this.props.logType}</div>

            <HTMLSelect name="logType" onChange={this._onChangeLogType} defaultValue={this.props.logType}>
              <option value="chat">Chat</option>
              <option value="commands">Commands</option>
              <option value="presence">Presence</option>
              <option value="server">Server</option>
            </HTMLSelect>

            <Button icon="refresh" onClick={this.props.refreshLogData} />
          </form>
        </div>

        <div className="logData">{this._buildLogDisplay()}</div>
      </React.Fragment>
    );
  }
}

export default LogViewer;
