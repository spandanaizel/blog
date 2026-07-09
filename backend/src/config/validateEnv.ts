import { env } from './env';
import { logger } from '../utils/logger';

const INSECURE_DEFAULTS = new Set(['dev_access_secret', 'dev_refresh_secret']);

/**
 * Validates environment configuration on startup. In production, this fails
 * fast (logs a fatal error and exits) rather than silently running with
 * insecure defaults or a missing database connection string - both of which
 * would otherwise surface later as confusing runtime errors or, worse,
 * security holes that go unnoticed.
 */
export function validateEnv(): void {
  const problems: string[] = [];

  if (env.isProd) {
    if (!process.env.MONGO_URI) {
      problems.push('MONGO_URI is not set.');
    }
    if (!process.env.JWT_ACCESS_SECRET || INSECURE_DEFAULTS.has(env.JWT_ACCESS_SECRET)) {
      problems.push('JWT_ACCESS_SECRET is missing or using the insecure development default.');
    }
    if (!process.env.JWT_REFRESH_SECRET || INSECURE_DEFAULTS.has(env.JWT_REFRESH_SECRET)) {
      problems.push('JWT_REFRESH_SECRET is missing or using the insecure development default.');
    }
    if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      problems.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values.');
    }
    if (!process.env.CLIENT_URL) {
      problems.push('CLIENT_URL is not set - CORS and the refresh cookie will not work correctly.');
    }
  }

  const cloudinaryFieldsSet = [env.CLOUDINARY_CLOUD_NAME, env.CLOUDINARY_API_KEY, env.CLOUDINARY_API_SECRET].filter(
    Boolean
  ).length;
  if (cloudinaryFieldsSet > 0 && cloudinaryFieldsSet < 3) {
    logger.warn(
      '[config] Cloudinary is partially configured (some but not all of CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET are set). Uploads will use the local fallback until all three are set.'
    );
  }

  if (problems.length > 0) {
    logger.error('[config] Refusing to start in production with invalid configuration:\n  - ' + problems.join('\n  - '));
    process.exit(1);
  }
}
