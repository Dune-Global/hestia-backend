import mongoose from "mongoose";

export interface IWarden {
  accountType: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  mobile: number;
  password: string;
}

export interface IWardenMethods {
  passwordMatches(password: string, pwhash: string): any;
}

export interface IWardenModel
  extends mongoose.Model<IWarden, {}, IWardenMethods> {
  checkDuplicateFields: (error: any) => APIError;
  findAndGenerateToken: (
    options: IWardenLoginRequest
  ) => Promise<IWardenSuccessLogin>;
}

export interface IWardenLoginRequest {
  email: string;
  password: string;
}

export interface IWardenSuccessLogin {
  accessToken: string;
  refreshToken: string;
}
