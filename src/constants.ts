/**
 * Application-wide constants
 */

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  DONORS: 'donors',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROUTES = {
  API: '/api',
  AUTH: '/api/auth',
  USERS: '/api/users',
  UPLOADS: '/api/uploads',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

