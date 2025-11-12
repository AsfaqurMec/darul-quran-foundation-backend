import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        identifier: string;
        role: string;
        email?: string;
        phone?: string;
      };
    }
  }
}

export {};

