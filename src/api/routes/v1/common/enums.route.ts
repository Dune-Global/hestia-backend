import express from "express";
import {
  getAllAmentyEnums,
  getAllPropertyAvailableGenderEnums,
  getAllPropertyStatusEnums,
  getAllPropertyTypeEnums,
} from "../../../controllers/common/enums.contoller";

const router = express.Router();

// Get enums as list
router.get("/amenty-list", getAllAmentyEnums);
router.get(
  "/property-available-gender-list",
  getAllPropertyAvailableGenderEnums
);
router.get("/property-status-list", getAllPropertyStatusEnums);
router.get("/property-type-list", getAllPropertyTypeEnums);

export default router;
