import { BlobServiceClient } from "@azure/storage-blob";
import env from "../../config/env";

const AZURE_STORAGE_CONNECTION_STRING = env.azureStorageConnectionString!;
const BLOB_CONTAINER_NAME = env.azureBlobContainerName!;

const azureBlobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerClient =
  azureBlobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);

export const deleteBlob = async (blobName: string) => {
  const blobClient = containerClient.getBlockBlobClient(blobName);
  await blobClient.delete();
};