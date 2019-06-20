import { EventEmitter } from 'events';
import { PromiseDelayCancellable } from '../../commonUtil';
import { IArkCommandEntry } from '../database/models/ArkCommands';
import { EventMessages } from '../util/MessagingBus';
import RCONClient from './RCONClient';

type CommandList = Array<IArkCommandEntry>;

export default class RCONCommandList extends EventEmitter {
  protected _client: RCONClient;
  protected _waitTimeout!: Function | undefined;
  protected _commandList: CommandList = [];
  protected _currentCommandIndex = 0;
  protected _enabled = true;

  private get _reachedMaxCommands() {
    return this._currentCommandIndex >= this._commandList.length;
  }

  set commandList(list: CommandList) {
    this._commandList = list;

    if (this._enabled) {
      this._onCommandChange();
    }
  }

  constructor(client: RCONClient) {
    super();

    this._client = client;
  }

  async init() {
    return this._startCommands();
  }

  stop() {
    this._enabled = false;
    this._stopCommands();
  }

  async _startCommands() {
    this._loadCommands();
  }

  _stopCommands() {
    this._cancelAndStop();
  }

  async _onCommandChange() {
    this._stopCommands();
    await this._restartCommands();
    this._startCommands();
  }

  _loadCommands(idx?: number) {
    this._currentCommandIndex = idx || 0;

    // Only process if we have commands to begin with
    if (0 < this._commandList.length) {
      this._processNextCommand();
    }
  }

  async _restartCommands() {
    // Restart the Command Index
    this._currentCommandIndex = 0;
  }

  _cancelAndStop = () => {
    if (this._waitTimeout) {
      this._waitTimeout();
      this._waitTimeout = undefined;
    }
  }

  _processNextCommand = async () => {
    if (false === this._enabled) {
      return undefined;
    }

    // Start list over when we've reached the end
    if (true === this._reachedMaxCommands) {
      await this._restartCommands();

      // Use setTimeout to avoid max call stack issues over time
      setTimeout(() => {
        this._loadCommands();
        this.emit(EventMessages.RCON.CommandsEnd);
      }, 0);

      return undefined;
    }

    return this._processCurrentCommand();
  }

  async _processCurrentCommand(): Promise<any> {
    const currCommand = this._commandList[this._currentCommandIndex];

    this._cancelAndStop();

    try {
      await this._execCurrentCommand(currCommand.command);
    } catch (err) {
      if (true === err.message.includes('Cancelled Promise')) {
        return undefined;
      }

      throw err;
    }

    this._currentCommandIndex++;

    return this._processNextCommand();
  }

  async _execCurrentCommand(currCommand: string): Promise<string> {
    if (0 === currCommand.indexOf('wait')) {
      await this._waitCommand(currCommand);
      return 'Wait Completed';
    }

    return await this._client.execCommand(currCommand, {
      skipLogging: true,
      skipRetry: true
    });
  }

  async _waitCommand(waitCommand: string) {
    const [, delayStr] = waitCommand.split(' ');
    const delay = Number(delayStr) || 1000;

    const [delayPromise, cancel] = PromiseDelayCancellable(delay * 1000);

    this._waitTimeout = cancel as Function;
    await delayPromise;
    this._cancelAndStop();
  }
}
