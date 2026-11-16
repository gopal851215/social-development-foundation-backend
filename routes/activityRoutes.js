import express from 'express';
import {
  createActivity,
  deleteActivity,
  getActivities,
  getActivityById,
  updateActivity,
} from '../controllers/activityController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getActivities);
router.get('/:id', getActivityById);
router.post('/', protect, adminOnly, uploadMedia, createActivity);
router.put('/:id', protect, adminOnly, uploadMedia, updateActivity);
router.delete('/:id', protect, adminOnly, deleteActivity);

export default router;
