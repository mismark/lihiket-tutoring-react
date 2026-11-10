const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');
const config     = require('./index');

// Singleton — set once in server.js, read anywhere via getIO()
let _io = null;

// ── Online presence: track connected userIds ──────────────────────────────────
const _onlineUsers = new Set();   // Set of userId strings

function getOnlineUserIds() {
  return Array.from(_onlineUsers);
}

/**
 * Attach Socket.IO to the HTTP server, wire auth middleware,
 * and set up per-connection event handling.
 */
function initSocket(httpServer) {
  _io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
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

    // Mark user as online and broadcast to everyone
    _onlineUsers.add(uid);
    _io.emit('presence:online', uid);

    // Personal room for direct notifications
    socket.join(`user:${uid}`);

    socket.on('chat:join',  (cid) => { if (cid) socket.join(`chat:${cid}`); });
    socket.on('chat:leave', (cid) => { if (cid) socket.leave(`chat:${cid}`); });

    socket.on('disconnect', () => {
      _onlineUsers.delete(uid);
      _io.emit('presence:offline', uid);
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

module.exports = { initSocket, getIO, getOnlineUserIds };
