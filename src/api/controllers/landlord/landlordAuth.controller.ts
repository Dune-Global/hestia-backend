import { Request, Response, NextFunction } from "express";
import { defaultProfileImage } from "../../../utils/defaultProfileImage";
import {
  sendAccountActivationMail,
  sendResetPasswordMail,
} from "../../../utils/sendMail";
import {
  decodeAccountActivationToken,
  generateAccountActivationToken,
} from "../../../utils/accountActivationToken";
import env from "../../../config/env";
import APIError from "../../../errors/api-error";
import {
  decodeResetPasswordToken,
  generateResetPasswordToken,
} from "../../../utils/resetPasswordToken";
import Landlord from "../../../models/landlord.model";

// Register a new landlord
export const registerLandlord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let accountActivationTokenDetails: string;

    const { firstName, lastName, imgUrl, ...otherFields } = req.body;

    const constructedImgUrl = defaultProfileImage(firstName, lastName);

    const landlord = new Landlord({
      firstName,
      lastName,
      imgUrl: constructedImgUrl,
      ...otherFields,
    });

    const savedLandlord = await landlord.save();
    const accountActivationToken = generateAccountActivationToken({
      id: savedLandlord.id,
    });
    const mailSendDetails = await sendAccountActivationMail(
      savedLandlord.email,
      "Account Activation",
      `${env.fontendUrl}activate-account/${savedLandlord.firstName}${savedLandlord.lastName}/at?${accountActivationToken}`,
      savedLandlord.firstName,
      savedLandlord.lastName
    );

    if (env.isDev) {
      accountActivationTokenDetails = accountActivationToken;
    } else {
      accountActivationTokenDetails =
        "Token has been sent to your email address";
    }

    res.json({
      data: savedLandlord.transform(),
      emailConfirmation: {
        message: "An email has been sent to your email address",
        data: mailSendDetails,
        tokenInfo: accountActivationTokenDetails,
      },
    });
  } catch (error) {
    console.error(error.code);
    next(Landlord.checkDuplicateFields(error));
  }
};

// Doctor login
export const loginLandlord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = await Landlord.findAndGenerateToken({
      email: req.body.email,
      password: req.body.password,
    });
    res.json({
      message: "Login Successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// Decode the account activation token & set the isEmailVerified field to true
export const activateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const decodedToken = decodeAccountActivationToken(token);
    const landlord = await Landlord.get(decodedToken.id);

    if (landlord) {
      landlord.isEmailVerified = true;
      await landlord.save();
      res.json({
        message: "Account activated successfully!",
      });
    }

    throw new APIError({
      message: "Doctor does not exist",
      status: 404,
      errors: [
        {
          field: "Landlord",
          location: "body",
          messages: ["Landlord does not exist"],
        },
      ],
      stack: "",
    });
  } catch (error) {
    next(error);
  }
};

// Reset password with the link provided in the email
export const sendResetPasswordEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.app.locals.resetSession = true; // session start
    let resetPasswordTokenDetails: string;
    const { email } = req.body;
    if (!email) {
      throw new APIError({
        message: "An email is required to reset the password",
        errors: [],
        status: 401,
        stack: "",
      });
    }

    const landlord = await Landlord.findOne({
      email: email,
    });

    if (!landlord) {
      throw new APIError({
        message: "Landlord does not exist",
        status: 404,
        errors: [
          {
            field: "Landlord",
            location: "body",
            messages: ["Landlord does not exist"],
          },
        ],
        stack: "",
      });
    }

    req.app.locals.id = landlord.id;

    const resetPasswordToken = generateResetPasswordToken({
      id: landlord.id,
    });

    const mailSendDetails = await sendResetPasswordMail(
      landlord.email,
      "Account Activation",
      `${env.fontendUrl}activate-account/${landlord.firstName}${landlord.lastName}/rp?${resetPasswordToken}`,
      landlord.firstName,
      landlord.lastName
    );

    if (env.isDev) {
      resetPasswordTokenDetails = resetPasswordToken;
    } else {
      resetPasswordTokenDetails = "Token has been sent to your email address";
    }

    res.json({
      message: "An email has been sent to your email address",
      data: mailSendDetails,
      tokenInfo: resetPasswordTokenDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Validate reset password token
export const validateResetPasswordToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const decodedToken = decodeResetPasswordToken(token);
    const landlord = await Landlord.get(decodedToken.id);
    if (
      req.app.locals.resetSession === false ||
      landlord.id != req.app.locals.id
    ) {
      throw new APIError({
        message: "Unauthorized",
        status: 401,
        errors: [
          {
            field: "Authorization",
            location: "Header",
            messages: ["Unauthorized"],
          },
        ],
        stack: "",
      });
    }

    if (landlord) {
      req.app.locals.resetSession = true;
      req.app.locals.isAuth = true;
      return res.json({
        message: "Authenticated reset password token!",
      });
    }

    throw new APIError({
      message: "Landlord does not exist",
      status: 404,
      errors: [
        {
          field: "Landlord",
          location: "body",
          messages: ["Landlord does not exist"],
        },
      ],
      stack: "",
    });
  } catch (error) {
    return next(error);
  }
};

// validate the token from bearer token and update the password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      req.app.locals.resetSession === false ||
      req.app.locals.isAuth === false
    ) {
      throw new APIError({
        message: "Unauthorized",
        status: 401,
        errors: [
          {
            field: "Authorization",
            location: "Header",
            messages: ["Unauthorized"],
          },
        ],
        stack: "",
      });
    }

    const { token } = req.params;
    const { newPassword } = req.body;
    const decodedToken = decodeResetPasswordToken(token);
    const landlord = await Landlord.get(decodedToken.id);

    if (!newPassword) {
      throw new APIError({
        message: "Password cannot be empty",
        status: 400,
        errors: [
          {
            field: "Password",
            location: "body",
            messages: ["Password cannot be empty"],
          },
        ],
        stack: "",
      });
    }

    if (landlord) {
      if (landlord.password === newPassword) {
        throw new APIError({
          message: "Password cannot be the same as the current password",
          status: 400,
          errors: [
            {
              field: "Password",
              location: "body",
              messages: ["Password cannot be the same as the current password"],
            },
          ],
          stack: "",
        });
      }

      landlord.password = newPassword;
      await landlord.save();

      req.app.locals.isAuth = false;
      req.app.locals.resetSession = false;
      req.app.locals.id = "";

      return res.json({
        message: "Password reset successfully!",
      });
    }

    throw new APIError({
      message: "Landlord does not exist",
      status: 404,
      errors: [
        {
          field: "Landlord",
          location: "body",
          messages: ["Landlord does not exist"],
        },
      ],
      stack: "",
    });
  } catch (error) {
    return next(error);
  }
};
