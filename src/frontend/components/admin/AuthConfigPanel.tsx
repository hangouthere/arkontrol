import { Button, FormGroup, Icon, InputGroup, Intent, NumericInput, Tooltip } from '@blueprintjs/core';
import React from 'react';
import { IAuthConfig, IAuthConfigTuple, ILoadingParts } from '../../store/reducers/authConfig';

const SHOW_UPDATED_DURATION = 3000;

interface IProps {
  config: IAuthConfig;
  loadingParts: ILoadingParts;
  updateLoadingPart: (part: string, value?: string) => void;
  changeConfigPart: (event: React.ChangeEvent<HTMLFormElement>) => void;
  sysCommand: (cmd: string) => void;
}

interface IState {
  showPassword: { [id: string]: boolean };
}

class AuthConfigPanel extends React.PureComponent<IProps, IState> {
  private _tabIndex = 0;

  state = { showPassword: {} };

  _buildDescriptionToolTip(content: string) {
    const html = <div dangerouslySetInnerHTML={{ __html: content }} />;

    return (
      <Tooltip content={html} position="top">
        <Icon icon="info-sign" iconSize={12} />
      </Tooltip>
    );
  }

  _handleLockClick(id: string) {
    return () => {
      this.setState({
        ...this.state,
        showPassword: {
          ...this.state.showPassword,
          [id]: this.state.showPassword[id] ? false : true
        }
      });
    };
  }

  _buildLockButton(id: string) {
    const showPassword = this.state.showPassword[id];

    return (
      <Button
        icon={showPassword ? 'unlock' : 'lock'}
        intent={Intent.WARNING}
        minimal={true}
        onClick={this._handleLockClick(id)}
      />
    );
  }

  _createInputType(type: string, inputProps: { id: string; defaultValue: string; intent: Intent }) {
    const extendedProps = {
      ...inputProps,
      name: inputProps.id,
      tabIndex: ++this._tabIndex,
      autoComplete: 'off',
      fill: true
    };

    switch (type) {
      case 'number':
        delete extendedProps['defaultValue'];
        (extendedProps as any).value = inputProps.defaultValue;
        return <NumericInput min={1} {...extendedProps} />;
      case 'password':
        (extendedProps as any).rightElement = this._buildLockButton(inputProps.id);
        type = this.state.showPassword[inputProps.id] ? 'text' : type;
      default:
        return <InputGroup type={type} {...extendedProps} />;
    }
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

    const inputComponent = this._createInputType(inputType, {
      id,
      defaultValue: authConfigTuple.value,
      intent: loadingState
    });

    return (
      <FormGroup
        label={label}
        labelFor={id}
        labelInfo={this._buildDescriptionToolTip(authConfigTuple.desc)}
        className={extraClasses}
      >
        {inputComponent}
      </FormGroup>
    );
  }

  render() {
    return (
      <form className="configForm" onChange={this.props.changeConfigPart}>
        <div className="flex-display space-elements-horizontal">
          {this._createFormGroup('host', 'Host', undefined, 'flex-grow')}
          {this._createFormGroup('port', 'Port', 'number', 'smallNumberInput')}
        </div>

        <div className="flex-display space-elements-horizontal">
          {this._createFormGroup('password', 'RCON Password', 'password', 'flex-grow')}
          {this._createFormGroup('maxConnectionAttempts', 'Max Conn', 'number', 'smallNumberInput')}
          {this._createFormGroup('maxPacketTimeouts', 'Max TTF', 'number', 'smallNumberInput')}
        </div>

        {this._createFormGroup('discordAdminName', 'Discord Admin Name')}
        {this._createFormGroup('discordWebhookURL', 'Discord WebHook URL')}

        <div className="flex-display flex-center">
          <Button
            text="Reconnect ArKontrol"
            icon="refresh"
            alignText="left"
            onClick={this.props.sysCommand.bind(null, 'reconnect')}
          />
        </div>
      </form>
    );
  }
}

export default AuthConfigPanel;
