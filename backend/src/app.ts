import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import chatRoutes from './routes/chat';
import chatbotRoutes from './routes/chatbots';

// Import Routes
import scraperRoutes from './routes/scraper';

// Initialize Express
const app: Application = express();

// ==========================================
// 1. GLOBAL MIDDLEWARE (MUST COME FIRST)
// ==========================================

// Security Headers
app.use(helmet());

// CORS Config (Allow Frontend Access)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://supportiq-ten.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Logger
app.use(morgan('dev'));

// 🚨 BODY PARSER (CRITICAL FIX) 🚨
// This MUST be defined before any routes.
// It parses incoming JSON requests so 'req.body' is not undefined.
app.use(express.json({ limit: '10kb' })); 


// ==========================================
// 2. ROUTE DEFINITIONS
// ==========================================

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to SupportIQ API 🚀',
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

// Mount Scraper Routes
app.use('/api/scraper', scraperRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chatbots', chatbotRoutes);

// ==========================================
// 3. ERROR HANDLING (MUST COME LAST)
// ==========================================

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