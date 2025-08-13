import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { clientUrl } from '../config/config.js';

// CORS configuration
export const corsOptions = {
  origin: [clientUrl],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

export const corsMiddleware = cors(corsOptions);

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many authentication attempts, please try again later.'
});

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
});

// Named exports for direct import in other files
export {
  corsMiddleware as cors,
  helmetMiddleware as helmet
};
