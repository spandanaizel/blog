import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/token';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let io: Server | null = null;

interface AuthedSocket extends Socket {
  userId?: string;
}

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket: AuthedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      // Allow anonymous connections (e.g. for public live counters), just without a userId room.
      return next();
    }
    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next();
    }
  });

  io.on('connection', (socket: AuthedSocket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      logger.debug(`Socket connected for user ${socket.userId}`);
    }

    socket.on('joinPost', (postId: string) => {
      socket.join(`post:${postId}`);
    });

    socket.on('leavePost', (postId: string) => {
      socket.leave(`post:${postId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocket first.');
  return io;
}

/** Emits a notification event to a specific user's private room. */
export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload);
}

/** Emits a real-time event (e.g. new comment) to everyone viewing a given post. */
export function emitToPostRoom(postId: string, event: string, payload: unknown) {
  io?.to(`post:${postId}`).emit(event, payload);
}
