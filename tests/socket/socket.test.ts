import { createServer } from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { app } from '../../src/app.js';
import { initSocketServer } from '../../src/config/socket.js';
import { SocketService } from '../../src/sockets/socket.service.js';
import { SOCKET_EVENTS } from '../../src/constants/index.js';

describe('Socket.IO Real-time Synchronization Tests', () => {
  let httpServer: ReturnType<typeof createServer>;
  let clientSocket: ClientSocket;
  let port: number;

  beforeAll((done) => {
    httpServer = createServer(app);
    initSocketServer(httpServer);
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      done();
    });
  });

  afterAll((done) => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    httpServer.close(done);
  });

  beforeEach((done) => {
    clientSocket = Client(`http://localhost:${port}`);
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  it('should join board room and receive task:created event', (done) => {
    const sampleBoardId = 'board-room-test-123';
    const sampleTask = {
      id: 'task-123',
      title: 'Real-time test task',
      boardId: sampleBoardId,
    };

    clientSocket.emit(SOCKET_EVENTS.JOIN_BOARD, sampleBoardId);

    clientSocket.on('joined:board', (data) => {
      expect(data.boardId).toBe(sampleBoardId);

      // Listen for real-time task creation
      clientSocket.on(SOCKET_EVENTS.TASK_CREATED, (receivedTask) => {
        expect(receivedTask.id).toBe(sampleTask.id);
        expect(receivedTask.title).toBe(sampleTask.title);
        done();
      });

      // Emit from server service
      SocketService.emitTaskCreated(sampleBoardId, sampleTask);
    });
  });

  it('should receive task:moved event on Kanban movement', (done) => {
    const sampleBoardId = 'board-room-test-456';
    const sampleTask = {
      id: 'task-456',
      title: 'Move status task',
      status: 'IN_PROGRESS',
      boardId: sampleBoardId,
    };

    clientSocket.emit(SOCKET_EVENTS.JOIN_BOARD, sampleBoardId);

    clientSocket.on('joined:board', () => {
      clientSocket.on(SOCKET_EVENTS.TASK_MOVED, (receivedTask) => {
        expect(receivedTask.id).toBe(sampleTask.id);
        expect(receivedTask.status).toBe('IN_PROGRESS');
        done();
      });

      SocketService.emitTaskMoved(sampleBoardId, sampleTask);
    });
  });
});
