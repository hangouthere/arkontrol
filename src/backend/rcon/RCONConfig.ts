import AuthConfig from '../database/models/AuthConfig';
import AppState, { IAppState } from '../database/models/AppState';
import AppStateDAO from '../database/dao/AppStateDAO';
import AuthConfigDAO from '../database/dao/AuthConfigDAO';
import { IAuthConfig } from '../../frontend/store/reducers/authConfig';

class RCONConfig {
  private _appStateDao!: AppStateDAO;
  appState!: IAppState;
  authConfig!: IAuthConfig;

  get socketAddress() {
    const {
      host: { value: host },
      port: { value: port }
    } = this.authConfig;

    return `${host}:${port}`;
  }

  get connectData() {
    const {
      host: { value: host },
      port: { value: port },
      password: { value: password }
    } = this.authConfig;

    return {
      host: host,
      port: Number(port),
      password: password
    };
  }

  async init() {
    this._appStateDao = new AppStateDAO();
    const authConfigDAO = new AuthConfigDAO();

    const appStateEntries = await this._appStateDao.getStateEntries();
    const configEntries = await authConfigDAO.getConfigEntries();

    this.appState = AppState.fromDAO(appStateEntries).state;
    this.authConfig = AuthConfig.fromDAO(configEntries).config;
  }

  async saveServerStatus(isUp: boolean) {
    this._appStateDao.saveStatePart({
      propName: 'serverWasDown',
      propValue: isUp ? '0' : '1'
    });
  }
}

export default RCONConfig;
