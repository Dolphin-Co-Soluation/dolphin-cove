import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkDatabaseConnection } from './lib/database';

// Load environment variables
dotenv.config();

// Import route handlers
import usersRouter from './routes/users';
import postsRouter from './routes/posts';
import freelanceJobsRouter from './routes/freelanceJobs';
import tasksRouter from './routes/tasks';
import statsRouter from './routes/stats';
import uploadRouter from './routes/upload';
import freelancerModeRouter from './routes/freelancerMode';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Dolphin Cove API'
  });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/freelance-jobs', freelanceJobsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/stats', statsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/freelancer-mode', freelancerModeRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    path: req.path 
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  try {
    // Check database connection
    await checkDatabaseConnection();
    
    app.listen(PORT, () => {
      console.log(`🐬 Dolphin Cove API running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
