let io;

const initSocket = (serverIo) => {
  io = serverIo;
  
  // Sockets authentication middleware
  io.use((socket, next) => {
    // We handle authentication differently as per requirements:
    // "Client must send auth token immediately after connect"
    // So we'll accept connection, then wait for 'authenticate' event
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Wait for authentication
    socket.on('authenticate', (data) => {
      try {
        const token = data.token.split(' ')[1]; // Bearer <token>
        if (!token) throw new Error('Token missing');
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        socket.userId = decoded.id;
        socket.role = decoded.role;
        
        // Join user's personal room for direct notifications
        socket.join(`user_${decoded.id}`);
        
        socket.emit('authenticated', { userId: decoded.id, role: decoded.role });
        
        console.log(`Socket ${socket.id} authenticated as user ${decoded.id} (${decoded.role})`);
        
      } catch (err) {
        socket.emit('unauthorized', { message: 'Authentication failed' });
        socket.disconnect();
      }
    });

    // We'll import and attach specific socket namespaces/handlers
    require('../sockets/tracking.socket')(io, socket);
    require('../sockets/notification.socket')(io, socket);
    require('../sockets/booking.socket')(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Handle offline status if worker
      if (socket.role === 'worker' && socket.userId) {
        // Emit offline event to relevant rooms
        io.emit('worker:status', { workerId: socket.userId, isOnline: false, lastSeen: new Date() });
      }
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};

module.exports = { initSocket, getIo };
