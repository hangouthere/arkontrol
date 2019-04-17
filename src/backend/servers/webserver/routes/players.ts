import { Context } from 'koa';
import Router from 'koa-router';
import PlayersDAO from '../../../database/dao/PlayersDAO';
import BaseRoute, { IRouteInitOptions } from './base';

class PlayersRoutes extends BaseRoute {
  private _router!: Router;
  private _playersDAO!: PlayersDAO;

  get routes() {
    return this._router.routes();
  }

  constructor(options: IRouteInitOptions) {
    super(options);

    this._playersDAO = new PlayersDAO();
    this._router = new Router();

    this._router.get('/players', this.getPlayers);
  }

  getPlayers = async (ctx: Context) => {
    const players = await this._playersDAO.getAllPlayers();
    ctx.body = {
      players
    };
  }
}

export default PlayersRoutes;
