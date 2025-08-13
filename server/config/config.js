import dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const port = process.env.PORT || 5000;
export const mongoUri = process.env.MONGODB_URI;
export const redisUrl = process.env.REDIS_URL;
export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpire = process.env.JWT_EXPIRE;
export const clientUrl = process.env.CLIENT_URL;
export const maxFileSize = process.env.MAX_FILE_SIZE;
export const uploadPath = process.env.UPLOAD_PATH;

// Optional default export object
export default {
  NODE_ENV,
  port,
  mongoUri,
  redisUrl,
  jwtSecret,
  jwtExpire,
  clientUrl,
  maxFileSize,
  uploadPath
};
