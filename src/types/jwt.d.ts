export interface IAccessToken {
  id: string;
  email: string;
  isEmailVerified?: boolean;
  accountType: string;
}

export interface IRefreshToken {
  id: string;
}
