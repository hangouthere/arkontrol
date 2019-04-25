import Player from '../models/Player';
import BaseDAO from './base';

class PlayersDAO extends BaseDAO {
  async getOnlinePlayers() {
    return await this._db.all(`SELECT * FROM Players WHERE isOnline=1`);
  }

  async getAllPlayers() {
    return await this._db.all(`SELECT * FROM Players`);
  }

  async setAllPlayersOffline() {
    await this._db.run(`UPDATE Players SET isOnline=0`);
  }

  async updatePlayer(player: Player, isOnline: boolean) {
    await this._db.run(
      `INSERT INTO Players (userName, steamId, isOnline, lastSeen)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(steamId) DO UPDATE SET
          userName=excluded.userName,
          isOnline=excluded.isOnline,
          lastSeen=excluded.lastSeen`,
      player.userName,
      player.steamId,
      isOnline,
      new Date().toISOString()
    );
  }

  async updatePlayerList(players: Array<Player>, isOnline: boolean) {
    for (let x = 0; x < players.length; x++) {
      await this.updatePlayer(players[x], isOnline);
    }
  }
}

export default PlayersDAO;
