import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../../shared/errors/ValidationError.js';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ValidationError('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.', [
          {
            field: 'image',
            message: `MIME type ${file.mimetype} is not supported. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
          },
        ]),
      );
    }
  },
});

export const uploadSinglePhoto = (fieldName = 'image') => {
  const multerMiddleware = upload.single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ValidationError('El archivo excede el tamaño máximo permitido de 15 MB.', [
              { field: fieldName, message: 'File size exceeds 15 MB limit' },
            ]),
          );
        }
        return next(new ValidationError(err.message, [{ field: fieldName, message: err.code }]));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};
