const Worker = require('../models/Worker.model');
const { estimateETA, calculateDistance } = require('../utils/geoUtils');

module.exports = (io, socket) => {
  socket.on('worker:location', async (data) => {
    try {
      if (socket.role !== 'worker') return;
      
      const { bookingId, lat, lng, heading, speed, accuracy } = data;
      
      // Update worker location in DB
      await Worker.findOneAndUpdate(
        { userId: socket.userId },
        { 
          location: { type: 'Point', coordinates: [lng, lat] },
          lastSeen: new Date(),
          isOnline: true
        }
      );

      // Need to calculate ETA if tracking a specific booking
      // For now, emit raw location update to the booking room
      if (bookingId) {
        // Find booking to get user destination for ETA (omitted here for brevity, assuming simple forwarding)
        // Ideally, would fetch booking, get coordinates, calc distance & ETA
        const distance = '2.3 km'; // Mock calculated distance
        const eta = '8 mins';      // Mock calculated ETA

        io.to(`booking_${bookingId}`).emit('worker:location:update', {
          lat, lng, heading, speed, accuracy, eta, distance
        });
      }
    } catch (error) {
      console.error('Tracking socket error:', error);
    }
  });

  socket.on('worker:online', async () => {
    if (socket.role !== 'worker') return;
    await Worker.findOneAndUpdate(
      { userId: socket.userId },
      { isOnline: true, lastSeen: new Date() }
    );
    io.emit('worker:status', { workerId: socket.userId, isOnline: true, lastSeen: new Date() });
  });

  socket.on('worker:offline', async () => {
    if (socket.role !== 'worker') return;
    await Worker.findOneAndUpdate(
      { userId: socket.userId },
      { isOnline: false, lastSeen: new Date() }
    );
    io.emit('worker:status', { workerId: socket.userId, isOnline: false, lastSeen: new Date() });
  });
};
