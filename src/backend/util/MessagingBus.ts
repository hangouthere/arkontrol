import { EventEmitter } from 'events';

export const EventMessages = {
  RCON: {
    ConnectionChange: 'rcon::SET_SERVER_STATUS'
  },

  Socket: {
    Connected: 'socket::SET_BOT_STATUS',
    Message: 'socket::messageRecieved'
  }
};

export default class MessagingBus extends EventEmitter {}
