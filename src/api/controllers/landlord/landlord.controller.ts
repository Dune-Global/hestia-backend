import { Request, Response, NextFunction } from "express";
import Landlord from "../../../models/landlord.model";
import Property from "../../../models/property.model";
import {
  ITransformedLandlord,
  ILandlordUpdateSuccess,
  AuthRequest,
} from "../../../types";
import APIError from "../../../errors/api-error";
import httpStatus from "http-status";
import { checkLandlordAuthorization } from "../../../utils/jwt-auth/chechAccountType";

// Test auth
export const testAuth = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(_req.user?.accountType);
    res.json({
      message: "Access granted",
    });
  } catch (error) {
    next(error);
  }
};

// Get the list of Landlords
export const getLandlords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const Landlords = await Landlord.list(req.query);
    const transformedLandlords = Landlords.map(
      (landlord: ITransformedLandlord) => landlord.transform()
    );
    res.json(transformedLandlords);
  } catch (error) {
    next(error);
  }
};

// Get landlord by ID
export const getLandlordById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const landlord = await Landlord.get(req.params.landlordId);
    res.json(landlord.transform());
  } catch (error) {
    next(error);
  }
};

// Update additional details
export const updateLandlordDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<ILandlordUpdateSuccess> => {
  try {
    checkLandlordAuthorization(req.user!);
    const updateFields = req.body;
    const landlord = await Landlord.get(req.params.landlordId);

    if (landlord) {
      try {
        landlord.set(updateFields);
        await landlord.save();
        res.json({
          message: "Landlord updated successfully!",
          updatedFieldNames: Object.keys(updateFields),
        });
      } catch (error) {
        next(Landlord.checkDuplicateFields(error));
      }
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
    next(Landlord.checkDuplicateFields(error));
  }
  return {
    message: "",
    updatedFieldNames: [""],
  };
};

// Update landlord password field
export const updateLandlordPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    checkLandlordAuthorization(req.user!);
    const landlord = await Landlord.get(req.params.landlordId);
    const { oldPassword, newPassword } = req.body;
    if (landlord) {
      if (await landlord.passwordMatches(oldPassword, landlord.password)) {
        landlord.password = newPassword;
        await landlord.save();
        res.json({
          message: "Password updated successfully!",
        });
      } else {
        throw new APIError({
          message: "Password does not match",
          status: 400,
          errors: [
            {
              field: "Password",
              location: "body",
              messages: ["Password does not match"],
            },
          ],
          stack: "",
        });
      }
    } else {
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
  } catch (error) {
    next(error);
  }
};

// Delete landlord and its properties as well
export const deleteLandlord = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    checkLandlordAuthorization(req.user!);
    const { landlordId } = req.params;

    // Find and delete all properties associated with the landlord
    await Property.deleteMany({ landlord: landlordId });

    // Then delete the landlord
    const landlord = await Landlord.findByIdAndDelete(landlordId);

    if (landlord) {
      res.json({
        message: "Landlord and associated properties deleted successfully",
      });
    } else {
      throw new APIError({
        message: "Landlord does not exist",
        status: httpStatus.NOT_FOUND,
        errors: [
          {
            field: "Landlord",
            location: "params",
            messages: ["Landlord does not exist"],
          },
        ],
        stack: "",
      });
    }
  } catch (error) {
    next(error);
  }
};
