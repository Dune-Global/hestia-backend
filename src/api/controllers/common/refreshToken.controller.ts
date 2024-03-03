import { Request, Response, NextFunction } from "express";
import { decodedPayload } from "../../../utils/jwt-auth/jwtDecoder";
import APIError from "../../../errors/api-error";
import httpStatus from "http-status";
import Landlord from "../../../models/landlord.model";
import { createAccessToken } from "../../../utils/jwt-auth/generateToken";

// Refresh token controller
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenWithBarer = req.headers.authorization;
    if (!tokenWithBarer) {
      throw new APIError({
        message: "Invalid token",
        errors: [],
        status: httpStatus.UNAUTHORIZED,
        stack: "",
      });
    }
    const refreshToken = tokenWithBarer.slice(7);

    const result = decodedPayload(refreshToken);

    const doctorId: string = Object.values(result)[0];
    const { email, isEmailVerified, accountType  } = await Landlord.get(
      doctorId
    );

    const accessToken = createAccessToken({
      id: doctorId,
      email: email,
      isEmailVerified: isEmailVerified,
      accountType: accountType,
    });

    res.json({
      message: "Access granted",
      accessToken: accessToken,
    });
  } catch (error) {
    next(error);
  }
};
