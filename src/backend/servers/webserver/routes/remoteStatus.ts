import { Context } from 'koa';
import Router from 'koa-router';
import { IKoaServerInitOptions } from '..';
import { EventMessages } from '../../../util/MessagingBus';
import BaseRoute from './base';

class RemoteStatusRoutes extends BaseRoute {
  private _isUp = false;

  get routes() {
    return this._router.routes();
  }

  constructor(options: IKoaServerInitOptions) {
    super(options);

    this._router = new Router();

    this._router.get('/remoteStatus', this.getStatus);

    this._messagingBus.on(EventMessages.RCON.SetStatus, this._updateStatus);
  }

  _updateStatus = (isUp: boolean) => {
    this._isUp = isUp;
  }

  getStatus = async (ctx: Context) => {
    ctx.body = {
      connectedToServer: this._isUp
    };
  }
}

export default RemoteStatusRoutes;
