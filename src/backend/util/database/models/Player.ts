export class Player {
  userName: string;
  steamId: string;

  constructor(userText: string) {
    const [userIdName, steamId] = userText.split(', ');
    const [orderId, userName] = userIdName.split('. ');

    this.userName = userName;
    this.steamId = steamId;
  }
}

export const importPlayers = (userListText: string) => {
  return userListText.split('\n').reduce<Array<Player>>((users, userText) => {
    userText = userText.trim();

    if ('' !== userText) {
      users.push(new Player(userText));
    }

    return users;
  }, []);
};
