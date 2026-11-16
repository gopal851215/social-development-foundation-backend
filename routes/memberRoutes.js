import express from 'express';
import { createMember, deleteMember, getMembers, updateMember } from '../controllers/memberController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getMembers);
router.post('/', protect, adminOnly, uploadMedia, createMember);
router.put('/:id', protect, adminOnly, uploadMedia, updateMember);
router.delete('/:id', protect, adminOnly, deleteMember);

export default router;
