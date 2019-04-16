import { FormGroup, Icon, InputGroup, Tooltip, Intent } from '@blueprintjs/core';
import React from 'react';
import { IAuthConfig, IAuthConfigTuple, ILoadingParts } from '../../store/reducers/authConfig';

const SHOW_UPDATED_DURATION = 3000;

interface IProps {
  config: IAuthConfig;
  loadingParts: ILoadingParts;
  updateLoadingPart: (part: string, value?: string) => void;
  changeConfigPart: (event: React.ChangeEvent<HTMLFormElement>) => void;
}

class AuthConfigPanel extends React.PureComponent<IProps> {
  _buildDescriptionToolTip(content: string) {
    const html = <div dangerouslySetInnerHTML={{ __html: content }} />;

    return (
      <Tooltip content={html} position="top">
        <Icon icon="info-sign" iconSize={12} />
      </Tooltip>
    );
  }

  _createFormGroup(id: string, label: string, inputType: string = 'text', extraClasses = '') {
    let loadingState: Intent = 'none';

    const authConfigTuple: IAuthConfigTuple = this.props.config[id];

    if (this.props.loadingParts[id]) {
      const loadingVal = this.props.loadingParts[id].split('|');

      if ('changing' === loadingVal[0]) {
        loadingState = 'warning';
      } else if ('completed' === loadingVal[0]) {
        loadingState = 'success';
      }
    }

    // Detected a success, which will color the field,
    // but we want to clear it later to update UI
    if ('success' === loadingState) {
      setTimeout(() => {
        this.props.updateLoadingPart(id, undefined);
      }, SHOW_UPDATED_DURATION);
    }

    return (
      <FormGroup
        label={label}
        labelFor={id}
        labelInfo={this._buildDescriptionToolTip(authConfigTuple.desc)}
        className={extraClasses}
      >
        <InputGroup
          id={id}
          name={id}
          defaultValue={authConfigTuple.value}
          type={inputType}
          intent={loadingState}
          autoComplete="off"
        />
      </FormGroup>
    );
  }

  render() {
    return (
      <form className="configForm" onChange={this.props.changeConfigPart}>
        <div className="flex-display space-elements-horizontal">
          {this._createFormGroup('host', 'Host', undefined, 'flex-grow')}
          {this._createFormGroup('port', 'Port', 'number', 'portInput')}
        </div>

        {this._createFormGroup('password', 'RCON Password', 'password')}

        <div className="flex-display space-elements-horizontal">
          {this._createFormGroup('maxConnectionAttempts', 'Max Connection Attempts', 'number', 'flex-grow')}
          {this._createFormGroup('maxPacketTimeouts', 'Max Packet Timeouts', 'number', 'flex-grow')}
        </div>

        {this._createFormGroup('discordAdminName', 'Discord Admin Name')}
        {this._createFormGroup('discordWebhookURL', 'Discord WebHook URL')}
      </form>
    );
  }
}

export default AuthConfigPanel;
