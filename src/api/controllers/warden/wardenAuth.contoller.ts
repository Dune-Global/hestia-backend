import { Request, Response, NextFunction } from "express";
import { defaultProfileImage } from "../../../utils/defaultProfileImage";
import Warden from "../../../models/warden.model";

// Register a new warden
export const registerWarden = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, imgUrl, ...otherFields } = req.body;

    const constructedImgUrl = defaultProfileImage(firstName, lastName);

    const warden = new Warden({
      firstName,
      lastName,
      imgUrl: constructedImgUrl,
      ...otherFields,
    });

    const savedWarden = await warden.save();

    res.json({
      data: savedWarden,
    });
  } catch (error) {
    console.error(error.code);
    next(Warden.checkDuplicateFields(error));
  }
};

// Warden login
export const loginWarden = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = await Warden.findAndGenerateToken({
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

