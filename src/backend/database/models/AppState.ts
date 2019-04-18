export interface IAppStateEntry {
  propName: string;
  propValue: string;
}

export interface IAppState {
  serverWasDown: string;
  currentCommandIndex: number;
}

class AppState {
  static fromDAO(entries: Array<IAppStateEntry>): AppState {
    const config = entries.reduce<Partial<IAppState>>((cfg, entry) => {
      cfg[entry.propName] = entry.propValue;

      return cfg;
    }, {});

    return new AppState(config as IAppState);
  }

  constructor(public state: IAppState) {}
}

export default AppState;
