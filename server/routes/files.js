// server/routes/files.js
import express from 'express';
import { uploadFile } from '../controllers/fileController.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// POST /api/files/upload → authenticated file upload
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  uploadFile
);

export default router;
