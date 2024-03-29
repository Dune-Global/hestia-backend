import dotenv from "dotenv";

dotenv.config();

export default {
  env: process.env.NODE_ENV,
  mongo: {
    uri: process.env.MONGO_CONNECTION_STRING,
  },
  isDev: process.env.NODE_ENV === "dev",
  host: process.env.HOST,
  port: process.env.PORT,
  bcryptRounds: 10,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenExpIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  accessTokenExpIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  emailUser: process.env.EMAIL_USER,
  emailAppPassword: process.env.EMAIL_APP_PASSWORD,
  accountActivationTokenSecret: process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET,
  accountActivationTokenExpIn: process.env.ACCOUNT_ACTIVATION_TOKEN_EXPIRES_IN,
  passwordResetTokenSecret: process.env.PASSWORD_RESET_TOKEN_SECRET,
  passwordResetTokenExpIn: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN,
  fontendUrl: process.env.FRONTEND_URL,
  azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  azureBlobContainerName: process.env.BLOB_CONTAINER_NAME,
  azureBlobUrl: process.env.BLOB_URL,
};
