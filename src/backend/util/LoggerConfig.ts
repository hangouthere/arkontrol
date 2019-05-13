import log4js, { Log4js } from 'log4js';
import path from 'path';
import RootPath from '../RootPath';

// TODO: Convert these to Config vars
const COMMON_LOG_SIZE: number = 3 * 1024 * 1024; // 3 * 1024 * 1024 = 3145728 = 3MB
const COMMON_BACKUP_COUNT: number = 5;

// Using consts to avoid `pkg` assuming they're assets to include
const logsName = 'logs';
const debugLogName = 'debug.txt';
const chatLogName = 'chat.json';
const presenceLogName = 'presence.json';
const serverLogName = 'server.json';
const commandsLogName = 'commands.json';

export const LOG_PATH = path.resolve(RootPath, logsName);

log4js.addLayout('json', _config => logEvent => {
  return (
    JSON.stringify({
      timestamp: logEvent.startTime,
      data: logEvent.data.join(' '),
      logLevel: (logEvent.level as any).levelStr
    }) + ','
  );
});

const Log4JSConfig = {
  appenders: {
    console: { type: 'stdout' },
    everything: {
      type: 'file',
      filename: path.join(LOG_PATH, debugLogName),
      layout: {
        type: 'pattern',
        pattern: '[%d{ISO8601_WITH_TZ_OFFSET}] [%p] - %m'
      }
    },
    chat: {
      type: 'file',
      filename: path.join(LOG_PATH, chatLogName),
      maxLogSize: COMMON_LOG_SIZE,
      backups: COMMON_BACKUP_COUNT,
      compress: true,
      layout: {
        type: 'json'
      }
    },
    presence: {
      type: 'file',
      filename: path.join(LOG_PATH, presenceLogName),
      maxLogSize: COMMON_LOG_SIZE,
      backups: COMMON_BACKUP_COUNT,
      compress: true,
      layout: {
        type: 'json'
      }
    },
    server: {
      type: 'file',
      filename: path.join(LOG_PATH, serverLogName),
      maxLogSize: COMMON_LOG_SIZE,
      backups: COMMON_BACKUP_COUNT,
      compress: true,
      layout: {
        type: 'json'
      }
    },
    commands: {
      type: 'file',
      filename: path.join(LOG_PATH, commandsLogName),
      maxLogSize: COMMON_LOG_SIZE,
      backups: COMMON_BACKUP_COUNT,
      compress: true,
      layout: {
        type: 'json'
      }
    }
  },

  categories: {
    default: {
      level: 'debug',
      appenders: ['console', 'everything']
    },
    presence: {
      level: 'info',
      appenders: ['console', 'everything', 'presence']
    },
    chat: {
      level: 'info',
      appenders: ['console', 'everything', 'chat']
    },
    server: {
      level: 'info',
      appenders: ['console', 'everything', 'server']
    },
    commands: {
      level: 'info',
      appenders: ['console', 'everything', 'commands']
    }
  }
};

class LoggerConfig {
  private _instance: Log4js;

  get instance() {
    return this._instance;
  }

  get allLoggers() {
    const catNames = Object.keys(Log4JSConfig.categories);

    return catNames.map(this.instance.getLogger);
  }

  constructor() {
    this._instance = log4js.configure(Log4JSConfig);
  }
}

export default new LoggerConfig();
