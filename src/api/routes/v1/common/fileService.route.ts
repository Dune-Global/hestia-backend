import express from "express";
import { handleDelete, handleUpload } from "../../../../api/controllers/common/fileService.controller";
import { uploadFile } from "../../../../utils/file-server";

const router = express.Router();

router.post("/upload", uploadFile, handleUpload);
router.delete("/delete", handleDelete);

export default router;
