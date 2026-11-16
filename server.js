import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { isIP } from 'node:net';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import seedAdmin from './utils/seedAdmin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set(
  (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const isPrivateNetworkHost = (hostname) => {
  if (hostname === 'localhost') return true;
  if (isIP(hostname) !== 4) return false;

  const [firstOctet, secondOctet] = hostname.split('.').map(Number);
  return (
    firstOctet === 10 ||
    firstOctet === 127 ||
    (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ||
    (firstOctet === 192 && secondOctet === 168)
  );
};

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.add('http://localhost:3000');
  allowedOrigins.add('http://127.0.0.1:3000');
  // allowedOrigins.add('http://localhost:5173');
  // allowedOrigins.add('http://127.0.0.1:5173');
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      if (process.env.NODE_ENV !== 'production') {
        let clientOrigin;
        try {
          clientOrigin = new URL(origin);
        } catch {
          return callback(null, false);
        }

        if (
          clientOrigin.protocol === 'http:' &&
          ['3000', '5173'].includes(clientOrigin.port) &&
          isPrivateNetworkHost(clientOrigin.hostname)
        ) {
          return callback(null, true);
        }
      }

      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
  });
});

let initializationPromise;
const initialize = () => {
  if (!initializationPromise) {
    initializationPromise = Promise.resolve()
      .then(() => {
        if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET must be set in production');
        }

        return connectDB();
      })
      .then(seedAdmin)
      .catch((error) => {
        initializationPromise = undefined;
        throw error;
      });
  }

  return initializationPromise;
};

app.use(async (req, res, next) => {
  try {
    await initialize();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/media', mediaRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

if (!process.env.VERCEL) {
  initialize()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Server startup failed:', error.message);
      process.exitCode = 1;
    });
}
