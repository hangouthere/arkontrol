import { Button, FormGroup, Icon, InputGroup, Intent, NumericInput, Tooltip } from '@blueprintjs/core';
import React from 'react';
import { IAuthConfig, IAuthConfigEntry, IAuthConfigUpdateEntry } from '../../store/reducers/authConfig';

interface IProps {
  config: IAuthConfig;
  isLoading: boolean;
  hasChange: boolean;
  shouldReconnect: boolean;
  saveConfig: React.MouseEventHandler;
  changeConfigPart: (entry: IAuthConfigUpdateEntry) => void;
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
        // Cleanup because NumericInput uses value ONLY,
        // and defaultValue is passed on causing dual-use errors
        delete extendedProps['defaultValue'];
        (extendedProps as any).value = inputProps.defaultValue;
        return <NumericInput min={1} onValueChange={this._onChangeNumericInput(inputProps.id)} {...extendedProps} />;
      case 'password':
        (extendedProps as any).rightElement = this._buildLockButton(inputProps.id);
        type = this.state.showPassword[inputProps.id] ? 'text' : type;
      default:
        return <InputGroup type={type} {...extendedProps} />;
    }
  }

  _createFormGroup(id: string, label: string, inputType: string = 'text', extraClasses = '') {
    let loadingState: Intent = 'none';

    const authConfigEntry: IAuthConfigEntry = this.props.config[id];

    const inputComponent = this._createInputType(inputType, {
      id,
      defaultValue: authConfigEntry.propValue,
      intent: loadingState
    });

    return (
      <FormGroup
        label={label}
        labelFor={id}
        labelInfo={this._buildDescriptionToolTip(authConfigEntry.propDesc)}
        className={extraClasses}
      >
        {inputComponent}
      </FormGroup>
    );
  }

  _onChangeForm = (event: React.ChangeEvent<HTMLFormElement>) => {
    this.props.changeConfigPart({ propName: event.target.name, propValue: event.target.value });
  };

  _onChangeNumericInput = (propName: string) => (val: number) =>
    this.props.changeConfigPart({ propName, propValue: val });

  render() {
    return (
      <div id="AuthConfigPanel">
        <form className="configForm" onChange={this._onChangeForm}>
          <div className="flex-display space-elements-horizontal">
            {this._createFormGroup('host', 'Host', undefined, 'flex-grow')}
            {this._createFormGroup('port', 'Port', 'number', 'smallNumberInput')}
          </div>

          <div className="flex-display space-elements-horizontal">
            {this._createFormGroup('password', 'RCON Password', 'password', 'flex-grow')}
          </div>

          {this._createFormGroup('discordAdminName', 'Discord Admin Name')}
          {this._createFormGroup('discordWebhookURL', 'Discord WebHook URL')}

          <div className="flex-display">
            <Button
              text="Save"
              icon="floppy-disk"
              onClick={this.props.saveConfig}
              disabled={!this.props.hasChange || this.props.isLoading}
              intent={this.props.hasChange ? 'warning' : 'success'}
            />
            <div className="flex-grow" />
            <Button
              text="Reconnect ArKontrol"
              icon="refresh"
              onClick={this.props.sysCommand.bind(null, 'reconnect')}
              intent={!this.props.hasChange && this.props.shouldReconnect ? 'warning' : 'none'}
              disabled={this.props.hasChange || !this.props.shouldReconnect || this.props.isLoading}
            />
          </div>
        </form>
      </div>
    );
  }
}

export default AuthConfigPanel;
