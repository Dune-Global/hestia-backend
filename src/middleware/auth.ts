import httpStatus from "http-status";
import APIError from "../errors/api-error";
import { Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import env from "../config/env";
import { IAccessToken, AuthRequest } from "../types";

export const isAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    next(
      new APIError({
        message: "Unauthorized",
        stack: "",
        status: httpStatus.UNAUTHORIZED,
        errors: [
          {
            field: "Authorization",
            location: "Header",
            messages: ["Authorization Header Missing"],
          },
        ],
      })
    );
  }

  try {
    const token = authorization?.split(" ")[1];
    const payload: IAccessToken = verify(
      token!,
      env.accessTokenSecret!
    ) as IAccessToken;
    req.user = payload;
    console.log(payload);
  } catch (err) {
    next(
      new APIError({
        message: err.message,
        errors: [],
        stack: err.stack,
        status: httpStatus.UNAUTHORIZED,
      })
    );
  }

  next();
};
