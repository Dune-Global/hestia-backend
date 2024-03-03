import mongoose, { Schema } from "mongoose";
import httpStatus from "http-status";
import APIError from "../errors/api-error";
import { omitBy, isNil } from "lodash";
import {
  Amenty,
  PropertyAvailableGenders,
  PropertyStatus,
  PropertyType,
  SriLankanProvinces,
} from "../enums";
import {
  IListProperty,
  ILandlord,
  IProperty,
  IPropertyMethods,
  IPropertyModel,
  ITransformedProperty,
} from "../types";

const propertySchema = new mongoose.Schema<
  IProperty,
  IPropertyModel,
  IPropertyMethods
>({
  landlord: {
    type: Schema.Types.ObjectId,
    ref: "Landlord",
    required: true,
    validate: {
      validator: async function (value: any) {
        const landlord = await mongoose
          .model<ILandlord>("Landlord")
          .findById(value);
        return landlord !== null;
      },
      message: (props: any) => `${props.value} is not a valid Landlord ID!`,
    },
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    line1: {
      type: String,
      required: true,
    },
    line2: {
      type: String,
      required: true,
    },
    line3: {
      type: String,
    },
    line4: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    stateOrProvince: {
      type: String,
      enum: Object.values(SriLankanProvinces),
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },

    googleMapLocation: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
  },
  propertyType: {
    type: String,
    enum: Object.values(PropertyType),
    required: true,
  },
  manager: {
    managerName: {
      type: String,
    },
    managerMobile: {
      type: String,
    },
  },
  shareType: {
    entire: {
      isEntire: {
        type: Boolean,
        required: true,
      },
      description: {
        type: String,
      },
      price: {
        type: Number,
      },
    },

    shared: {
      isShared: {
        type: Boolean,
        required: true,
      },
      description: {
        type: String,
      },
      price: {
        type: Number,
      },
    },
    private: {
      isPrivate: {
        type: Boolean,
        required: true,
      },
      description: {
        type: String,
      },
      price: {
        type: Number,
      },
    },
  },
  amenities: {
    type: [String],
    validate: {
      validator: function (value: any[]) {
        const allowedAmenities = Object.values(Amenty);
        return value.every((val) => allowedAmenities.includes(val));
      },
      message: (props: { value: string }) =>
        `${props.value} is not a valid amenity!`,
    },
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  propertyStatus: {
    type: String,
    enum: Object.values(PropertyStatus),
    required: true,
    default: PropertyStatus.PENDING,
  },
  availableGenders: {
    type: String,
    enum: Object.values(PropertyAvailableGenders),
    required: true,
  },
});

// Post hook to add the property to the landlord's properties array
propertySchema.post("save", async function (doc) {
  await mongoose
    .model("Landlord")
    .updateOne({ _id: doc.landlord }, { $addToSet: { properties: doc._id } });
});

// Methods
propertySchema.method({
  // Transform the property response object
  transform(this: mongoose.Document): Partial<ITransformedProperty> {
    const transformed: Partial<ITransformedProperty> = {};
    const fields: Array<keyof ITransformedProperty> = [
      "_id",
      "landlord",
      "name",
      "description",
      "address",
      "propertyType",
      "manager",
      "shareType",
      "amenities",
      "images",
      "propertyStatus",
      "availableGenders",
    ];

    fields.forEach((field) => {
      transformed[field] = this.get(field);
    });

    return transformed;
  },
});

// Statics
propertySchema.static({
  // Get a property by ID
  async get(id: string) {
    let property;

    if (mongoose.Types.ObjectId.isValid(id)) {
      property = await this.findById(id).exec();
    }
    if (property) {
      return property;
    }

    throw new APIError({
      message: "Property does not exist",
      status: httpStatus.NOT_FOUND,
      errors: [
        {
          field: "Property",
          location: "params",
          messages: [`Property with ID ${id} does not exist`],
        },
      ],
      stack: "",
    });
  },

  // List properties with pagination and other details
  list({
    page = 1,
    perPage = 20,
    availableGenders,
    amenties,
    isEntire,
    isPrivate,
    isShared,
    landlordId,
    latitudeRadius,
    longitudeRadius,
    propertyStatus,
    name,
    propertyType,
  }: IListProperty) {
    const options = omitBy(
      {
        availableGenders,
        amenties,
        isEntire,
        isPrivate,
        isShared,
        landlord: landlordId,
        latitudeRadius,
        longitudeRadius,
        propertyStatus,
        name,
        propertyType,
      },
      isNil
    );

    return this.find(options)
      .populate("landlord", "name email")
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();    
  },
});

export default mongoose.model<IProperty, IPropertyModel>(
  "Property",
  propertySchema
);
