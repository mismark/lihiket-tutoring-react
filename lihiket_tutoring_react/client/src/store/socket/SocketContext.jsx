import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '')
  || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect only when a token exists
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SERVER_URL, {
      auth:       { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay:    2000,
    });

    socketRef.current = socket;

    socket.on('connect',         () => setConnected(true));
    socket.on('disconnect',      () => setConnected(false));
    socket.on('connect_error',   () => setConnected(false));

    // Forward chat:unread events as a DOM event so ChatContext can
    // increment the badge without a circular import.
    socket.on('chat:unread', () => {
      window.dispatchEvent(new CustomEvent('socket:chat:unread'));
    });

    // Forward notification:new events as a DOM event so NotificationContext
    // can prepend the notification and bump the badge instantly.
    socket.on('notification:new', (notification) => {
      window.dispatchEvent(new CustomEvent('socket:notification:new', {
        detail: notification,
      }));
    });

    // Forward liveclass:status events so LiveClass pages update in real-time
    socket.on('liveclass:status', (payload) => {
      window.dispatchEvent(new CustomEvent('socket:liveclass:status', {
        detail: payload,
      }));
    });

    // Re-auth when token changes (e.g. after login)
    const onStorage = (e) => {
      if (e.key === 'token') {
        if (e.newValue) socket.auth = { token: e.newValue };
        else socket.disconnect();
      }
    };
    window.addEventListener('storage', onStorage);

    // Stop socket on explicit logout
    const onLogout = () => {
      socket.disconnect();
      setConnected(false);
    };
    window.addEventListener('auth:logout', onLogout);

    return () => {
      socket.disconnect();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []); // run once — token is read from localStorage at mount time

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
};

export default SocketContext;
