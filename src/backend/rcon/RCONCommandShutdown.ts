import LoggerConfig from '../util/LoggerConfig';
import RCONCommandList from './RCONCommandList';

const Logger = LoggerConfig.instance.getLogger('commands');

let COUNTDOWN_IDX = 0;

const _countdowns = Array(5)
  .fill(' ')
  .map(() => {
    return [
      {
        order: 0,
        command:
          'broadcast Server will be <RichColor Color="1, 0, 0, 1">shutting down</> in ' +
          `<RichColor Color="1, 1, 0, 1">${5 - COUNTDOWN_IDX++} minutes</>, please get somewhere safe!`
      },
      {
        order: 0,
        command: 'wait 60'
      }
    ];
  })
  .reduce((coll, val) => {
    coll.push(...val);
    return coll;
  }, []);

const _alerts = Array(31)
  .fill(' ')
  .map((_, idx) => {
    const color = idx % 2 ? 0.5 : 1;
    return [
      {
        order: 0,
        command: `broadcast Server is <RichColor Color="${color}, 0, 0, 1">SHUTTING DOWN NOW</>...`
      },
      {
        order: 0,
        command: 'wait 0.2'
      }
    ];
  })
  .reduce((coll, val) => {
    coll.push(...val);
    return coll;
  }, []);

const CMDS_SHUTDOWN = [
  ..._countdowns,
  ..._alerts,
  { order: 0, command: 'SaveWorld' },
  { order: 0, command: 'wait 10' },
  { order: 0, command: 'DoExit' }
];

export default class RCONCommandShutdown extends RCONCommandList {
  async init() {
    Logger.info('[RCONShutdown] Shutting down Ark...');

    this.commandList = CMDS_SHUTDOWN;
  }

  async _execCurrentCommand(currCommand: string): Promise<string> {
    if (0 === currCommand.indexOf('wait')) {
      await this._waitCommand(currCommand);
      return 'Wait Completed';
    }

    return await this._client.execCommand(currCommand);
  }
}
