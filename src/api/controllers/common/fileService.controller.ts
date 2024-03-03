import { Request, Response, NextFunction } from "express";
import { containerClient, deleteBlob } from "../../../utils/file-server";
import { v4 as uuid4 } from "uuid";
import httpStatus from "http-status";
import env from "../../../config/env";
import APIError from "../../../errors/api-error";

// Upload a image to azure blob storage
export const handleUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    if (!file) {
      throw new APIError({
        message: "No file uploaded!",
        errors: [],
        status: httpStatus.BAD_REQUEST,
        stack: "",
      });
    }
    const fileExtension = file.originalname.split(".").pop();

    const blobName = `${uuid4()}-${Date.now()}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    let contentType = "application/octet-stream";
    if (file.mimetype === "image/jpeg") {
      contentType = "image/jpeg";
    } else if (file.mimetype === "image/png") {
      contentType = "image/png";
    }

    const uploadBlobResponse = await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    });

    if (env.isDev) {
      console.log(
        `Upload block blob ${blobName} successfully`,
        uploadBlobResponse.requestId
      );
    }

    res.json({
      message: "File uploaded successfully!",
      blobName: blobName,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a image from azure blob storage
export const handleDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const imgUrl: string = req.body.imgUrl;

  try {
    if (!imgUrl) {
      throw new APIError({
        message: "No file uploaded!",
        errors: [],
        status: httpStatus.BAD_REQUEST,
        stack: "",
      });
    }
    const pathSegments = imgUrl.split("/");
    const blobName = pathSegments[pathSegments.length - 1];

    // Delete the blob
    await deleteBlob(blobName);

    if (env.isDev) {
      console.log(`Blob "${blobName}" deleted successfully.`);
    }

    res.json({
      message: "File deleted successfully!",
    });
    
  } catch (error) {
    next(error);
  }
};
