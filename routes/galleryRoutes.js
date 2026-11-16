import express from 'express';
import { createGalleryItem, deleteGalleryItem, getGallery } from '../controllers/galleryController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getGallery);
router.post('/', protect, adminOnly, uploadMedia, createGalleryItem);
router.delete('/:id', protect, adminOnly, deleteGalleryItem);

export default router;
