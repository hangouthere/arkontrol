import fs from 'fs-extra';
import path from 'path';
import { Rcon } from 'rcon-client';
import AuthConfigDAO from '../database/dao/AuthConfigDAO';
import AuthConfig, { IAuthConfig } from '../database/models/AuthConfig';
import DiscordWebhook from '../DiscordWebhook';
import ConfigParser, { IConfig } from '../util/ConfigParser';
import LoggerConfig, { LOG_PATH } from '../util/LoggerConfig';

const serverSemaphore = 'serverWasDown';
const STATUS_SEMAPHORE_FILE = path.join(LOG_PATH, serverSemaphore);

const Logger = {
  debug: LoggerConfig.instance.getLogger(),
  server: LoggerConfig.instance.getLogger('server'),
  presence: LoggerConfig.instance.getLogger('presence')
};

export default class RCONClient {
  private _serverWasDown!: boolean;
  private _instance!: Rcon;
  private _connectionAttempts: number = 0;
  private _timeouts: number = 0;
  private _authConfig!: IAuthConfig;
  // TODO: Get rid of this!
  private _cfgCommands!: IConfig['commands'];

  get instance() {
    return this._instance;
  }

  async init() {
    const authConfigDAO = new AuthConfigDAO();
    const configEntries = await authConfigDAO.getConfig();

    this._authConfig = AuthConfig.fromDAO(configEntries).config;

    // TODO: Getting good to get rid of!
    await ConfigParser.init();

    this._cfgCommands = ConfigParser.config.commands;

    this._serverWasDown = fs.existsSync(STATUS_SEMAPHORE_FILE);

    return this.connect();
  }

  forceReconnect = async () => {
    this._connectionAttempts = 0;
    this._timeouts = 0;
    this.connect();
  }

  _detectDisconnection = async (err: Error) => {
    if (err.message.includes('connect ECONNREFUSED') || err.message.includes('connect ETIMEDOUT')) {
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

      if (this._connectionAttempts >= this._cfgCommands.maxConnectionAttempts) {
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
        `RCON Attempt connection (${this._connectionAttempts}/${this._cfgCommands.maxConnectionAttempts}) to ${
          host.value
        }:${port.value}...`
      );

      this._instance = new Rcon({
        packetResponseTimeout: 5000
      });

      await this._instance.connect({
        host: host.value,
        port: Number(port.value),
        password: password.value
      });

      this._markServerStatus(true);

      Logger.server.info('RCON Server successfully connected!');

      this._instance.onDidDisconnect(() => {
        Logger.server.warn('RCON Server disconnected, trying to reconnect...');
        this.connect();
      });
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

    if (true === err.message.includes('Response timeout for packet id')) {
      this._timeouts++;
      wasTimeout = true;

      Logger.debug.warn(`Timeout when performing (${this._timeouts}/${this._cfgCommands.maxPacketTimeouts}): ${type}`);
    }

    if (this._timeouts >= this._cfgCommands.maxPacketTimeouts) {
      Logger.server.warn(`Maximum timeouts reached (${this._cfgCommands.maxPacketTimeouts}), forcing a reconnect...`);
      this.forceReconnect();
    }

    return wasTimeout;
  }

  async _markServerStatus(isUp: boolean, instant: boolean = false) {
    // Mark as DOWN!
    if (false === isUp) {
      fs.closeSync(fs.openSync(STATUS_SEMAPHORE_FILE, 'w'));

      if (false === instant) {
        Logger.server.error(
          `RCON reached maximum connection retries (${this._cfgCommands.maxConnectionAttempts}), giving up.`
        );
      }

      if (false === this._serverWasDown) {
        await DiscordWebhook.send(false);
      }
    } else {
      // Server is UP! However, only mark if previously down
      if (true === this._serverWasDown) {
        fs.removeSync(STATUS_SEMAPHORE_FILE);
        await DiscordWebhook.send(true);
      }

      this._connectionAttempts = 0;
      this._timeouts = 0;
    }

    this._serverWasDown = !isUp;
  }
}

process.on('unhandledRejection', (error: any) => {
  Logger.debug.error('----> unhandledRejection\n', error);
});

process.on('uncaughtException', (err: any) => {
  const knownError =
    err.message.includes('connect ECONNREFUSED') ||
    err.message.includes('connect ETIMEDOUT') ||
    err.message.includes('read ECONNRESET');

  if (knownError) {
    return;
  }

  Logger.debug.error('----> uncaughtException\n', err);
  throw err;
});
