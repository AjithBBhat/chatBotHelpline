// server/middleware/upload.js
import multer, { diskStorage } from 'multer';
import { extname as _extname } from 'path';
import { uploadPath, maxFileSize } from '../config/config.js';

// Configure storage
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${_extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mp3|wav/;
  const extname = allowedTypes.test(_extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, and media files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(maxFileSize) },
  fileFilter: fileFilter
});

export default upload;
