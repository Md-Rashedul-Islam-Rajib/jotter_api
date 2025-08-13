import { JwtPayload } from 'jsonwebtoken';
export interface CustomPayload extends JwtPayload {
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomPayload;
      role?: CustomPayload;
    }
  }
}
export {};
