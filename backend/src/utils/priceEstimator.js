const PRICING = {
  plumber: { visit: 200, perHour: 400, emergency: 800 },
  electrician: { visit: 250, perHour: 450, emergency: 900 },
  carpenter: { visit: 200, perHour: 350, emergency: 700 },
  painter: { visit: 200, perHour: 300, emergency: 600 },
  cleaner: { visit: 300, perHour: 250, emergency: 500 },
  ac_repair: { visit: 400, perHour: 600, emergency: 1200 },
  appliance_repair: { visit: 300, perHour: 500, emergency: 1000 },
  pest_control: { visit: 500, perHour: 400, emergency: 1000 },
};

const calculateEstimate = (serviceType, estimatedDurationHours, isEmergency = false, date = new Date()) => {
  const baseRates = PRICING[serviceType];
  if (!baseRates) throw new Error('Invalid service type');

  let multiplier = 1;
  const hour = date.getHours();
  const day = date.getDay();

  // Night hours (10pm - 6am)
  if (hour >= 22 || hour < 6) multiplier += 0.3;

  // Weekend (Sat, Sun)
  if (day === 0 || day === 6) multiplier += 0.2;

  // Cap multiplier at 1.8x
  if (multiplier > 1.8) multiplier = 1.8;

  let minAmount = 0;
  let maxAmount = 0;

  if (isEmergency) {
    minAmount = baseRates.emergency * multiplier;
    maxAmount = minAmount * 1.2; // 20% buffer for max
  } else {
    minAmount = (baseRates.visit + (baseRates.perHour * estimatedDurationHours)) * multiplier;
    maxAmount = minAmount * 1.2;
  }

  // Calculate 18% GST
  const gstRate = 0.18;
  const totalMin = Math.round(minAmount * (1 + gstRate));
  const totalMax = Math.round(maxAmount * (1 + gstRate));

  return {
    min: totalMin,
    max: totalMax,
    currency: 'INR',
    breakdown: {
      visitCharge: baseRates.visit,
      perHourRate: baseRates.perHour,
      estimatedHours: estimatedDurationHours,
      multiplier,
      gst: '18%'
    }
  };
};

module.exports = { PRICING, calculateEstimate };
