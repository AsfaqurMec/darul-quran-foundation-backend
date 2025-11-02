import cors from 'cors';
import { Request } from 'express';
import { config } from '@/config';

/**
 * Dynamic CORS middleware
 * Allows origins from config, supports credentials (cookies)
 * In production, restrict to specific domains
 */
export const corsMiddleware = cors({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Allow all origins in development (when CORS_ORIGIN is '*')
    if (config.cors.origin.includes('*')) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (config.cors.origin.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

