export interface IAuthRequest {
  userName: string;
  password: string;
}

export interface IUser extends IAuthRequest {
  id: number;
  roles: Array<string>;
  lastLogin: string;
  displayName?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
}
