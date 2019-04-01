import ConfigParser from '../util/ConfigParser';
import LoggerConfig from '../util/LoggerConfig';
import RCONClient from './RCONClient';

const Logger = LoggerConfig.instance.getLogger('commands');

const PromiseDelay = (t: number) => new Promise(r => setTimeout(r, t));

export default class RCONCommandList {
  private _client: RCONClient;
  private _commandList!: Array<string>;

  constructor(client: RCONClient) {
    this._client = client;

    this.init();
  }

  async init() {
    await ConfigParser.init();

    // Used to actually operate on throughout lifecycle
    this._commandList = [...ConfigParser.commands.list];

    this._client.instance.onDidConnect(this._processCurrentCommand);

    this._processCurrentCommand();
  }

  _processCurrentCommand = async (): Promise<any> => {
    // Start list over when we've reached the end
    if (0 === this._commandList.length) {
      return setTimeout(this.init.bind(this), 0);
    }

    const currCommand = this._commandList.shift() as string;

    Logger.info('RCON executing command:', currCommand);

    let result = await this._execCurrentCommand(currCommand);
    result = result.replace(/\s?\n\s?$/, ''); // Remove trailing newline

    Logger.info('RCON Result:', result);

    return this._processCurrentCommand();
  }

  async _execCurrentCommand(currCommand: string) {
    let promise: Promise<any> = Promise.resolve();

    if (false === this._client.instance.authenticated) {
      return Logger.error('Auth lost to server');
    }

    if ('wait ' === currCommand.substr(0, 5)) {
      const [, delayStr] = currCommand.split(' ');
      const delay = parseInt(delayStr) || 1000;

      promise = promise.then(() => PromiseDelay(delay * 1000));
    }

    promise = promise.then(() => this._client.instance.send(currCommand));

    return promise;
  }
}
