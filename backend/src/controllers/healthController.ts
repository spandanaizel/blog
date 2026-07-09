import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../../package.json');

const startedAt = Date.now();

/**
 * Liveness probe — answers "is the process up and able to respond at all?"
 * Deliberately does NOT check the database: a brief Mongo blip shouldn't cause
 * an orchestrator to kill and restart an otherwise-healthy process.
 */
export function getLiveness(_req: Request, res: Response) {
  res.json({
    success: true,
    status: 'ok',
    environment: env.NODE_ENV,
    version,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Readiness probe — answers "is this instance ready to serve real traffic?"
 * Checks the actual MongoDB connection state, since most endpoints are
 * useless without it. Returns 503 (not 200) when not ready, so load
 * balancers/orchestrators correctly stop routing traffic here.
 */
export function getReadiness(_req: Request, res: Response) {
  const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] ?? 'unknown';
  const isReady = dbState === 1;

  res.status(isReady ? 200 : 503).json({
    success: isReady,
    status: isReady ? 'ready' : 'not_ready',
    database: dbStatus,
    environment: env.NODE_ENV,
    version,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
}
