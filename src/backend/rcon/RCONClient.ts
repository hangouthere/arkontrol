import { Rcon } from 'rcon-client';
import { debounce } from '../../commonUtil';
import DiscordWebhook from '../DiscordWebhook';
import ConfigParser from '../util/ConfigParser';
import LoggerConfig from '../util/LoggerConfig';
import MessagingBus, { EventMessages } from '../util/MessagingBus';
import RCONConfig from './RCONConfig';

const Logger = {
  debug: LoggerConfig.instance.getLogger(),
  server: LoggerConfig.instance.getLogger('server'),
  presence: LoggerConfig.instance.getLogger('presence')
};

interface IRconClientInitOptions {
  messagingBus: MessagingBus;
}

export default class RCONClient {
  private _messagingBus: MessagingBus;
  private _config: RCONConfig;
  private _serverWasDown!: boolean;
  private _instance!: Rcon;
  private _connectionAttempts: number = 0;
  private _timeouts: number = 0;
  private _discordWH!: DiscordWebhook;
  private _onDidDisconnectDebounce: () => void;

  get instance() {
    return this._instance;
  }

  get isAuthenticated() {
    return this.instance.authenticated;
  }

  private get _reachedMaxAttempts() {
    return this._connectionAttempts >= Number(this._config.authConfig.maxConnectionAttempts.value);
  }

  constructor(options: IRconClientInitOptions) {
    // rcon-client throws an uncaught exception for some reason... Catch here and handle it!
    process.on('uncaughtException', this._detectUndesiredDisconnection);

    this._messagingBus = options.messagingBus;
    this._config = new RCONConfig();

    this._onDidDisconnectDebounce = debounce(this._onDidDisconnect, 1000);

    this._instance = new Rcon({
      packetResponseTimeout: 10000
    });

    this._instance.onDidDisconnect(this._onDidDisconnectDebounce);
  }

  private _onDidDisconnect = () => {
    if (false === this._reachedMaxAttempts) {
      Logger.server.warn('RCON Server disconnected, trying to reconnect...');
      this.connect();
    }
  }

  private async _markServerStatus(isUp: boolean, instant: boolean = false) {
    const maxConnAttempts = Number(this._config.authConfig.maxConnectionAttempts.value);

    // Mark as DOWN!
    if (false === isUp) {
      if (false === instant) {
        Logger.server.error(`RCON reached maximum connection retries (${maxConnAttempts}), giving up.`);
      }

      this._connectionAttempts = maxConnAttempts;
    } else {
      this._connectionAttempts = 0;
      this._timeouts = 0;
    }

    this._messagingBus.emit(EventMessages.RCON.ConnectionChange, isUp);

    // Server status changed, alert Discord!
    if (isUp === this._serverWasDown && this._discordWH) {
      await this._discordWH.send(isUp);
    }

    this._serverWasDown = !isUp;
    this._config.saveServerStatus(isUp);
  }

  private _detectUndesiredDisconnection = async (err: Error) => {
    const badEndpoint =
      err.message.includes('getaddrinfo ENOTFOUND') ||
      err.message.includes('connect ECONNREFUSED') ||
      err.message.includes('connect ETIMEDOUT');

    if (badEndpoint) {
      Logger.server.error(
        'RCON Could not connect to specified host/port combination.\n' +
          'Please make sure:\n' +
          '\t1) The server is up\n' +
          '\t2) You have RCON enabled on the server\n' +
          '\t3) The Auth Config is set correctly.'
      );

      this._markServerStatus(false, true);
      return;
    }

    if (err.message.includes('read ECONNRESET')) {
      Logger.server.error('RCON Disconnect from Server');

      if (true === this._reachedMaxAttempts) {
        this._markServerStatus(false);
        return;
      }

      return this.connect();
    }

    // TODO: Consider catchall here? Somewhere else? Crash?
    return;
  }

  async init() {
    // TODO: Get rid of this!
    await ConfigParser.init();

    await this.forceReconnect();
  }

  forceReconnect = async () => {
    if (this._instance) {
      this._instance.disconnect();
    }

    await this._config.init();

    this._connectionAttempts = 0;
    this._timeouts = 0;
    this._serverWasDown = '1' === this._config.appState.serverWasDown;

    if (this._config.authConfig.discordWebhookURL.value) {
      this._discordWH = new DiscordWebhook({
        webhookUrl: this._config.authConfig.discordWebhookURL.value,
        adminName: this._config.authConfig.discordAdminName.value
      });
    }

    return this.connect();
  }

  async connect(): Promise<Rcon> {
    try {
      this._connectionAttempts++;

      Logger.server.info(
        `RCON Attempt connection (${this._connectionAttempts}/${
          this._config.authConfig.maxConnectionAttempts.value
        }) to ${this._config.socketAddress}...`
      );

      await this._instance.connect(this._config.connectData);

      this._markServerStatus(true);

      Logger.server.info('RCON Server successfully connected!');
    } catch (err) {
      if ('Authentication failed: wrong password' === err.message) {
        Logger.server.error('Supplied RCON Password is invalid, please check your configuration!');

        await this._markServerStatus(false, true);
      }

      const timedout = this.markPossibleTimeout(err, 'Authentication');

      if (timedout) {
        await this.connect();
      }
    } finally {
      return this._instance;
    }
  }

  markPossibleTimeout(err: Error, type: string) {
    let wasTimeout = false;
    const maxPacketTimeouts = Number(this._config.authConfig.maxPacketTimeouts.value);

    if (true === err.message.includes('Response timeout for packet id')) {
      this._timeouts++;
      wasTimeout = true;

      Logger.debug.warn(`Timeout when performing (${this._timeouts}/${maxPacketTimeouts}): ${type}`);
    }

    if (this._timeouts >= maxPacketTimeouts) {
      Logger.server.warn(`Maximum timeouts reached (${maxPacketTimeouts}), forcing a reconnect...`);
      this.forceReconnect();
    }

    return wasTimeout;
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
