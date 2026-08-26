const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');
const config     = require('./index');

// Singleton — set once in server.js, read anywhere via getIO()
let _io = null;

/**
 * Attach Socket.IO to the HTTP server, wire auth middleware,
 * and set up per-connection event handling.
 */
function initSocket(httpServer) {
  _io = new Server(httpServer, {
    cors: {
      origin: '*',          // same permissive policy as Express CORS
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Use long-polling as transport fallback (works behind proxies/firewalls)
    transports: ['websocket', 'polling'],
  });

  // ── Auth middleware: validate JWT on every connection ─────────────────────
  _io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId    = decoded.id;
      socket.userRole  = decoded.role;
      socket.userModel = decoded.collection;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Per-connection handlers ───────────────────────────────────────────────
  _io.on('connection', (socket) => {
    const uid = socket.userId;

    // Each user joins a personal room keyed by their userId.
    // This lets us target messages to a specific user regardless of
    // how many tabs/devices they have open.
    socket.join(`user:${uid}`);

    // Client asks to join a specific conversation room (for the active chat)
    socket.on('chat:join', (conversationId) => {
      if (conversationId) socket.join(`conv:${conversationId}`);
    });

    // Client leaves a conversation room (when they navigate away)
    socket.on('chat:leave', (conversationId) => {
      if (conversationId) socket.leave(`conv:${conversationId}`);
    });

    socket.on('disconnect', () => {
      // rooms are cleaned up automatically by Socket.IO on disconnect
    });
  });

  console.log('🔌 Socket.IO initialised');
  return _io;
}

/** Get the initialised IO instance (usable anywhere after initSocket is called) */
function getIO() {
  if (!_io) throw new Error('Socket.IO has not been initialised. Call initSocket(server) first.');
  return _io;
}

module.exports = { initSocket, getIO };
