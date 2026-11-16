import express from 'express';
import { getCurrentUser, loginUser } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', protect, adminOnly, getCurrentUser);

export default router;
