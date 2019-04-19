import fs from 'fs-extra';
import path from 'path';
import { Rcon } from 'rcon-client';
import AuthConfigDAO from '../database/dao/AuthConfigDAO';
import AuthConfig, { IAuthConfig } from '../database/models/AuthConfig';
import DiscordWebhook from '../DiscordWebhook';
import ConfigParser from '../util/ConfigParser';
import LoggerConfig, { LOG_PATH } from '../util/LoggerConfig';
import MessagingBus, { EventMessages } from '../util/MessagingBus';
import AppStateDAO from '../database/dao/AppStateDAO';
import AppState, { IAppState } from '../database/models/AppState';

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
  private _serverWasDown!: boolean;
  private _instance!: Rcon;
  private _connectionAttempts: number = 0;
  private _timeouts: number = 0;
  private _appStateDao!: AppStateDAO;
  private _appState!: IAppState;
  private _authConfig!: IAuthConfig;
  private _discordWH!: DiscordWebhook;

  get instance() {
    return this._instance;
  }

  constructor(options: IRconClientInitOptions) {
    this._messagingBus = options.messagingBus;

    this._instance = new Rcon({
      packetResponseTimeout: 10000
    });

    this._instance.onDidDisconnect(() => {
      if (false === this._reachedMaxAttempts) {
        Logger.server.warn('RCON Server disconnected, trying to reconnect...');
        this.connect();
      }
    });
  }

  async init() {
    // TODO: Get rid of this!
    await ConfigParser.init();

    await this._loadConfig();

    return this.forceReconnect();
  }

  _configChanged = async () => {
    Logger.server.info('RCON AuthConfig change detected, reconnecting to Server...');
    this.forceReconnect();
  }

  get _reachedMaxAttempts() {
    return this._connectionAttempts >= Number(this._authConfig.maxConnectionAttempts.value);
  }

  async _loadConfig() {
    this._appStateDao = new AppStateDAO();
    const authConfigDAO = new AuthConfigDAO();

    const appStateEntries = await this._appStateDao.getStateEntries();
    const configEntries = await authConfigDAO.getConfigEntries();

    this._appState = AppState.fromDAO(appStateEntries).state;
    this._authConfig = AuthConfig.fromDAO(configEntries).config;

    if (this._authConfig.discordWebhookURL.value) {
      this._discordWH = new DiscordWebhook({
        webhookUrl: this._authConfig.discordWebhookURL.value,
        adminName: this._authConfig.discordAdminName && this._authConfig.discordAdminName.value
      });
    }
  }

  forceReconnect = async () => {
    if (this._instance) {
      this._instance.disconnect();
    }

    await this._loadConfig();

    this._connectionAttempts = 0;
    this._timeouts = 0;
    this._serverWasDown = '1' === this._appState.serverWasDown;

    return this.connect();
  }

  _detectDisconnection = async (err: Error) => {
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

  async connect(): Promise<Rcon> {
    // rcon-client throws an uncaught exception for some reason... Catch here and handle it!
    process.off('uncaughtException', this._detectDisconnection);
    process.once('uncaughtException', this._detectDisconnection);

    try {
      this._connectionAttempts++;

      const { host, port, password } = this._authConfig;

      Logger.server.info(
        `RCON Attempt connection (${this._connectionAttempts}/${this._authConfig.maxConnectionAttempts.value}) to ${
          host.value
        }:${port.value}...`
      );

      await this._instance.connect({
        host: host.value,
        port: Number(port.value),
        password: password.value
      });

      this._markServerStatus(true);

      Logger.server.info('RCON Server successfully connected!');
    } catch (err) {
      if ('Authentication failed: wrong password' === err.message) {
        Logger.server.error('Supplied RCON Password is invalid, please check your configuration!');

        this._markServerStatus(false, true);
      }

      const timedout = this.markPossibleTimeout(err, 'Authentication');

      if (timedout) {
        return await this.connect();
      }
    } finally {
      return this._instance;
    }
  }

  markPossibleTimeout(err: Error, type: string) {
    let wasTimeout = false;
    const maxPacketTimeouts = Number(this._authConfig.maxPacketTimeouts.value);

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

  async _markServerStatus(isUp: boolean, instant: boolean = false) {
    // Mark as DOWN!
    if (false === isUp) {
      if (false === instant) {
        Logger.server.error(
          `RCON reached maximum connection retries (${this._authConfig.maxConnectionAttempts.value}), giving up.`
        );
      }

      if (false === this._serverWasDown) {
        if (this._discordWH) {
          await this._discordWH.send(false);
        }
      }

      this._connectionAttempts = Number(this._authConfig.maxConnectionAttempts.value);
    } else {
      // Server is UP! However, only mark if previously down
      if (true === this._serverWasDown) {
        if (this._discordWH) {
          await this._discordWH.send(true);
        }
      }

      this._connectionAttempts = 0;
      this._timeouts = 0;
    }

    this._messagingBus.emit(EventMessages.RCON.ConnectionChange, isUp);

    this._serverWasDown = !isUp;
    this._appStateDao.saveStatePart({
      propName: 'serverWasDown',
      propValue: isUp ? '0' : '1'
    });
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
