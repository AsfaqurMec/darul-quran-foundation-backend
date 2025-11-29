import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { config } from '../../../config';

/**
 * SSLCommerz domains that should be allowed for payment callbacks
 */
const SSLCOMMERZ_DOMAINS = [
  'https://sandbox.sslcommerz.com',
  'https://securepay.sslcommerz.com',
  'http://sandbox.sslcommerz.com',
  'http://securepay.sslcommerz.com',
];

/**
 * Check if a path is a payment callback route
 */
const isPaymentCallbackRoute = (path: string): boolean => {
  return path.includes('/payment/success') || 
         path.includes('/payment/fail') || 
         path.includes('/payment/cancel');
};

/**
 * CORS middleware for payment callbacks - allows all origins
 */
const paymentCallbackCorsMiddleware = cors({
  origin: true, // Allow all origins
  credentials: false,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
});

/**
 * Dynamic CORS middleware
 * Allows origins from config, supports credentials (cookies)
 * Also allows SSLCommerz domains for payment callbacks
 * Payment callback routes allow all origins (they're form POSTs from SSLCommerz)
 * In production, restrict to specific domains
 */
const standardCorsMiddleware = cors({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps, Postman, form POSTs from SSLCommerz)
    // This is important because SSLCommerz form POSTs may not send an Origin header
    if (!origin) {
      return callback(null, true);
    }

    // Allow all origins in development (when CORS_ORIGIN is '*')
    if (config.cors.origin.includes('*')) {
      return callback(null, true);
    }

    // Allow SSLCommerz domains for payment callbacks
    // Check if origin contains sslcommerz (more flexible matching)
    if (origin.includes('sslcommerz.com')) {
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

/**
 * Conditional CORS middleware that applies permissive CORS for payment callbacks
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if this is a payment callback route
  if (isPaymentCallbackRoute(req.path)) {
    return paymentCallbackCorsMiddleware(req, res, next);
  }
  // Otherwise use standard CORS
  return standardCorsMiddleware(req, res, next);
};

/**
 * CORS middleware specifically for payment callbacks
 * Allows all origins since SSLCommerz redirects via form POST
 * This should be applied at the route level BEFORE the global CORS middleware
 */
export const paymentCallbackCors = cors({
  origin: true, // Allow all origins for payment callbacks
  credentials: false, // No credentials needed for payment callbacks
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Content-Type'],
});

