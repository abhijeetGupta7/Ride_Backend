const RideService = require('../services/ride.service');
const { StatusCodes } = require('http-status-codes');
const successResponse = require('../utils/common/success-reponse');
const errorResponse = require('../utils/common/error-response');
const { calculateFare, getEstimatesForAllVehicleTypes } = require('../utils/calculate-fare');

const rideService = new RideService();

async function createRide(req, res) {
    try {
        const { pickup, destination, vehicleType } = req.body;
        const user = req.user.userId; 
        const ride = await rideService.createRide({ user, pickup, destination, vehicleType });
        successResponse.data = ride;
        successResponse.message = 'Ride created successfully';
        return res.status(StatusCodes.CREATED).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to create ride';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function acceptRide(req, res) {
    try {
        const { rideId, captainId } = req.body;
        const ride = await rideService.acceptRide({ rideId, captainId });
        if (!ride) {
            errorResponse.message = 'Ride not found or not pending';
            return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
        }
        successResponse.data = ride;
        successResponse.message = 'Ride accepted successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to accept ride';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function startRide(req, res) {
    try {
        const { rideId, otp, captainId } = req.body;
        const ride = await rideService.startRide({ rideId, otp, captainId });
        if (!ride) {
            errorResponse.message = 'Ride not found or OTP invalid';
            return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
        }
        successResponse.data = ride;
        successResponse.message = 'Ride started successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to start ride';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function completeRide(req, res) {
    try {
        const { rideId, duration } = req.body;
        const ride = await rideService.completeRide({ rideId, duration });
        if (!ride) {
            errorResponse.message = 'Ride not found or not ongoing';
            return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
        }
        successResponse.data = ride;
        successResponse.message = 'Ride completed successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to complete ride';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function cancelRide(req, res) {
    try {
        const { rideId, reason } = req.body;
        const ride = await rideService.cancelRide({ rideId, reason });
        if (!ride) {
            errorResponse.message = 'Ride not found or already completed';
            return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
        }
        successResponse.data = ride;
        successResponse.message = 'Ride cancelled successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to cancel ride';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function getUserRides(req, res) {
    try {
        const { userId, status } = req.query;
        const rides = await rideService.getUserRides({ userId, status });
        successResponse.data = rides;
        successResponse.message = 'User rides fetched successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to fetch user rides';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function getCaptainRides(req, res) {
    try {
        const { captainId, status } = req.query;
        const rides = await rideService.getCaptainRides({ captainId, status });
        successResponse.data = rides;
        successResponse.message = 'Captain rides fetched successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to fetch captain rides';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function addFeedback(req, res) {
    try {
        const { rideId, feedback } = req.body;
        const ride = await rideService.addFeedback({ rideId, feedback });
        successResponse.data = ride;
        successResponse.message = 'Feedback added successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to add feedback';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function findNearbyPendingRides(req, res) {
    try {
        const { coords, radiusKm } = req.query;
        const rides = await rideService.findNearbyPendingRides({ coords: coords.map(Number), radiusKm: Number(radiusKm) });
        successResponse.data = rides;
        successResponse.message = 'Nearby pending rides fetched successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to fetch nearby pending rides';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function getRideById(req, res) {
    try {
        const { rideId } = req.params;
        const ride = await rideService.getRideById(rideId);
        if (!ride) {
            errorResponse.message = 'Ride not found';
            return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
        }
        successResponse.data = ride;
        successResponse.message = 'Ride fetched successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to fetch ride';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

// Estimate fare for a single vehicle type
async function estimateFare(req, res) {
    try {
        const { pickup, destination, vehicleType } = req.body;
        const { fare, distance, duration } = await calculateFare(pickup, destination, vehicleType);
        successResponse.data = { fare, distance, duration };
        successResponse.message = 'Fare estimated successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to estimate fare';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }
}

// Estimate fare for all vehicle types
async function estimateFareForAllTypes(req, res) {
    try {
        const { pickup, destination } = req.query;
        const estimates = await getEstimatesForAllVehicleTypes(pickup, destination);
        successResponse.data = estimates;
        successResponse.message = 'Fare estimates for all vehicle types';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to estimate fares';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }
}

// Add these to your exports:
module.exports = {
    createRide,
    acceptRide,
    startRide,
    completeRide,
    cancelRide,
    getUserRides,
    getCaptainRides,
    addFeedback,
    findNearbyPendingRides,
    getRideById,
    estimateFare,
    estimateFareForAllTypes
};