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
      host,
      port: Number(port),
      password,
      timeout: 10 * 1000
    };
  }

  async init() {
    return this.reload();
  }

  reload = async () => {
    await this._initAuth();
    await this._initCommands();
  }

  async _initAuth() {
    this._appStateDao = new AppStateDAO();
    const authConfigDAO = new AuthConfigDAO();

    const appStateEntries = await this._appStateDao.getStateEntries();
    const configEntries = await authConfigDAO.getConfigEntries();

    this.appState = AppState.fromDAO(appStateEntries).state;
    this.authConfig = AuthConfig.fromDAO(configEntries).config;
  }

  async _initCommands() {
    const arkCommandsDAO = new ArkCommandsDAO();
    const arkCommands = await arkCommandsDAO.getCommands();
    this.arkCommands = new ArkCommands(arkCommands).list;
  }

  async saveServerStatus(isUp: boolean) {
    return this._appStateDao.saveStatePart({
      propName: 'serverIsAccessible',
      propValue: isUp ? '1' : '0'
    });
  }

  async saveCommandIndex(idx: number) {
    return this._appStateDao.saveStatePart({
      propName: 'currentCommandIndex',
      propValue: idx.toString()
    });
  }
}

export default RCONConfig;
