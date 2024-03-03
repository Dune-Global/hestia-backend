import mongoose from "mongoose";
import httpStatus from "http-status";
import { hash, compare } from "bcrypt";
import { omitBy, isNil } from "lodash";
import {
  ILandlord,
  ILandlordMethods,
  ITransformedLandlord,
  ILandlordModel,
  IList,
  ILandlordLoginRequest,
  ILandlordSuccessLogin,
} from "../types";

import APIError from "../errors/api-error";
import config from "../config/env";
import {
  createAccessToken,
  createRefreshToken,
} from "../utils/jwt-auth/generateToken";
const landlordSchema = new mongoose.Schema<
  ILandlord,
  ILandlordModel,
  ILandlordMethods
>(
  {
    firstName: {
      type: String,
      required: true,
      match: /^[^\s]+$/,
    },
    lastName: {
      type: String,
      required: true,
      match: /^[^\s]+$/,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s]+$/,
    },
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: Number,
      required: true,
      unique: true,
      match: /^\d{10}$/,
    },
    imgUrl: {
      type: String,
    },
    nicNumber: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128,
    },
    properties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true,
  }
);

// Pre save hook to hash the password
landlordSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    // hash landlord password with bcrypt
    const pwhash = await hash(this.password, config.bcryptRounds);
    this.password = pwhash;

    return next();
  } catch (error) {
    return next(error);
  }
});

// Methods
landlordSchema.method({
  // check if password hash is a match
  async passwordMatches(password: string, pwhash: string) {
    return await compare(password, pwhash);
  },

  // Transform the landlord response object
  transform(this: mongoose.Document): Partial<ITransformedLandlord> {
    const transformed: Partial<ITransformedLandlord> = {};
    const fields: Array<keyof ITransformedLandlord> = [
      "_id",
      "firstName",
      "lastName",
      "userName",
      "email",
      "mobile",
      "imgUrl",
      "nicNumber",
      "properties",
      "isEmailVerified",
    ];

    fields.forEach((field) => {
      transformed[field] = this.get(field);
    });

    return transformed;
  },
});

// Staitcs
landlordSchema.statics = {
  // get landlor by
  // @returns Promise<User, APIError>
  async get(id) {
    let landlord;

    if (mongoose.Types.ObjectId.isValid(id)) {
      landlord = await this.findById(id).exec();
    }
    if (landlord) {
      return landlord;
    }

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
  },

  // Landlord login and token generation
  // @returns {Promise<ILandlordSuccessLogin>}
  async findAndGenerateToken(
    options: ILandlordLoginRequest
  ): Promise<ILandlordSuccessLogin> {
    if (!options.email) {
      throw new APIError({
        message: "An email is required to generate a token",
        errors: [],
        status: httpStatus.UNAUTHORIZED,
        stack: "",
      });
    }

    const Landlord = await this.findOne({
      $and: [
        {
          email: options.email,
        },
      ],
    }).exec();

    if (options.password) {
      if (Landlord) {
        if (
          await Landlord.passwordMatches(options.password, Landlord?.password)
        ) {
          const accessToken = createAccessToken({
            id: Landlord.id,
            email: Landlord.email,
            isEmailVerified: Landlord.isEmailVerified,
          });

          const refreshToken = createRefreshToken({
            id: Landlord.id,
          });

          return {
            accessToken: accessToken,
            refreshToken: refreshToken,
          };
        } else {
          console.log("password is wrong");
        }
      }

      throw new APIError({
        message: "Invalid Username or password",
        errors: [],
        status: httpStatus.UNAUTHORIZED,
        stack: "",
      });
    }

    return {
      accessToken: "",
      refreshToken: "",
    };
  },

  // get all Landlord in a list with pagination
  list({ page = 1, perPage = 30, name, email }: IList) {
    const options = omitBy({ name, email }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  // Check if the Landlord duplicate & unique fields exist
  checkDuplicateFields(error: any) {
    console.log(error.name, error.code);

    // Check if the email already exists
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      Object.keys(error.keyValue)[0] === "email"
    ) {
      return new APIError({
        message: "Email Validation Error",
        errors: [
          {
            field: "email",
            location: "body",
            messages: ["email already exists"],
          },
        ],
        stack: error.stack,
        status: httpStatus.CONFLICT,
      });
    }

    // Check if the mobile already exists
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      Object.keys(error.keyValue)[0] === "mobile"
    ) {
      return new APIError({
        message: "Mobile Number Validation Error",
        errors: [
          {
            field: "mobile",
            location: "body",
            messages: ["mobile already exists"],
          },
        ],
        stack: error.stack,
        status: httpStatus.CONFLICT,
      });
    }

    // Check if the NIC is already exists
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      Object.keys(error.keyValue)[0] === "nicNumber"
    ) {
      return new APIError({
        message: "NIC Number Validation Error",
        errors: [
          {
            field: "nicNumber",
            location: "body",
            messages: ["NIC is already exists"],
          },
        ],
        stack: error.stack,
        status: httpStatus.CONFLICT,
      });
    }

    // Check if the username already exists
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      Object.keys(error.keyValue)[0] === "userName"
    ) {
      return new APIError({
        message: "Username Validation Error",
        errors: [
          {
            field: "userName",
            location: "body",
            messages: ["Username already exists"],
          },
        ],
        stack: error.stack,
        status: httpStatus.CONFLICT,
      });
    }

    return error;
  },
};

export default mongoose.model<ILandlord, ILandlordModel>(
  "Landlord",
  landlordSchema
);
