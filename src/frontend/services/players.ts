import BaseService from './base';

export interface IPlayer {
  userName: string;
  steamId: string;
  isOnline: boolean;
  lastSeen: string;
}

class PlayersService extends BaseService {
  async getPlayers() {
    return this._baseUrl
      .url('players')
      .get()
      .json(j => j.players);
  }
}

export default new PlayersService();
