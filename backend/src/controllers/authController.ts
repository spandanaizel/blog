import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { sendResponse } from '../utils/sendResponse';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from '../utils/token';
import { AuthRequest } from '../middleware/auth';
import { ActivityLog } from '../models/ActivityLog';
import { toUserPayload as buildUserPayload } from '../utils/userPayload';
import { logger } from '../utils/logger';

async function issueTokens(res: Response, user: any) {
  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ userId: user._id.toString(), tokenVersion: user.tokenVersion });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  return accessToken;
}

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw ApiError.conflict(
      existing.email === email ? 'Email already in use.' : 'Username already taken.'
    );
  }

  const user = await User.create({
    name,
    username,
    email,
    password,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
  });

  const accessToken = await issueTokens(res, user);
  await ActivityLog.create({ user: user._id, action: 'register' });
  logger.info(`[auth] new user registered: ${user._id} (${user.username})`);

  sendResponse(res, 201, { user: buildUserPayload(user), accessToken }, 'Registration successful');
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    logger.warn(`[auth] failed login attempt for email: ${email}`);
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (!user.isActive) {
    logger.warn(`[auth] login attempt on deactivated account: ${user._id}`);
    throw ApiError.forbidden('This account has been deactivated.');
  }

  const accessToken = await issueTokens(res, user);
  await ActivityLog.create({ user: user._id, action: 'login' });
  logger.info(`[auth] user logged in: ${user._id} (${user.username})`);

  sendResponse(res, 200, { user: buildUserPayload(user), accessToken }, 'Login successful');
});

// POST /api/auth/logout
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  sendResponse(res, 200, null, 'Logged out successfully');
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw ApiError.unauthorized('No refresh token provided.');
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token.');
  }

  const user = await User.findById(payload.userId);
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw ApiError.unauthorized('Refresh token is no longer valid.');
  }

  // Rotation: every successful refresh invalidates the token that was just used.
  // The next request presenting this same refresh token will fail the
  // tokenVersion check above, since the DB now holds a newer version. This
  // both limits the replay window for a stolen refresh token and detects
  // reuse (a sign of token theft) on the next attempted use of the old one.
  user.tokenVersion += 1;
  await user.save();

  const accessToken = await issueTokens(res, user);
  sendResponse(res, 200, { accessToken, user: buildUserPayload(user) }, 'Token refreshed');
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found.');
  sendResponse(res, 200, { user: buildUserPayload(user) });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond the same way to avoid leaking which emails are registered
  if (!user) {
    sendResponse(res, 200, null, 'If that email exists, a reset link has been sent.');
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await user.save();

  // In production this would be emailed via a transactional email service.
  // For now we surface it in the response during development only.
  sendResponse(
    res,
    200,
    process.env.NODE_ENV === 'development' ? { resetToken: rawToken } : null,
    'If that email exists, a reset link has been sent.'
  );
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw ApiError.badRequest('Reset token is invalid or has expired.');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.tokenVersion += 1; // invalidate existing refresh tokens
  await user.save();

  sendResponse(res, 200, null, 'Password reset successful. Please log in again.');
});
