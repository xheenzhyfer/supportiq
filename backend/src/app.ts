import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Initialize Express
const app: Application = express();

// --- 1. Global Middleware ---
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

// --- 2. Routes ---

// Root Route (The Welcome Message)
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to SupportIQ API',
    status: 'active',
    version: '1.0.0'
  });
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'System operational',
    timestamp: new Date().toISOString(),
  });
});

// --- 3. Error Handling ---

// 404 Handler (Matches any route not defined above)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${message}`, err.stack);

  res.status(statusCode).json({
    status: 'error',
    message,
  });
});

export default app;