import {
  IWarden,
  IWardenLoginRequest,
  IWardenMethods,
  IWardenModel,
  IWardenSuccessLogin,
} from "./../types";
import mongoose from "mongoose";
import httpStatus from "http-status";
import { hash, compare } from "bcrypt";
import { AccountTypes } from "../enums";
import APIError from "../errors/api-error";
import {
  createAccessToken,
  createRefreshToken,
} from "../utils/jwt-auth/generateToken";

const wardenSchema = new mongoose.Schema<IWarden, IWardenModel, IWardenMethods>(
  {
    accountType: {
      type: String,
      default: "warden",
      enum: Object.values(AccountTypes),
    },
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
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    mobile: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
  },
  {
    timestamps: true,
  }
);

// Pre save hook to hash the password before saving the warden model
wardenSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();
    const hashedPassword = await hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (error) {
    return next(error);
  }
});

// Methods
wardenSchema.method({
  async passwordMatches(password: string, pwhash: string) {
    return compare(password, pwhash);
  },
});

// Statics
wardenSchema.statics = {
  // Warden login and token generation
  // @returns {Promise<IWardenSuccessLogin>}
  async findAndGenerateToken(
    options: IWardenLoginRequest
  ): Promise<IWardenSuccessLogin> {
    if (!options.email) {
      throw new APIError({
        message: "An email is required to generate a token",
        errors: [],
        status: httpStatus.UNAUTHORIZED,
        stack: "",
      });
    }

    const Warden = await this.findOne({
      $and: [
        {
          email: options.email,
        },
      ],
    }).exec();

    if (options.password) {
      if (Warden) {
        if (await Warden.passwordMatches(options.password, Warden?.password)) {
          const accessToken = createAccessToken({
            id: Warden.id,
            email: Warden.email,
            accountType: Warden.accountType,
          });

          const refreshToken = createRefreshToken({
            id: Warden.id,
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

  // Check if the Warden duplicate & unique fields exist
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

    return error;
  },
};

export default mongoose.model<IWarden, IWardenModel>("Warden", wardenSchema);
