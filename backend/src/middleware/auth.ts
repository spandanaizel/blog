import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { verifyAccessToken } from '../utils/token';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'user' | 'admin';
  };
}

export const protect = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authenticated. Please log in.');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Session expired or invalid token.');
  }

  const user = await User.findById(payload.userId).select('_id role isActive');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User no longer exists or is deactivated.');
  }

  req.user = { id: user._id.toString(), role: user.role };
  next();
});

/** Optionally attaches the user if a valid token is present, but never blocks the request. */
export const optionalAuth = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.userId).select('_id role isActive');
      if (user && user.isActive) {
        req.user = { id: user._id.toString(), role: user.role };
      }
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
});

export const requireRole = (...roles: Array<'user' | 'admin'>) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action.');
    }
    next();
  };
};

export const requireAdmin = requireRole('admin');
