import express from 'express';
import { deleteContact, getContacts, markAsRead, submitContactForm } from '../controllers/contactController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitContactForm);
router.get('/', protect, adminOnly, getContacts);
router.put('/:id/read', protect, adminOnly, markAsRead);
router.delete('/:id', protect, adminOnly, deleteContact);

export default router;
