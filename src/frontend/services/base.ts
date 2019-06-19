import jwtDecode from 'jwt-decode';
import wretch from 'wretch';
import { IUser } from './auth';

class BaseService {
  static token: string | undefined | null;

  get currentUser(): IUser | undefined {
    return BaseService.token ? jwtDecode(BaseService.token) : undefined;
  }

  protected get _baseUrl() {
    const baseUri = (window as any).ARKONTROL_URI;

    let api = wretch(`${baseUri}/api/v1/`);

    if (BaseService.token) {
      api = api.auth(`Bearer ${BaseService.token}`);
    }

    return api;
  }

  constructor() {
    // Load token on init
    BaseService.token = localStorage.getItem('_token');

    // Eval if token is expired
    if (this.currentUser && this.currentUser.exp! < new Date().getTime() / 1000) {
      BaseService.token = null;
      localStorage.removeItem('_token');
    }
  }
}

export default BaseService;
