import LoggerConfig from '../util/LoggerConfig';
import { EventMessages } from '../util/MessagingBus';
import RCONCommandList from './RCONCommandList';
import { IRCONHelperInitOptions } from './RCONManager';

const Logger = LoggerConfig.instance.getLogger('commands');

export default class RCONCommandScheduler extends RCONCommandList {
  constructor(private _options: IRCONHelperInitOptions) {
    super(_options.client);

    Logger.info(`[RCONCmdList] Resuming Command #${_options.config.appState.currentCommandIndex}`);
  }

  async init() {
    this._options.messagingBus.on(EventMessages.RCON.CommandsChange, this._onUserChangeCommands);
    this._options.messagingBus.on(EventMessages.RCON.ConnectionChange, this._onConnectionChange);

    this._enabled = this._options.client.serverIsAccessible;

    this.commandList = [...this._options.config.arkCommands];
  }

  _onConnectionChange = (isUp: boolean) => {
    return isUp ? this._startCommands() : this._stopCommands();
  }

  async _startCommands() {
    Logger.info('[RCONCmdList] Starting Scheduler Command List...');
    super._startCommands();
  }

  _stopCommands() {
    Logger.info('[RCONCmdList] Stopping Scheduler Command List...');
    super._stopCommands();
  }

  _onUserChangeCommands = async () => {
    Logger.info('[RCONCmdList] Change detected, restarting commands...');

    await this._options.config.reload();

    this.commandList = [...this._options.config.arkCommands];
  }

  _loadCommands() {
    const lastKnownIndex = this._options.config.appState.currentCommandIndex;

    super._loadCommands(lastKnownIndex);
  }

  async _restartCommands() {
    await super._restartCommands();

    // Restart the Command Index
    await this._options.config.saveCommandIndex(0);

    // Reload config for ensuring commands are up to date
    await this._options.config.reload();
  }

  async _processCurrentCommand(): Promise<any> {
    await super._processCurrentCommand();
    await this._options.config.saveCommandIndex(this._currentCommandIndex);
  }

  async _execCurrentCommand(currCommand: string): Promise<string> {
    Logger.info(`[RCONCmdList] Exec: ${currCommand}`);

    if (0 === currCommand.indexOf('wait')) {
      await this._waitCommand(currCommand);
      return 'Wait Completed';
    }

    return await this._client.execCommand(currCommand, {
      skipRetry: true
    });
  }
}
