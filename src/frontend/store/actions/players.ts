import { IActionCreator } from './index';
import PlayersService, { IPlayer } from '../../services/players';

export interface IActionCreatorTree {
  loadPlayers: IActionCreator<undefined, Promise<Array<IPlayer>>>;
}

export const PlayersActionTypes = {
  LOAD_PLAYERS: 'LOAD_PLAYERS'
};

export const PlayersActions: IActionCreatorTree = {
  loadPlayers: () => ({
    type: PlayersActionTypes.LOAD_PLAYERS,
    payload: PlayersService.getPlayers()
  })
};
