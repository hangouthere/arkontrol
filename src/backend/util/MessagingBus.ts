import { EventEmitter } from 'events';

export const EventMessages = {
  RCON: {
    SetStatus: 'rcon::SET_SERVER_STATUS:NO_UPDATE',
    ConnectionChange: 'rcon::SET_SERVER_STATUS',
    CommandsChange: 'rcon::COMMANDS_CHANGE',
    CommandsEnd: 'rcon::COMMANDS_END'
  },

  Socket: {
    Connected: 'socket::SET_BOT_STATUS',
    Message: 'socket::messageRecieved'
  }
};

export default class MessagingBus extends EventEmitter {}
