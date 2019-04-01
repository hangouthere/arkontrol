class PlayersService {
  async getPlayers() {
    return fetch('http://localhost:8080/api/v1/players').then(r => r.json());
  }
}

export default new PlayersService();
