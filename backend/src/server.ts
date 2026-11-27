import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routers
import authRouter from './routes/auth.routes';
import categoryRouter from './routes/category.routes';
import departmentRouter from './routes/department.routes';
import emergencyRouter from './routes/emergency.routes';
import bookmarkRouter from './routes/bookmark.routes';
import locationRouter from './routes/location.routes';
import complaintRouter from './routes/complaint.routes';

// Import middlewares
import { errorHandler } from './middleware/errorHandler';
import { query } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiter: max 200 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Quick test on database connectivity
    await query('SELECT 1');
    res.status(200).json({
      success: true,
      message: 'CivicConnect Backend API is healthy and connected to database.',
      data: {
        timestamp: new Date(),
        uptime: process.uptime(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Backend is running but database connection failed.',
      data: null,
    });
  }
});

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/bookmarks', bookmarkRouter);
app.use('/api/location', locationRouter);
app.use('/api/complaints', complaintRouter);

// Fallback for unmatched routes
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find route ${req.originalUrl} on this server.`,
    data: null,
  });
});

// Centralized error handling middleware (must be registered last)
app.use(errorHandler);

// Database connection check and listen
const startServer = async () => {
  try {
    console.log('[System] Checking database connection...');
    await query('SELECT 1');
    console.log('[Database] Database connection successful.');

    app.listen(PORT, () => {
      console.log(`[System] CivicConnect Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[System] Failed to start server due to database connection error:', err);
    process.exit(1);
  }
};

startServer();
