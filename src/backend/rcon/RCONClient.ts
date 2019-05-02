import Rcon from 'rcon-ts';
import LoggerConfig from '../util/LoggerConfig';
import { EventMessages } from '../util/MessagingBus';
import { IRCONHelperInitOptions } from './RCONManager';

const Logger = {
  debug: LoggerConfig.instance.getLogger(),
  commands: LoggerConfig.instance.getLogger('commands'),
  server: LoggerConfig.instance.getLogger('server'),
  presence: LoggerConfig.instance.getLogger('presence')
};

export interface IRCONExecOptions {
  skipLogging?: boolean;
  skipRetry?: boolean;
}

export default class RCONClient {
  private _serverIsAccessible!: boolean;
  private _hasErrorState: boolean = false;

  get serverIsAccessible() {
    return this._serverIsAccessible;
  }

  get statusLabel() {
    return this._serverIsAccessible ? 'Online' : 'Offline';
  }

  constructor(private _options: IRCONHelperInitOptions) {}

  private async _markServerStatus(isUp: boolean) {
    this._options.messagingBus.emit(EventMessages.RCON.SetStatus, isUp);

    // Server status hasn't changed, break out!
    if (isUp === this._serverIsAccessible) {
      return undefined;
    }

    this._serverIsAccessible = isUp;
    this._options.config.saveServerStatus(isUp);

    this._options.messagingBus.emit(EventMessages.RCON.ConnectionChange, isUp);

    return undefined;
  }

  async init() {
    await this._options.config.reload();

    this._serverIsAccessible = '1' === this._options.config.appState.serverIsAccessible;

    // Run simple test to see if server is accessible
    await this._testConnect();
  }

  private _evaluateError = async (err: any, options: IRCONExecOptions = {}, cmd?: string) => {
    // TODO: See if this is the right thing to do....
    // It might be skipping errors completley somehow?
    if (true === this._hasErrorState) {
      return true;
    }

    this._hasErrorState = true;

    const badEndpoint =
      !!err.innerException &&
      (err.innerException.message.includes('getaddrinfo ENOTFOUND') ||
        err.innerException.message.includes('connect ECONNREFUSED') ||
        err.innerException.message.includes('connect ETIMEDOUT'));

    if (true === badEndpoint && true === this.serverIsAccessible) {
      Logger.server.error('[RCON] Connection has failed, this may be due to a server crash.');

      this._markServerStatus(false);

      return true;
    }

    if (true === badEndpoint) {
      Logger.server.error(
        '[RCON] Error while connecting, could not connect to specified host/port combination.\n' +
          'Please ensure:\n' +
          '\t1) The server is up\n' +
          '\t2) You have RCON enabled on the server\n' +
          '\t3) The Auth Config is set correctly.'
      );

      this._markServerStatus(false);

      return true;
    }

    if (!!err.innerException && 'Authentication failed.' === err.innerException.message) {
      Logger.server.error('[RCON] Supplied Password is invalid, please check your configuration!');

      this._markServerStatus(false);

      return true;
    }

    if (err.message.includes('read ECONNRESET')) {
      Logger.server.error('[RCON] Server Reset the connection!');

      this._markServerStatus(false);

      return true;
    }

    const reqTimedOut =
      true === err.message.includes('Request timed out') ||
      true === err.innerException.message.includes('Request timed out');

    if (reqTimedOut) {
      if (!!cmd) {
        if (true === options.skipRetry) {
          Logger.server.warn(`[RCON] Command timed out, skipping re-attempt: ${cmd}`);
        } else {
          Logger.server.warn(`[RCON] Command timed out, re-attempting: ${cmd}`);

          this.execCommand(cmd, options);
        }
      } else {
        Logger.server.warn(`[RCON] Unknown Command timed out`);
      }

      return true;
    }

    Logger.debug.error('[RCON] !!!! Unknown error: ', err);

    return false;
  }

  private async _testConnect() {
    try {
      const instance = new Rcon(this._options.config.connectData);

      // Send a bogus command to test connection
      await instance.session(async c => await c.send('ping'));

      this._markServerStatus(true);
    } catch (err) {
      this._evaluateError(err, { skipRetry: true }, 'Test Connection');
    }
  }

  async execCommand(cmd: string, options: IRCONExecOptions = {}) {
    const opts = {
      skipLogging: false,
      skipRetry: false,
      ...options
    };

    process.off('uncaughtException', this._evaluateError);
    process.once('uncaughtException', this._evaluateError);

    try {
      // Certain circumstances we don't want logging
      // (ie, Status/Ping checks)
      if (false === opts.skipLogging) {
        Logger.commands.info(`[RCON]: Exec ${cmd}`);
      }

      const instance = new Rcon(this._options.config.connectData);
      const response = await instance.session(async c => await c.send(cmd));

      this._hasErrorState = false;

      return response;
    } catch (err) {
      const handled = await this._evaluateError(err, options, cmd);

      if (false === handled) {
        throw err;
      }

      return 'err';
    }
  }
}

process.on('unhandledRejection', (error: any) => {
  Logger.debug.error('----> unhandledRejection\n', error);
});

process.on('uncaughtException', (err: any) => {
  const knownError =
    err.message.includes('getaddrinfo ENOTFOUND') ||
    err.message.includes('connect ECONNREFUSED') ||
    err.message.includes('connect ETIMEDOUT') ||
    err.message.includes('read ECONNRESET');

  if (knownError) {
    return;
  }

  Logger.debug.error('----> uncaughtException\n', err);
  throw err;
});
