import { io, type Socket } from 'socket.io-client';
import { config } from '@/config/env';

let socket: Socket | null = null;

export function connectSocket(token: string | null): Socket {
  if (socket) return socket;

  socket = io(config.socketUrl, {
    auth: token ? { token } : {},
    withCredentials: true,
    autoConnect: true,
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function joinPostRoom(postId: string) {
  socket?.emit('joinPost', postId);
}

export function leavePostRoom(postId: string) {
  socket?.emit('leavePost', postId);
}
