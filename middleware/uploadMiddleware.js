import multer from 'multer';
import { deleteMediaFile, getMediaBucket } from '../config/gridFs.js';

const storage = {
  _handleFile(req, file, callback) {
    let uploadStream;

    try {
      uploadStream = getMediaBucket().openUploadStream(file.originalname, {
        metadata: { contentType: file.mimetype },
      });
    } catch (error) {
      callback(error);
      return;
    }

    let completed = false;
    const finish = (error, info) => {
      if (completed) return;
      completed = true;
      callback(error, info);
    };

    file.stream.on('error', (error) => finish(error));
    uploadStream.on('error', (error) => finish(error));
    uploadStream.on('finish', () =>
      finish(null, {
        id: uploadStream.id,
        filename: uploadStream.filename,
        size: uploadStream.length,
      })
    );
    file.stream.pipe(uploadStream);
  },

  _removeFile(req, file, callback) {
    deleteMediaFile(file.id).then(() => callback(null)).catch(callback);
  },
};

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 12,
  },
  fileFilter(req, file, callback) {
    if (allowedMimeTypes.has(file.mimetype)) {
      callback(null, true);
    } else {
      const error = new Error('Upload JPG, PNG, WEBP, GIF, MP4, WEBM or MOV files only');
      error.statusCode = 400;
      callback(error);
    }
  },
});

export const uploadMedia = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'image', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

export default upload;
