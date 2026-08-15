import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { SOCKET_EVENTS } from '../constants/index.js';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  const allowedOrigins = env.SOCKET_CORS_ORIGIN.split(',').map((origin) => origin.trim());

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        return callback(null, true); // Allow during development
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info({ socketId: socket.id }, '🔌 Socket client connected');

    // Join board room
    socket.on(SOCKET_EVENTS.JOIN_BOARD, (boardId: string) => {
      if (typeof boardId === 'string' && boardId.trim()) {
        const room = `board:${boardId.trim()}`;
        socket.join(room);
        logger.debug({ socketId: socket.id, room }, 'Socket joined board room');
        socket.emit('joined:board', { boardId, room });
      }
    });

    // Leave board room
    socket.on(SOCKET_EVENTS.LEAVE_BOARD, (boardId: string) => {
      if (typeof boardId === 'string' && boardId.trim()) {
        const room = `board:${boardId.trim()}`;
        socket.leave(room);
        logger.debug({ socketId: socket.id, room }, 'Socket left board room');
        socket.emit('left:board', { boardId, room });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, '🔌 Socket client disconnected');
    });

    socket.on('error', (err) => {
      logger.error({ socketId: socket.id, err }, 'Socket error');
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}
