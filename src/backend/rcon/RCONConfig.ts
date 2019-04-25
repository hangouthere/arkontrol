import AppStateDAO from '../database/dao/AppStateDAO';
import ArkCommandsDAO from '../database/dao/ArkCommandsDAO';
import AuthConfigDAO from '../database/dao/AuthConfigDAO';
import AppState, { IAppState } from '../database/models/AppState';
import ArkCommands, { IArkCommandEntry } from '../database/models/ArkCommands';
import AuthConfig, { IAuthConfig } from '../database/models/AuthConfig';

class RCONConfig {
  private _appStateDao!: AppStateDAO;
  appState!: IAppState;
  authConfig!: IAuthConfig;
  arkCommands!: Array<IArkCommandEntry>;

  get socketAddress() {
    const {
      host: { propValue: host },
      port: { propValue: port }
    } = this.authConfig;

    return `${host}:${port}`;
  }

  get connectData() {
    const {
      host: { propValue: host },
      port: { propValue: port },
      password: { propValue: password }
    } = this.authConfig;

    return {
      host: host,
      port: Number(port),
      password: password
    };
  }

  async initAuth() {
    this._appStateDao = new AppStateDAO();
    const authConfigDAO = new AuthConfigDAO();

    const appStateEntries = await this._appStateDao.getStateEntries();
    const configEntries = await authConfigDAO.getConfigEntries();

    this.appState = AppState.fromDAO(appStateEntries).state;
    this.authConfig = AuthConfig.fromDAO(configEntries).config;
  }

  async initCommands() {
    const arkCommandsDAO = new ArkCommandsDAO();
    const arkCommands = await arkCommandsDAO.getCommands();
    this.arkCommands = new ArkCommands(arkCommands).list;
  }

  async saveServerStatus(isUp: boolean) {
    return this._appStateDao.saveStatePart({
      propName: 'serverWasDown',
      propValue: isUp ? '0' : '1'
    });
  }
}

export default RCONConfig;
