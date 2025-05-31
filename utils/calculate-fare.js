const MapService = require('../services/maps.service'); 
const MapsService = new MapService();

// Base fares and rates per vehicle type
const BASE_FARE = {
    car: 50,
    auto: 30,
    bike: 20
};

const PER_KM_RATE = {
    car: 15,
    auto: 10,
    bike: 8
};

const PER_MINUTE_RATE = {
    car: 3,
    auto: 2,
    bike: 1.5
};

/**
 * Calculates fare for a ride.
 * @param {Object} pickup - Pickup location (should have coordinates/address)
 * @param {Object} destination - Destination location (should have coordinates/address)
 * @param {String} vehicleType - 'car', 'auto', or 'bike'
 * @returns {Promise<Number>} - Calculated fare
 */
async function calculateFare(pickup, destination, vehicleType) {
    if (!pickup || !destination || !vehicleType) {
        throw new Error('Pickup, destination, and vehicleType are required');
    }

    if (!['car', 'auto', 'bike'].includes(vehicleType)) {
        throw new Error('Invalid vehicle type. Must be "car", "auto", or "bike".');
    }

    // Get distance and duration (in km and minutes)
    const { distance, duration } = await MapsService.getDistanceAndDuration(pickup, destination);

    // Extract numeric values (e.g., "5 km" → 5, "15 mins" → 15)
    const distanceValue = parseFloat(distance.split(' ')[0]);
    const durationValue = parseFloat(duration.split(' ')[0]);

    // Calculate fare
    const fare = Math.round(
        BASE_FARE[vehicleType] +
        (distanceValue * PER_KM_RATE[vehicleType]) +
        (durationValue * PER_MINUTE_RATE[vehicleType])
    );

    return { fare, distance, duration };
}

module.exports = { calculateFare };