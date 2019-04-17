import { EventEmitter } from 'events';

export const EventMessages = {
  AuthConfig: {
    Updated: 'authConfig::updated'
  },

  RCON: {
    Connected: 'rcon::connected',
    Disconnected: 'rcon::disconnected'
  },

  Socket: {
    Connected: 'socket::connected',
    Message: 'socket::messageRecieved'
  }
};

export default class MessagingBus extends EventEmitter {}