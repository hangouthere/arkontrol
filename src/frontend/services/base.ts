import jwtDecode from 'jwt-decode';
import wretch from 'wretch';
import { IUser } from './auth';
import { EventEmitter } from 'events';

export const EVENTS = {
  TOKEN_SET: 'base::TOKEN_SET',
  TOKEN_CLEARED: 'base::TOKEN_CLEARED',
  UNAUTHORIZED: 'base::UNAUTHORIZED'
};

type Token = string | undefined;

let _token: Token;

class BaseService {
  static sharedBus = new EventEmitter();

  static get currentUser(): IUser | undefined {
    return _token ? jwtDecode(_token) : undefined;
  }

  static get token() {
    return _token;
  }

  static set token(token: Token) {
    _token = token;
    localStorage.setItem('_token', token as string);
    this.sharedBus.emit(EVENTS.TOKEN_SET);
  }

  static clearToken() {
    _token = undefined;
    localStorage.removeItem('_token');
    this.sharedBus.emit(EVENTS.TOKEN_CLEARED);
  }

  static checkValidAuth() {
    // Eval if token is expired
    if (BaseService.currentUser && BaseService.currentUser.exp! < new Date().getTime() / 1000) {
      return false;
    }

    return true;
  }

  protected get _baseUrl() {
    const baseUri = (window as any).ARKONTROL_URI;

    let api = wretch(`${baseUri}/api/v1/`);

    if (_token) {
      api = api.auth(`Bearer ${_token}`);
    }

    api = api.catcher(401, err => {
      BaseService.sharedBus.emit(EVENTS.UNAUTHORIZED);
      return Promise.reject(err);
    });

    return api;
  }

  constructor() {
    // Load token on init
    const token = localStorage.getItem('_token');
    if (token) {
      BaseService.token = token;
    }

    if (false === BaseService.checkValidAuth()) {
      BaseService.clearToken();
    }
  }
}

export default BaseService;
