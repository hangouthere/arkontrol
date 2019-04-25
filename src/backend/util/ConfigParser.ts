import fs from 'fs-extra';
import path from 'path';
import RootPath from '../RootPath';
import LoggerConfig from './LoggerConfig';

// Using consts to avoid `pkg` assuming they're assets to include
const rconConfigName = 'rconConfig';
const mainConfigName = 'config.json';
const commandsConfigName = 'commands.json';

const configRoot = path.join(RootPath, rconConfigName);
const commandsConfig = path.join(configRoot, commandsConfigName);

interface ICommands {
  list: Array<string>;
}

export class ConfigParser {
  private _commands!: ICommands;

  get commands() {
    return this._commands;
  }

  async init() {
    if (this._commands) {
      return Promise.resolve();
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
