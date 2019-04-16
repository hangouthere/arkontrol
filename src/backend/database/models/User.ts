export interface IAuthRequest {
  userName: string;
  password: string;
}

export interface IUser extends IAuthRequest {
  roles: Array<string>;
  lastLogin: string;
}
