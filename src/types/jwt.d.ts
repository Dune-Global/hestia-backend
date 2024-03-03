export interface IAccessToken {
  id: string;
  email: string;
  isEmailVerified: boolean;
}

export interface IRefreshToken {
  id: string;
}
