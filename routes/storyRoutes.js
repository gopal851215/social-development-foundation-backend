import express from 'express';
import {
  createStory,
  deleteStory,
  getStories,
  getStoryById,
  updateStory,
} from '../controllers/storyController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getStories);
router.get('/:id', getStoryById);
router.post('/', protect, adminOnly, uploadMedia, createStory);
router.put('/:id', protect, adminOnly, uploadMedia, updateStory);
router.delete('/:id', protect, adminOnly, deleteStory);

export default router;
