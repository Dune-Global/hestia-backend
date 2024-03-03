import { IAccessToken } from "../../types";
import APIError from "../../errors/api-error";
import httpStatus from "http-status";

export const checkLandlordAuthorization = (user: IAccessToken) => {
  if (!user || user.accountType !== "landlord") {
    throw new APIError({
      message: "Unauthorized",
      status: httpStatus.UNAUTHORIZED,
      errors: [
        {
          field: "Account Type",
          location: "body",
          messages: ["Unauthorized"],
        },
      ],
      stack: "",
    });
  }
};
