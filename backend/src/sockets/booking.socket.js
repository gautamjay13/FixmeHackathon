module.exports = (io, socket) => {
  // Join a specific booking room to get updates
  socket.on('booking:join', ({ bookingId }) => {
    socket.join(`booking_${bookingId}`);
    console.log(`Socket ${socket.id} joined booking_${bookingId}`);
  });

  socket.on('booking:leave', ({ bookingId }) => {
    socket.leave(`booking_${bookingId}`);
  });

  // Most booking events will be emitted from the REST controllers
  // e.g., when a booking is created, the controller will do:
  // getIo().emit('booking:new', { booking }) 
  // or getIo().to(`user_${userId}`).emit('booking:accepted', { booking, worker })
};
