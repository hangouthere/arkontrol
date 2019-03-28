import path from 'path';
import fs from 'fs-extra';
import LoggerConfig from './LoggerConfig';
import RootPath from './RootPath';

// Using consts to avoid `pkg` assuming they're assets to include
const rconConfigName = 'rconConfig';
const mainConfigName = 'config.json';
const commandsConfigName = 'commands.json';

const configRoot = path.join(RootPath, rconConfigName);
const mainConfig = path.join(configRoot, mainConfigName);
const commandsConfig = path.join(configRoot, commandsConfigName);

export interface IConfig {
  auth: {
    host: string;
    port: number;
    password: string;
  };

  commands: {
    maxConnectionAttempts: number;
    maxPacketTimeouts: number;
    adminUserName?: string;
  };

  discord: {
    discordAdminName: string;
    discordWebhookURL: string;
  };
}

interface ICommands {
  list: Array<string>;
}

export class ConfigParser {
  private _config!: IConfig;
  private _commands!: ICommands;

  get config() {
    return this._config;
  }

  get commands() {
    return this._commands;
  }

  async init() {
    if (this._config && this._commands) {
      return Promise.resolve();
    }

    try {
      this._config = await fs.readJson(mainConfig);
    } catch (err) {
      LoggerConfig.instance.getLogger().error(`Missing Main Config in: ${mainConfig}`);
      process.exit(99);
    }

    try {
      this._commands = await fs.readJson(commandsConfig);
    } catch (err) {
      LoggerConfig.instance.getLogger().error(`Missing Commands Config in: ${commandsConfig}`);
      process.exit(99);
    }
  }
}

export default new ConfigParser();
