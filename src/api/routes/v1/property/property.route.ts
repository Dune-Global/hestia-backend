import express from "express";
import { isAuth } from "../../../../middleware/auth";
import {
  createProperty,
  deleteProperty,
  listProperties,
  updateProperty,
  updatePropertyStatusByWarden,
} from "../../../../api/controllers/property/property.controller";

const router = express.Router();

router.get("/all", listProperties);
router.post("/create", isAuth, createProperty);
router.patch("/update/:propertyId", isAuth, updateProperty);
router.delete("/delete-property/:propertyId", isAuth, deleteProperty);

// This route is for Warden auth
router.patch(
  "/update-property-status/:propertyId",
  isAuth,
  updatePropertyStatusByWarden
);

export default router;
