import { Context } from 'koa';
import Router from 'koa-router';
import PlayersDAO from '../../../database/dao/PlayersDAO';

class PlayersRoutes {
  private _router!: Router;
  private _playersDAO!: PlayersDAO;

  get routes() {
    return this._router.routes();
  }

  constructor() {
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
