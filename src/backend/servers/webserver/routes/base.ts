import Router from 'koa-router';
import { IKoaServerInitOptions } from '..';
import MessagingBus from '../../../util/MessagingBus';

class BaseRoute {
  protected _messagingBus: MessagingBus;
  protected _options: IKoaServerInitOptions;
  protected _router!: Router;

  constructor(options: IKoaServerInitOptions) {
    this._options = options;
    this._messagingBus = options.messagingBus;

    this._router = new Router();
  }
}

export default BaseRoute;
