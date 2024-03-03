// errors
export { IErrorDetails } from "./error";
export { IAPIError } from "./error";

// Landlord
export {
  ILandlord,
  ILandlordMethods,
  ITransformedLandlord,
  ILandlordModel,
  IList,
  ILandlordLoginRequest,
  ILandlordSuccessLogin,
  ILandlordUpdatableFields,
  ILandlordUpdateSuccess,
} from "./landlord";

export {
  IListProperty,
  IProperty,
  IPropertyMethods,
  IPropertyModel,
  IPropertyUpdatableFields,
  IPropertyUpdateSuccess,
  ITransformedProperty,
} from "./property";

export {
  IWarden,
  IWardenLoginRequest,
  IWardenMethods,
  IWardenModel,
  IWardenSuccessLogin,
} from "./warden";

// JWT
export { IAccessToken, IRefreshToken } from "./jwt";

// Account activation token
export { IAccountActivationToken } from "./accountActivationToken";

// Reset password token
export { IResetPasswordToken } from "./resetPasswordToken";

// Custom request
export * from "./customRequest";
