import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Zod schema for environment variable validation
const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().url('MONGO_URI must be a valid MongoDB connection string'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_EXPIRES: z.string().default('60m'),
  REFRESH_TOKEN_EXPIRES: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  UPLOAD_DIR: z.string().default('./uploads'),
  SALT_ROUNDS: z.string().regex(/^\d+$/).transform(Number).default('12'),
  BACKEND_URL: z.string().url('BACKEND_URL must be a valid URL').optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).default('587').optional(),
  SMTP_EMAIL: z.string().email('SMTP_EMAIL must be a valid email').optional(),
  SMTP_PASSWORD: z.string().optional(),
  SSLCOMMERZ_STORE_ID: z.string().min(1, 'SSLCOMMERZ_STORE_ID is required'),
  SSLCOMMERZ_STORE_PASSWORD: z.string().min(1, 'SSLCOMMERZ_STORE_PASSWORD is required'),
  SSLCOMMERZ_IS_LIVE: z.enum(['true', 'false']).default('false'),
  MEMBER_PAYMENT_SESSION_TTL_HOURS: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default('24'),
  MEMBER_PAYMENT_DOC_MAX_SIZE: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default(String(5 * 1024 * 1024)),
  MEMBER_PAYMENT_DOC_ALLOWED_TYPES: z.string().default('pdf,jpg,jpeg,png'),
});

// Validate and parse environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
 // console.error('❌ Invalid environment variables:');
 // console.error(parseResult.error.format());
  throw new Error('Environment variable validation failed. Please check your .env file.');
}

const sslIsLive = parseResult.data.SSLCOMMERZ_IS_LIVE === 'true';
const sslBaseUrl = sslIsLive ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com';
const memberDocTypes = parseResult.data.MEMBER_PAYMENT_DOC_ALLOWED_TYPES.split(',')
  .map((ext) => ext.trim().toLowerCase())
  .filter((ext) => ext.length > 0);

// Export typed config object
export const config = {
  port: parseInt(parseResult.data.PORT, 10),
  nodeEnv: parseResult.data.NODE_ENV,
  mongoUri: parseResult.data.MONGO_URI,
  jwt: {
    accessSecret: parseResult.data.JWT_ACCESS_SECRET,
    refreshSecret: parseResult.data.JWT_REFRESH_SECRET,
    accessExpires: parseResult.data.ACCESS_TOKEN_EXPIRES,
    refreshExpires: parseResult.data.REFRESH_TOKEN_EXPIRES,
  },
  cors: {
    origin: parseResult.data.CORS_ORIGIN.split(',').map((o) => o.trim()),
  },
  upload: {
    dir: parseResult.data.UPLOAD_DIR,
    ...(parseResult.data.BACKEND_URL && { backendUrl: parseResult.data.BACKEND_URL }),
  },
  bcrypt: {
    saltRounds: parseResult.data.SALT_ROUNDS,
  },
  smtp: {
    host: parseResult.data.SMTP_HOST,
    port: parseResult.data.SMTP_PORT || 587,
    email: parseResult.data.SMTP_EMAIL,
    password: parseResult.data.SMTP_PASSWORD,
  },
  sslcommerz: {
    storeId: parseResult.data.SSLCOMMERZ_STORE_ID,
    storePassword: parseResult.data.SSLCOMMERZ_STORE_PASSWORD,
    isLive: sslIsLive,
    endpoints: {
      initiate: `${sslBaseUrl}/gwprocess/v4/api.php`,
      validate: `${sslBaseUrl}/validator/api/validationserverAPI.php`,
    },
  },
  memberApplication: {
    sessionTtlHours: parseResult.data.MEMBER_PAYMENT_SESSION_TTL_HOURS,
    documentUpload: {
      maxFileSize: parseResult.data.MEMBER_PAYMENT_DOC_MAX_SIZE,
      allowedFileTypes: memberDocTypes,
    },
  },
} as const;

// Type export for config
export type Config = typeof config;

