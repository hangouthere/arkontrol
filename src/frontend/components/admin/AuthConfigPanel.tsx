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

const AuthConfigPanel: React.FC<IProps> = props => {
  const _buildDescriptionToolTip = (content: string) => {
    const html = <div dangerouslySetInnerHTML={{ __html: content }} />;

    return (
      <Tooltip content={html} position="top">
        <Icon icon="info-sign" iconSize={12} />
      </Tooltip>
    );
  };

  const _createFormGroup = (id: string, label: string, inputType: string = 'text', extraClasses = '') => {
    let loadingState: Intent = 'none';

    const authConfigTuple: IAuthConfigTuple = props.config[id];
    const loadingVal = props.loadingParts[id];

    if ('number' === typeof loadingVal) {
      loadingState = 'warning';
    } else if ('completed' === loadingVal) {
      loadingState = 'success';
    }

    // Detected a success, which will color the field,
    // but we want to clear it later to update UI
    if ('success' === loadingState) {
      setTimeout(() => {
        props.updateLoadingPart(id, undefined);
      }, SHOW_UPDATED_DURATION);
    }

    return (
      <FormGroup
        label={label}
        labelFor={id}
        labelInfo={_buildDescriptionToolTip(authConfigTuple.desc)}
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
  };

  return (
    <form className="configForm" onChange={props.changeConfigPart}>
      <div className="flex-display space-elements-horizontal">
        {_createFormGroup('host', 'Host', undefined, 'flex-grow')}
        {_createFormGroup('port', 'Port', 'number', 'portInput')}
      </div>

      {_createFormGroup('password', 'RCON Password', 'password')}

      <div className="flex-display space-elements-horizontal">
        {_createFormGroup('maxConnectionAttempts', 'Max Connection Attempts', 'number', 'flex-grow')}
        {_createFormGroup('maxPacketTimeouts', 'Max Packet Timeouts', 'number', 'flex-grow')}
      </div>

      {_createFormGroup('discordAdminName', 'Discord Admin Name')}
      {_createFormGroup('discordWebhookURL', 'Discord WebHook URL')}
    </form>
  );
};

export default AuthConfigPanel;
