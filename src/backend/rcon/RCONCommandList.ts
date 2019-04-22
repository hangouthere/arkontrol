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

    this._client.instance.onDidAuthenticate(this._processCurrentCommand);
    this._client.instance.onDidDisconnect(this._cancelAndStop);
  }

  init = async () => {
    await ConfigParser.init();

    // Used to actually operate on throughout lifecycle
    this._commandList = [...ConfigParser.commands.list];

    if (true === this._client.isAuthenticated) {
      this._processNextCommand();
    }
  }

  _cancelAndStop = () => {
    console.log('cancelling');
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

  _processCurrentCommand = async (): Promise<any> => {
    this._cancelAndStop();

    // We don't have a current command, so get one and process it
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
      // TODO: Potentially remove this
      // if (err.message.includes('Auth lost to server')) {
      //   console.log('------- Auth lost???');
      //   return undefined;
      // }

      // noop cancelled promises, as there's nothing to do
      if (err.message === 'Cancelled Promise') {
        return undefined;
      }

      // Check for timeout
      const wasTimeout = this._client.markPossibleTimeout(err, this._currentCommand.split(' ')[0]);

      // Retry if timed out
      if (wasTimeout) {
        return this._processCurrentCommand();
      }

      Logger.error('[CmdList] Unknown Error:', err);

      return undefined;
    }
  }

  async _execCurrentCommand(currCommand: string): Promise<string> {
    // TODO: Potentially remove this
    // if (false === this._authenticated) {
    //   const msg = 'Auth lost to server';
    //   return Promise.reject(new Error(msg));
    // }

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
