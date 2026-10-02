import { io, Socket } from 'socket.io-client';
import { authStorage } from './auth-storage';

const SOCKET_URL = (
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:4000'
)
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '');

let socketInstance: Socket | null = null;

export const getSocket = (): Socket | null => {
  const token = authStorage.getToken();
  if (!token) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[WebSocket] Connection error:', err.message);
    });
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
