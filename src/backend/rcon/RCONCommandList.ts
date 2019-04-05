import ConfigParser from '../util/ConfigParser';
import LoggerConfig from '../util/LoggerConfig';
import RCONClient from './RCONClient';

const Logger = LoggerConfig.instance.getLogger('commands');

const PromiseDelay = (t: number) => new Promise(r => setTimeout(r, t));

export default class RCONCommandList {
  private _client: RCONClient;
  private _commandList!: Array<string>;
  private _currentCommand!: string;

  constructor(client: RCONClient) {
    this._client = client;
  }

  init = async () => {
    await ConfigParser.init();

    // Used to actually operate on throughout lifecycle
    this._commandList = [...ConfigParser.commands.list];

    this._client.instance.onDidConnect(this._processCurrentCommand);

    this._processNextCommand();
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
    Logger.info('RCON executing command:', this._currentCommand);

    try {
      let result = await this._execCurrentCommand(this._currentCommand);
      result = result.replace(/\s?\n\s?$/, ''); // Remove trailing newline

      Logger.info('RCON Result:', result);

      return this._processNextCommand();
    } catch (err) {
      if ('Auth lost to server' === err) {
        return this._client.connect();
      }

      // Check for timeout
      const wasTimeout = this._client.markPossibleTimeout(err, this._currentCommand.split(' ')[0]);

      if (wasTimeout) {
        this._processCurrentCommand();
      } else {
        Logger.error('Unknown Error:', err);
      }
    }
  }

  async _execCurrentCommand(currCommand: string): Promise<string> {
    if (false === this._client.instance.authenticated) {
      const msg = 'Auth lost to server';
      Logger.error(msg);
      return Promise.reject(msg);
    }

    if (0 === currCommand.indexOf('wait')) {
      const [, delayStr] = currCommand.split(' ');
      const delay = parseInt(delayStr) || 1000;

      await PromiseDelay(delay * 1000);
    }

    const response = await this._client.instance.send(currCommand);

    return response;
  }
}
