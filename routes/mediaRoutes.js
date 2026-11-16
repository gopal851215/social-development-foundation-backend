import express from 'express';
import { streamMedia } from '../controllers/mediaController.js';

const router = express.Router();

router.get('/:id', streamMedia);

export default router;