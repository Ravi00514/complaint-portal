import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'civicconnect_secret_jwt_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    isAdmin: boolean;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      name: string;
      role?: string;
    };
    
    // Admin check: email address matching the seeded admin email or role='admin'
    const isAdmin = decoded.email.toLowerCase() === 'admin@civicconnect.gov.in' || decoded.role === 'admin';

    req.user = {
      ...decoded,
      isAdmin,
    };
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication token.', 403));
  }
};

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.isAdmin) {
    return next(new AppError('Access denied. Administrator privileges required.', 403));
  }
  next();
};
