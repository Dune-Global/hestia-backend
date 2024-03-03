import { BlobServiceClient } from "@azure/storage-blob";
import env from "../../config/env";
import multer from "multer";

const AZURE_STORAGE_CONNECTION_STRING = env.azureStorageConnectionString!;
const BLOB_CONTAINER_NAME = env.azureBlobContainerName!;

const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

export const containerClient =
  blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadFile = upload.single("file");
