import express from "express";
import {
  getLandlords,
  getLandlordById,
  testAuth,
  updateLandlordDetails,
  updateLandlordPassword,
  deleteLandlord,
} from "../../../controllers/landlord/landlord.controller";
import { isAuth } from "../../../../middleware/auth";
import { localVariables } from "../../../../middleware/locals";
import { validateFields } from "../../../../middleware/json-body-validation/bodyFieldsValidate";
import {
  allowedLandlordLogiFields,
  allowedUpdateLandlordFields,
} from "../../../../middleware/json-body-validation/allowedLandlordJsonFields";
import { CustomRequest } from "../../../../types/customRequest";
import {
  loginLandlord,
  registerLandlord,
  activateAccount,
  sendResetPasswordEmail,
  validateResetPasswordToken,
  resetPassword,
} from "../../../controllers/landlord/landlordAuth.controller";

const router = express.Router();

// Auth test route
router.get("/test", isAuth, testAuth);

// Landlord routes
router.get("/all", isAuth, getLandlords);
router.get("/find-one/:landlordId", isAuth, getLandlordById);
router.put(
  "/update/:landlordId",
  isAuth,
  (req, _res, next) => {
    (req as CustomRequest).allowedFields = allowedUpdateLandlordFields;
    next();
  },
  validateFields,
  updateLandlordDetails
);
router.patch("/update-password/:landlordId", isAuth, updateLandlordPassword);
router.delete("/delete-landlord/:landlordId", isAuth, deleteLandlord);

// Auth routes
router.post("/register", registerLandlord);
router.post(
  "/login",
  (req, _res, next) => {
    (req as CustomRequest).allowedFields = allowedLandlordLogiFields;
    next();
  },
  validateFields,
  loginLandlord,
);
router.get("/activate-account/:token", activateAccount);
router.post(
  "/send-reset-password-mail",
  localVariables,
  sendResetPasswordEmail
);
router.get("/validate-reset-password-token/:token", validateResetPasswordToken);
router.patch("/reset-password/:token", resetPassword);

export default router;
