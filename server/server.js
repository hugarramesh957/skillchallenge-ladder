import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../client/dist');

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import reviewerRoutes from './routes/reviewerRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';

// Models for initial seed check
import Challenge from './models/Challenge.js';
import { seedDatabase } from './seed/seed.js';

dotenv.config();

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true); // in development, allow local test origins
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Healthcheck & Welcome endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillChallenge Ladder REST API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/reviewer', reviewerRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Static client assets
app.use(express.static(clientDistPath));

// SPA fallback for all frontend routes (excluding /api)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error Middlewares for API
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Server and Database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const challengeCount = await Challenge.countDocuments();
    if (challengeCount === 0) {
      console.log('[Server] No challenges found in database. Running initial seed...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`[Server] SkillChallenge Ladder Server listening on port ${PORT}`);
      console.log(`[Server] API Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('[Server Error] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

