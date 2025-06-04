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
 * Gets distance (in km) and duration (in minutes) between two points.
 * Expects map service response: { distance: { text, value }, duration: { text, value } } , values are in meters and seconds respectively
 * @param {Object} pickup
 * @param {Object} destination
 * @returns {Promise<{distance: number, duration: number, raw: object}>}
 */
async function getDistanceAndDuration(pickup, destination) {
    const data = await MapsService.getDistanceAndDuration(pickup, destination);
    // data: { distance: { text, value }, duration: { text, value } }
    if (!data || !data.distance || !data.duration) {
        throw new Error('Could not get distance/duration from Google Maps API');
    }
    // Convert meters to km, seconds to minutes
    const distance = data.distance.value / 1000;
    const duration = data.duration.value / 60;
    return { distance, duration, raw: data };
}

/**
 * Calculates fare for a ride given distance and duration.
 * @param {number} distance - in km
 * @param {number} duration - in minutes
 * @param {string} vehicleType - 'car', 'auto', or 'bike'
 * @returns {number} - Calculated fare
 */
function calculateFareFromValues(distance, duration, vehicleType) {
    if (!['car', 'auto', 'bike'].includes(vehicleType)) {
        throw new Error('Invalid vehicle type. Must be "car", "auto", or "bike".');
    }
    return Math.round(
        BASE_FARE[vehicleType] +
        (distance * PER_KM_RATE[vehicleType]) +
        (duration * PER_MINUTE_RATE[vehicleType])
    );
}

/**
 * Calculates fare for a ride (all-in-one).
 * @param {Object} pickup
 * @param {Object} destination
 * @param {String} vehicleType
 * @returns {Promise<{fare: number, distance: number, duration: number}>}
 */
async function calculateFare(pickup, destination, vehicleType) {
    if (!pickup || !destination || !vehicleType) {
        throw new Error('Pickup, destination, and vehicleType are required');
    }
    const { distance, duration,raw } = await getDistanceAndDuration(pickup, destination);
    const fare = calculateFareFromValues(distance, duration, vehicleType);
    return { fare, distance, duration, raw };
}

/**
 * Gets distance and duration once, then returns fare/distance/duration for all vehicle types.
 * @param {Object} pickup
 * @param {Object} destination
 * @returns {Promise<Object>} - { car: {...}, auto: {...}, bike: {...} }
 */
async function getEstimatesForAllVehicleTypes(pickup, destination) {
    const { distance, duration, raw } = await getDistanceAndDuration(pickup, destination);
    const vehicleTypes = ['car', 'auto', 'bike'];
    const estimates = {};
    for (const type of vehicleTypes) {
        estimates[type] = {
            fare: calculateFareFromValues(distance, duration, type),
            distance,
            duration,
            raw
        };
    }
    return estimates;
}

module.exports = { calculateFare, getDistanceAndDuration, calculateFareFromValues, getEstimatesForAllVehicleTypes };