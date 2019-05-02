import MessagingBus from '../util/MessagingBus';
import RCONClient from './RCONClient';
import RCONCommandScheduler from './RCONCommandScheduler';
import RCONConfig from './RCONConfig';
import RCONStatus from './RCONStatus';

export interface IRCONManagerInitOptions {
  messagingBus: MessagingBus;
}

export interface IRCONManagerState {
  config: RCONConfig;
  client: RCONClient;
  status: RCONStatus;
  sched: RCONCommandScheduler;
}

export interface IRCONHelperInitOptions extends IRCONManagerState {
  messagingBus: MessagingBus;
}

class RCONManager {
  private _rconConfig!: RCONConfig;
  private _rconClient!: RCONClient;
  private _rconStatus!: RCONStatus;
  private _rconCmdSched!: RCONCommandScheduler;

  get state(): IRCONManagerState {
    return {
      config: this._rconConfig,
      client: this._rconClient,
      status: this._rconStatus,
      sched: this._rconCmdSched
    };
  }

  constructor(public options: IRCONManagerInitOptions) {}

  async init() {
    this._rconConfig = new RCONConfig();
    await this._rconConfig.init();

    // Re-eval state for each instance as they need an
    //  updated state in sequential load-order
    const newState = () => ({
      ...this.options,
      ...this.state
    });

    this._rconClient = new RCONClient(newState());
    this._rconStatus = new RCONStatus(newState());
    this._rconCmdSched = new RCONCommandScheduler(newState());

    await this._rconClient.init();
    await this._rconStatus.init();
    await this._rconCmdSched.init();
  }

  stop() {
    this._rconStatus.stop();
    this._rconCmdSched.stop();
  }
}

export default RCONManager;
