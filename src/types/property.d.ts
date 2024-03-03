import mongoose from "mongoose";
import { Document, Types } from "mongoose";

export interface IProperty extends Document {
  landlord: Types.ObjectId;
  name: string;
  description: string;
  address: {
    line1: string;
    line2: string;
    line3?: string;
    line4?: string;
    city: string;
    stateOrProvince: string;
    postalCode: string;
    googleMapLocation: {
      latitude: number;
      longitude: number;
    };
  };
  propertyType: string;
  manager: {
    managerName: string;
    managerMobile: string;
  };
  shareType: {
    entire: {
      isEntire: boolean;
      description?: string;
      price?: number;
    };
    shared: {
      isShared: boolean;
      description?: string;
      price?: number;
    };
    private: {
      isPrivate: boolean;
      description?: string;
      price?: number;
    };
  };
  amenities: string[];
  images: string[];
  propertyStatus: string;
  availableGenders: string;
}

export interface ITransformedProperty extends IProperty {
  _id: string;
  transform(): Partial<ITransformedProperty>;
}

// PropertyType & PropertyStatus cannot be edited by the user
// TODO: Refer the landlord.d.ts to check the differnce between this type
export interface IPropertyUpdatableFields
  extends Omit<Partial<IProperty>, "propertyType" | "propertyStatus"> {}

export interface IPropertyMethods {
  transform(this: mongoose.Document): Partial<ITransformedProperty>;
}

export interface IListProperty {
  page?: number;
  perPage?: number;
  name?: string;
  landlordId?: string;
  propertyType?: string;
  propertyStatus?: string;
  isEntire?: boolean;
  isShared?: boolean;
  isPrivate?: boolean;
  amenties?: string;
  availableGenders?: string;
  latitudeRadius?: number;
  longitudeRadius?: number;
  propertyStatus?: string;
}

export interface IPropertyModel
  extends mongoose.Model<IProperty, {}, IPropertyMethods> {
  list: (options: IListProperty) => Promise<ITransformedProperty[]>;
  get: (id: string) => Promise<IProperty, APIError>;
}

export interface IPropertyUpdateSuccess {
  message: string;
  propertyStatus: string;
  updatedFieldNames: string[];
}
