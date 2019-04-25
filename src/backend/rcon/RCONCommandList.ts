import { PromiseDelayCancellable } from '../../commonUtil';
import { IArkCommandEntry } from '../database/models/ArkCommands';
import LoggerConfig from '../util/LoggerConfig';
import MessagingBus, { EventMessages } from '../util/MessagingBus';
import RCONClient, { IRCONHelperInitOptions } from './RCONClient';
import RCONConfig from './RCONConfig';

const Logger = LoggerConfig.instance.getLogger('commands');

export default class RCONCommandList {
  private _config: RCONConfig;
  private _messagingBus: MessagingBus;
  private _client: RCONClient;
  private _commandList!: Array<IArkCommandEntry>;
  private _currentCommand?: IArkCommandEntry;
  private _waitTimeout!: Function | undefined;

  constructor(options: IRCONHelperInitOptions) {
    this._client = options.client;
    this._messagingBus = options.messagingBus;

    this._config = new RCONConfig();

    this._messagingBus.on(EventMessages.RCON.CommandsChange, this._onCommandChange);

    this._client.instance.onDidAuthenticate(this._processCurrentCommand);
    this._client.instance.onDidDisconnect(this._cancelAndStop);
  }

  init = async () => {
    await this._config.initCommands();

    // Used to actually operate on throughout lifecycle
    this._commandList = [...this._config.arkCommands];

    if (true === this._client.isAuthenticated) {
      this._processNextCommand();
    }
  }

  _onCommandChange = () => {
    Logger.info('[CmdList] Change detected, restarting commands...');
    this._cancelAndStop();
    this.init();
  }

  _cancelAndStop = () => {
    if (this._waitTimeout) {
      this._waitTimeout();
      this._waitTimeout = undefined;
    }
  }

  _processNextCommand = async (): Promise<any> => {
    // Start list over when we've reached the end
    if (0 === this._commandList.length) {
      return setTimeout(this.init, 0);
    }

    this._currentCommand = this._commandList.shift();

    return this._processCurrentCommand();
  }

  _processCurrentCommand = async (): Promise<any> => {
    this._cancelAndStop();

    // We don't have a current command, so get one and process it
    if (!this._currentCommand) {
      return this._processNextCommand();
    }

    Logger.info('[CmdList] Exec:', this._currentCommand.command);

    try {
      let result = await this._execCurrentCommand(this._currentCommand.command);
      result = result.replace(/\s?\n\s?$/, ''); // Remove trailing newline

      Logger.info('[CmdList] Result:', result);

      return this._processNextCommand();
    } catch (err) {
      // noop cancelled promises, as there's nothing to do
      if (err.message === 'Cancelled Promise') {
        return undefined;
      }

      // Check for timeout
      const wasTimeout = this._client.markPossibleTimeout(
        err,
        '[CmdList] ' + this._currentCommand.command.split(' ')[0]
      );

      // Retry if timed out
      if (wasTimeout) {
        return this._processCurrentCommand();
      }

      Logger.error('[CmdList] Unknown Error:', err);

      return undefined;
    }
  }

  async _execCurrentCommand(currCommand: string): Promise<string> {
    if (0 === currCommand.indexOf('wait')) {
      return this._waitCommand(currCommand);
    }

    const response = await this._client.instance.send(currCommand);

    return response;
  }

  async _waitCommand(waitCommand: string) {
    const [, delayStr] = waitCommand.split(' ');
    const delay = parseInt(delayStr) || 1000;

    const [delayPromise, cancel] = PromiseDelayCancellable(delay * 1000);

    this._waitTimeout = cancel as Function;
    await delayPromise;
    this._waitTimeout = undefined;

    return 'Wait Completed';
  }
}
