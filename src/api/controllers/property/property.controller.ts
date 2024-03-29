import { Request, Response, NextFunction } from "express";
import APIError from "../../../errors/api-error";
import Property from "../../../models/property.model";
import Landlord from "../../../models/landlord.model";
import httpStatus from "http-status";
import { ITransformedProperty, AuthRequest } from "../../../types";
import {
  checkLandlordAuthorization,
  checkWardenAuthorization,
} from "../../../utils/jwt-auth/chechAccountType";
import { PropertyStatus } from "../../../enums/property/propertyStatus";

// Create a new property
export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const property = new Property(req.body);
    const savedProperty = await property.save();
    res.json(savedProperty.transform());
  } catch (error) {
    next(error);
  }
};

// List all properties
export const listProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const properties = await Property.list(req.query);
    const transformedProperties = properties.map(
      (property: ITransformedProperty) => property.transform()
    );
    res.json(transformedProperties);
  } catch (error) {
    next(error);
  }
};

// Update a property and change the propertyStatus to "pending"
export const updateProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    checkLandlordAuthorization(req.user!);
    const { propertyId } = req.params;

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { propertyStatus: "pending", ...req.body },
      { new: true }
    );

    if (!updatedProperty) {
      throw new APIError({
        message: "Property not found",
        status: httpStatus.NOT_FOUND,
        errors: [
          {
            field: "Property",
            location: "params",
            messages: [`Property with ID ${propertyId} does not exist`],
          },
        ],
        stack: "",
      });
    }

    res.json(updatedProperty.transform());
  } catch (error) {
    next(error);
  }
};

// Delete a property and delete the ID from the landlord's property list
export const deleteProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    checkLandlordAuthorization(req.user!);
    const { propertyId } = req.params;
    const deletedProperty = await Property.findByIdAndDelete(propertyId);

    if (!deletedProperty) {
      throw new APIError({
        message: "Property not found",
        status: httpStatus.NOT_FOUND,
        errors: [
          {
            field: "Property",
            location: "params",
            messages: [`Property with ID ${propertyId} does not exist`],
          },
        ],
        stack: "",
      });
    }

    // Delete the property from landlord's property list
    const landlord = await Landlord.findById(deletedProperty.landlord);

    if (!landlord) {
      throw new APIError({
        message: "Landlord does not exist",
        status: httpStatus.NOT_FOUND,
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
    const index = landlord.properties.indexOf(propertyId);
    landlord.properties.splice(index, 1);
    await landlord.save();
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Property find by ID and update the propertyStatus
export const updatePropertyStatusByWarden = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    checkWardenAuthorization(req.user!);
    const { propertyId } = req.params;
    const { propertyStatus } = req.body;

    if (!Object.values(PropertyStatus).includes(propertyStatus)) {
      throw new APIError({
        message: "Invalid property status",
        status: httpStatus.BAD_REQUEST,
        errors: [
          {
            field: "Property",
            location: "body",
            messages: [`Invalid property status: ${propertyStatus}`],
          },
        ],
        stack: "",
      });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { propertyStatus: propertyStatus },
      { new: true }
    );

    if (!updatedProperty) {
      res.status(404).json({
        message: "Property not found",
      });
    }

    res.json(updatedProperty);
  } catch (error) {
    next(error);
  }
};
