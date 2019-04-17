import MessagingBus from '../../../util/MessagingBus';

export interface IRouteInitOptions {
  messagingBus: MessagingBus;
}

class BaseRoute {
  protected _messagingBus: MessagingBus;

  constructor(options: IRouteInitOptions) {
    this._messagingBus = options.messagingBus;
  }
}

export default BaseRoute;
