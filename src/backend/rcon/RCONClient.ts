import Rcon from 'rcon-ts';
import LoggerConfig from '../util/LoggerConfig';
import { EventMessages } from '../util/MessagingBus';
import { IRCONHelperInitOptions } from './RCONManager';

const RECONNECT_TIMEOUT = 5 * 60 * 1000; // 5 mins
const RECONNECT_EXPIRE_TIMEOUT = 2 * 60 * 60 * 1000; //2 hrs

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

interface IRCONReconnectState {
  timeout: NodeJS.Timeout | undefined;
  startTime: number;
}

export default class RCONClient {
  private _serverIsAccessible!: boolean;
  private _hasErrorState: boolean = false;
  private _reconnectState?: IRCONReconnectState | undefined;

  get serverIsAccessible() {
    return this._serverIsAccessible;
  }

  get statusLabel() {
    return this._serverIsAccessible ? 'Online' : 'Offline';
  }

  private get _connectExpired() {
    if (!this._reconnectState) {
      return false;
    }

    return new Date().getTime() - this._reconnectState.startTime >= RECONNECT_EXPIRE_TIMEOUT;
  }

  constructor(private _options: IRCONHelperInitOptions) {}

  private async _markServerStatus(isUp: boolean) {
    this._options.messagingBus.emit(EventMessages.RCON.SetStatus, isUp);

    // Server status hasn't changed, break out!
    if (isUp === this._serverIsAccessible) {
      return undefined;
    }

    const connectionWasLost = this._serverIsAccessible === true && false === isUp;
    this._serverIsAccessible = isUp;
    this._options.config.saveServerStatus(isUp);

    this._options.messagingBus.emit(EventMessages.RCON.ConnectionChange, isUp);

    if (true === connectionWasLost) {
      if (false === isUp && !this._reconnectState) {
        Logger.server.info(
          `[RCON] Setting up ${RECONNECT_TIMEOUT /
            60 /
            1000} minute reconnect heartbeat. If the IP/domain has changed, update in the Auth config.`
        );
        const timeout = setInterval(this._rediscoverServer, RECONNECT_TIMEOUT);

        this._reconnectState = {
          timeout,
          startTime: new Date().getTime()
        };
      } else if (true === isUp && this._reconnectState) {
        Logger.server.info(`[RCON] Server connection restored!`);
        clearInterval(this._reconnectState.timeout as NodeJS.Timeout);
        this._reconnectState = undefined;
      }
    }

    return undefined;
  }

  async init() {
    await this._options.config.reload();

    this._serverIsAccessible = '1' === this._options.config.appState.serverIsAccessible;

    // Run simple test to see if server is accessible
    await this._testConnect();
  }

  _rediscoverServer = () => {
    if (true === this._connectExpired) {
      Logger.server.error('[RCON] Too much time has past, giving up on rediscovering server.');
      clearInterval(this._reconnectState!.timeout as NodeJS.Timeout);
      this._reconnectState = undefined;
      return undefined;
    }

    Logger.server.info('[RCON] Attempting to rediscover server...');
    return this.init();
  };

  private _evaluateError = async (err: any, options: IRCONExecOptions = {}, cmd?: string) => {
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
  };

  private async _testConnect() {
    try {
      Logger.server.info(
        `[RCON]: Attempting to connect to ${this._options.config.connectData.host}:${
          this._options.config.connectData.port
        }`
      );
      const instance = new Rcon(this._options.config.connectData);

      // Send a bogus command to test connection
      await instance.session(async c => await c.send('ping'));

      Logger.server.info('[RCON]: Connected!');

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

      return err;
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
