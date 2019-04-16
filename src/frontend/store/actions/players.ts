import PlayersService, { IPlayer } from '../../services/players';
import SocketService from '../../services/socket';
import { IActionCreator } from './index';

export interface IActionCreatorTree {
  loadPlayers: IActionCreator<undefined, Promise<Array<IPlayer>>>;
  kickPlayer: IActionCreator<string, Promise<void>>;
  banPlayer: IActionCreator<string, Promise<void>>;
  messagePlayer: IActionCreator<{ userName: string; toPlayer: string; message: string }, Promise<void>>;
}

export const PlayersActionTypes = {
  LOAD_PLAYERS: 'LOAD_PLAYERS',
  KICK_PLAYER: 'KICK_PLAYER',
  MESSAGE_PLAYER: 'MESSAGE_PLAYER'
};

export const PlayersActions: IActionCreatorTree = {
  loadPlayers: () => ({
    type: PlayersActionTypes.LOAD_PLAYERS,
    payload: PlayersService.getPlayers()
  }),

  kickPlayer: (steamId?: string) => ({
    type: PlayersActionTypes.KICK_PLAYER,
    payload: SocketService.sendArkCommand(`KickPlayer ${steamId}`)
  }),

  banPlayer: (steamId?: string) => ({
    type: PlayersActionTypes.KICK_PLAYER,
    payload: SocketService.sendArkCommand(`BanPlayer ${steamId}`)
  }),

  messagePlayer: (input?) => {
    if (input) {
      return {
        type: PlayersActionTypes.MESSAGE_PLAYER,
        payload: SocketService.sendArkCommand(
          `ServerChatTo "${input.toPlayer}" (${input.userName}) [PM] ${input.message}`
        )
      };
    }

    return undefined;
  }
};
