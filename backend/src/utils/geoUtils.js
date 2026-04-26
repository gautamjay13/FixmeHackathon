// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const estimateETA = (distanceKm, averageSpeedKmh = 30) => {
  // Assuming average city speed of 30 km/h
  const timeHours = distanceKm / averageSpeedKmh;
  const timeMinutes = Math.round(timeHours * 60);
  
  if (timeMinutes < 60) {
    return `${timeMinutes} mins`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    return `${hours} hr ${mins} mins`;
  }
};

module.exports = { calculateDistance, estimateETA };
