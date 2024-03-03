import express, { Request, Response } from "express";
import landlordRouter from "./landlord/landlord.route";
import refreshRouter from "./common/refreshToken.route";
import propertyRouter from "./property/property.route";
import enumsRouter from "./common/enums.route";
import fileServerRouter from "./common/fileService.route";
const router = express.Router();

// Test route for check overall connectivity
router.get("/tryme", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

// Plug the router into the express app
router.use("/landlord", landlordRouter);
router.use("/property", propertyRouter);
router.use("/token", refreshRouter);

// common routes
router.use("/common", enumsRouter);
router.use("/file-server", fileServerRouter);

export default router;
