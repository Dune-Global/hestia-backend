import mongoose, {Document} from "mongoose";

export interface ILandlord extends Document {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  mobile: number;
  imgUrl: string;
  nicNumber: string;
  password: string;
  properties: string[];
  isEmailVerified: boolean;
}

export interface ITransformedLandlord extends ILandlord {
  _id: string;
  transform(): Partial<ITransformedLandlord>;
}

export interface ILandlordUpdatableFields {
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  mobile?: number;
  imgUrl?: string;
  nicNumber?: string;
  password?: string;
}

export interface ILandlordMethods {
  passwordMatches(password: string, pwhash: string): any;
  transform(this: mongoose.Document): Partial<ITransformedLandlord>;
}

export interface IList {
  page?: number;
  perPage?: number;
  name?: string;
  email?: string;
}

export interface ILandlordModel
  extends mongoose.Model<ILandlord, {}, ILandlordMethods> {
  list: (options: IList) => Promise<ITransformedLandlord[]>;
  checkDuplicateFields: (error: any) => APIError;
  get: (id: string) => Promise<ILandlord, APIError>;
  findAndGenerateToken: (
    options: ILandlordLoginRequest
  ) => Promise<ILandlordSuccessLogin>;
}

export interface ILandlordLoginRequest {
  email: string;
  password: string;
}

export interface ILandlordSuccessLogin {
  accessToken: string;
  refreshToken: string;
}

export interface ILandlordUpdateSuccess {
  message: string;
  updatedFieldNames: string[];
}
