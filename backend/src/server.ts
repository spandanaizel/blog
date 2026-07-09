import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { validateEnv } from './config/validateEnv';
import { initSocket } from './sockets';
import { logger } from './utils/logger';

async function bootstrap() {
  validateEnv();
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
}

bootstrap();
