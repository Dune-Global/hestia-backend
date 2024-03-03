import { Request } from "express";
import { IAccessToken } from "../types";

export interface CustomRequest extends Request {
  allowedFields?: string[];
}

export interface AuthRequest extends Request {
  user?: IAccessToken;
}
