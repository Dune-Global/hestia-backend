import { Request, Response, NextFunction } from "express";
import {
  Amenty,
  PropertyAvailableGenders,
  PropertyStatus,
  PropertyType,
} from "../../../enums";

// Get all the list of amenties
export const getAllAmentyEnums = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const enumValues = Object.values(Amenty).filter(
      (value) => typeof value === "string"
    );

    res.json(enumValues);
  } catch (error) {
    next(error);
  }
};

// Get all the list of property available genders
export const getAllPropertyAvailableGenderEnums = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const enumValues = Object.values(PropertyAvailableGenders).filter(
      (value) => typeof value === "string"
    );

    res.json(enumValues);
  } catch (error) {
    next(error);
  }
};

// Get all the list of property status
export const getAllPropertyStatusEnums = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const enumValues = Object.values(PropertyStatus).filter(
      (value) => typeof value === "string"
    );

    res.json(enumValues);
  } catch (error) {
    next(error);
  }
};

// Get all the list of property types
export const getAllPropertyTypeEnums = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const enumValues = Object.values(PropertyType).filter(
      (value) => typeof value === "string"
    );

    res.json(enumValues);
  } catch (error) {
    next(error);
  }
};
