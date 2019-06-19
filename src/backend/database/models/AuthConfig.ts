export interface IAuthConfigEntry {
  propName: string;
  propValue: any;
  propDesc: string;
}

export interface IAuthConfig {
  host: IAuthConfigEntry;
  port: IAuthConfigEntry;
  password: IAuthConfigEntry;
  discordAdminName: IAuthConfigEntry;
  discordWebhookURL: IAuthConfigEntry;
}

class AuthConfig {
  static fromDAO(entries: Array<IAuthConfigEntry>): AuthConfig {
    const config = entries.reduce<Partial<IAuthConfig>>((cfg, entry) => {
      cfg[entry.propName] = entry;

      return cfg;
    }, {});

    return new AuthConfig(config as IAuthConfig);
  }

  constructor(public config: IAuthConfig) {}
}

export default AuthConfig;
