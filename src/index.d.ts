// index.d.ts
import { JwtPayload } from 'jsonwebtoken';

export interface CustomPayload extends JwtPayload {
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomPayload;
    }
  }
}

export {};
