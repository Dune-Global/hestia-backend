import { Request, Response, NextFunction } from "express";
import Warden from "../../../models/warden.model";
import Property from "../../../models/property.model";

// Property find by ID and update the propertyStatus
export const updatePropertyStatusByWarden = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { propertyId } = req.params;
    const { propertyStatus } = req.body;

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
