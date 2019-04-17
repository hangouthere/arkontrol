import { PromiseDelayCancellable } from '../../commonUtil';
import ConfigParser from '../util/ConfigParser';
import LoggerConfig from '../util/LoggerConfig';
import RCONClient from './RCONClient';

const Logger = LoggerConfig.instance.getLogger('commands');

export default class RCONCommandList {
  private _client: RCONClient;
  private _commandList!: Array<string>;
  private _currentCommand: string = '';
  private _waitTimeout!: Function | undefined;

  constructor(client: RCONClient) {
    this._client = client;
  }

  init = async () => {
    await ConfigParser.init();

    // Used to actually operate on throughout lifecycle
    this._commandList = [...ConfigParser.commands.list];

    this._client.instance.onDidConnect(this._processCurrentCommand);
    this._client.instance.onDidDisconnect(this._cancelAndStop);

    if (true === this._client.instance.authenticated) {
      this._processNextCommand();
    }
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

    this._currentCommand = this._commandList.shift() as string;

    return this._processCurrentCommand();
  }

  _processCurrentCommand = async () => {
    if (!this._currentCommand) {
      return this._processNextCommand();
    }

    Logger.info('[CmdList] Exec:', this._currentCommand);

    try {
      let result = await this._execCurrentCommand(this._currentCommand);
      result = result.replace(/\s?\n\s?$/, ''); // Remove trailing newline

      Logger.info('[CmdList] Result:', result);

      return this._processNextCommand();
    } catch (err) {
      if (err.message.includes('Auth lost to server')) {
        return this._client.connect();
      }

      // Check for timeout
      const wasTimeout = this._client.markPossibleTimeout(err, this._currentCommand.split(' ')[0]);

      if (wasTimeout) {
        this._processCurrentCommand();
      } else {
        Logger.error('[CmdList] Unknown Error:', err);
      }
    }
  }

  async _execCurrentCommand(currCommand: string): Promise<string> {
    if (false === this._client.instance.authenticated) {
      const msg = '[CmdList] Auth lost to server';
      Logger.error(msg);
      return Promise.reject(new Error(msg));
    }

    if (0 === currCommand.indexOf('wait')) {
      const [, delayStr] = currCommand.split(' ');
      const delay = parseInt(delayStr) || 1000;

      const [delayPromise, cancel] = PromiseDelayCancellable(delay * 1000);

      this._waitTimeout = cancel as Function;
      await delayPromise;
      this._waitTimeout = undefined;

      return 'Wait Completed';
    }

    const response = await this._client.instance.send(currCommand);

    return response;
  }
}
