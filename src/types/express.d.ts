import { AuthenticatedUser } from './common.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      id?: string;
    }
  }
}

export {};
