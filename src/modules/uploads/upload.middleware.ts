// eslint-disable-next-line @typescript-eslint/no-require-imports
const multer = require('multer');
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { config } from '../../config';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
): void => {
  // Check MIME type
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only image files are allowed') as unknown as Error,
      false
    );
  }
};

// File filter for volunteer profile images (supports HEIC/HEIF)
const volunteerProfileImageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
): void => {
  // Check MIME type - includes HEIC/HEIF support
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/heif',
  ];
  
  // Also check file extension as fallback (some browsers may not send correct MIME type for HEIC/HEIF)
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.heic', '.heif'];
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Profile image must be JPEG, JPG, PNG, HEIC, or HEIF format'
      ) as unknown as Error,
      false
    );
  }
};

const memberDocExtSet = new Set(
  config.memberApplication.documentUpload.allowedFileTypes.map((ext) =>
    ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
  )
);

const extensionMimeMap: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
};

const memberDocMimeSet = new Set<string>();
memberDocExtSet.forEach((ext) => {
  const mimes = extensionMimeMap[ext];
  if (mimes) {
    mimes.forEach((mime) => memberDocMimeSet.add(mime));
  }
});

const memberPaymentDocumentFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isAllowedExtension = memberDocExtSet.size === 0 || memberDocExtSet.has(ext);
  const isAllowedMime = memberDocMimeSet.size === 0 || memberDocMimeSet.has(mime);

  if (isAllowedExtension || isAllowedMime) {
    cb(null, true);
    return;
  }

  cb(
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Payment document must be one of: ${Array.from(memberDocExtSet).join(', ') || 'pdf, jpg, jpeg, png'}`
    ) as unknown as Error,
    false
  );
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Configure multer for volunteer profile images (3MB limit, HEIC/HEIF support)
export const uploadVolunteerProfileImage = multer({
  storage,
  fileFilter: volunteerProfileImageFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB max file size
  },
});

// Configure multer for member payment documents
export const uploadMemberPaymentDocument = multer({
  storage,
  fileFilter: memberPaymentDocumentFilter,
  limits: {
    fileSize: config.memberApplication.documentUpload.maxFileSize,
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware for multiple file uploads
export const uploadMultiple = (fieldName: string, maxCount = 10) =>
  upload.array(fieldName, maxCount);

/**
 * Helper to get file URL from file path
 * In production, replace with S3/CDN URL
 */
export const getFileUrl = (filename: string): string => {
  // For local development: serve from /api/uploads endpoint
  // In production: return S3/CDN URL
  return `/uploads/${filename}`;
};
