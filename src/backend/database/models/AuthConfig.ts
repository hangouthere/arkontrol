export interface IAuthConfigEntry {
  propName: string;
  propValue: string;
  propDesc: string;
}

export interface IAuthConfigTuple {
  value: string;
  desc: string;
}

export interface IAuthConfig {
  host: IAuthConfigTuple;
  port: IAuthConfigTuple;
  password: IAuthConfigTuple;
  maxConnectionAttempts: IAuthConfigTuple;
  maxPacketTimeouts: IAuthConfigTuple;
  discordAdminName: IAuthConfigTuple;
  discordWebhookURL: IAuthConfigTuple;
}

class AuthConfig {
  static fromDAO(entries: Array<IAuthConfigEntry>): AuthConfig {
    const config = entries.reduce<Partial<IAuthConfig>>((cfg, entry) => {
      cfg[entry.propName] = {
        value: entry.propValue,
        desc: entry.propDesc
      };

      return cfg;
    }, {});

    return new AuthConfig(config as IAuthConfig);
  }

  constructor(public config: IAuthConfig) {}
}

export default AuthConfig;
