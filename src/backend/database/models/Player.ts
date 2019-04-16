export interface IPlayer {
  userName: string;
  steamId: string;
}

class Player implements IPlayer {
  static fromRCON(userListText: string): Array<Player> {
    const entries = userListText.split('\n');

    return entries.reduce<Array<IPlayer>>((players, entry) => {
      entry = entry.trim();

      if ('' !== entry) {
        const [userIdName, steamId] = entry.split(', ');
        const [orderId, userName] = userIdName.split('. ');

        players.push(new Player(userName, steamId));
      }

      return players;
    }, []);
  }

  constructor(public userName: string, public steamId: string) {}
}

export default Player;
