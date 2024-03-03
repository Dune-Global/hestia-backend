import {
  registerWarden,
  loginWarden,
} from "../../../controllers/warden/wardenAuth.contoller";
import express from "express";

const router = express.Router();

// Auth routes
router.post("/register", registerWarden);
router.get("/login", loginWarden);

export default router;
