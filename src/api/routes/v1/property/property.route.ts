import express from "express";
import { isAuth } from "../../../../middleware/auth";
import {
  createProperty,
  deleteProperty,
  listProperties,
  updateProperty,
} from "../../../../api/controllers/property/property.controller";

const router = express.Router();

router.get("/all", listProperties);
router.post("/create", isAuth, createProperty);
router.patch("/update/:propertyId", isAuth, updateProperty);
router.delete("/delete-property/:propertyId", isAuth, deleteProperty);

export default router;
