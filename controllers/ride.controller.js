const RideService = require("../services/ride.service");
const CaptainService = require("../services/captain.service");
const { StatusCodes } = require("http-status-codes");
const successResponse = require("../utils/common/success-reponse");
const errorResponse = require("../utils/common/error-response");
const {
  calculateFare,
  getEstimatesForAllVehicleTypes,
} = require("../utils/calculate-fare");
const { sendMessageToSocketId } = require("../socket");
const {
  storeNotifiedCaptains,
  getNotifiedCaptains,
  getCaptainSocket,
  clearNotifiedCaptains,
} = require("../utils/redisHelper");

const rideService = new RideService();
const captainService = new CaptainService();

async function createRide(req, res) {
  try {
    const { pickup, destination, vehicleType } = req.body;
    const user = req.user.userId;

    if (!pickup || !destination || !vehicleType) {
      errorResponse.message = "Missing required fields";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const ride = await rideService.createRide({
      user,
      pickup,
      destination,
      vehicleType,
    });

    successResponse.data = ride;
    successResponse.message = "Ride created successfully";
    res.status(StatusCodes.CREATED).json(successResponse);

    // Find nearby captains and notify them
    const nearbyCaptains = await captainService.getCaptainsInRadius(
      ride.pickup.coordinates.coordinates,
      1000,
      vehicleType
    );

    const rideWithUser = await rideService.getRideWithUserById(ride._id);

    const captainIds = [];
    for (const captain of nearbyCaptains) {
      if (captain.socketId) {
        sendMessageToSocketId(captain.socketId, {
          event: "new-ride",
          data: rideWithUser,
        });
        captainIds.push(captain._id.toString());
      }
    }

    // Store notified captain ids in redis
    if (captainIds.length > 0) {
      await storeNotifiedCaptains(ride._id.toString(), captainIds);
    }
  } catch (error) {
    console.error("Create ride error:", error);
    errorResponse.message = "Failed to create ride";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function acceptRide(req, res) {
  try {
    const { rideId, captainId } = req.body;

    if (!rideId || !captainId) {
      errorResponse.message = "Missing rideId or captainId";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const ride = await rideService.acceptRide({ rideId, captainId });
    if (!ride) {
      errorResponse.message = "Ride not found or not pending";
      return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
    }

    successResponse.data = ride;
    successResponse.message = "Ride accepted successfully";
    res.status(StatusCodes.OK).json(successResponse);

    // Notify user
    if (ride.user && ride.user.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: "driver-found",
        data: ride,
      });
    }

    // Notify other captains that ride was accepted
    const notifiedCaptainIds = await getNotifiedCaptains(ride._id.toString());

    for (const notifiedCaptainId of notifiedCaptainIds) {
      console.log('debug ride accepting all: ',notifiedCaptainId, captainId);
      if (notifiedCaptainId != captainId) {
        console.log('debug ride accepting: ',notifiedCaptainId, captainId);
        const captainSocketId = await getCaptainSocket(notifiedCaptainId);
        if (captainSocketId) {
          sendMessageToSocketId(captainSocketId, {
            event: "ride-request-already-accepted",
            data: ride,
          });
        }
      }
    }

    await clearNotifiedCaptains(ride._id.toString());
  } catch (error) {
    console.error("Accept ride error:", error);
    errorResponse.message = "Failed to accept ride";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function startRide(req, res) {
  try {
    const { rideId, otp } = req.body;

    if (!rideId || !otp) {
      errorResponse.message = "Missing rideId or OTP";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const ride = await rideService.startRide({ rideId, otp });
    if (!ride) {
      errorResponse.message = "Ride not found or OTP invalid";
      return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
    }

    successResponse.data = ride;
    successResponse.message = "Ride started successfully";
    res.status(StatusCodes.OK).json(successResponse);

    if (ride.user && ride.user.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: "ride-started",
        data: ride,
      });
    }
  } catch (error) {
    console.error("Start ride error:", error);
    errorResponse.message = "Failed to start ride";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function completeRide(req, res) {
  try {
    const { rideId } = req.body;
    const captainId = req.captain.captainId;

    if (!rideId) {
      errorResponse.message = "Missing rideId";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const ride = await rideService.completeRide({ rideId, captainId });
    if (!ride) {
      errorResponse.message = "Ride not found or not ongoing";
      return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
    }

    successResponse.data = ride;
    successResponse.message = "Ride completed successfully";
    res.status(StatusCodes.OK).json(successResponse);

    if (ride.user && ride.user.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: "ride-completed",
        data: ride,
      });
    }
  } catch (error) {
    console.error("Complete ride error:", error);
    errorResponse.message = "Failed to complete ride";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function addFeedback(req, res) {
  try {
    const { rideId, feedback } = req.body;

    if (!rideId || !feedback) {
      errorResponse.message = "Missing rideId or feedback";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const ride = await rideService.addFeedback({ rideId, feedback });
    successResponse.data = ride;
    successResponse.message = "Feedback added successfully";
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    console.error("Add feedback error:", error);
    errorResponse.message = "Failed to add feedback";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function cancelRide(req, res) {
  try {
    const { rideId } = req.body;

    if (!rideId) {
      errorResponse.message = "Missing rideId";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const ride = await rideService.cancelRide({ rideId });
    if (!ride) {
      errorResponse.message = "Ride not found or already completed";
      return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
    }

    successResponse.data = ride;
    successResponse.message = "Ride cancelled successfully";
    res.status(StatusCodes.OK).json(successResponse);

    // Notify all captains that were notified about this ride
    const notifiedCaptainIds = await getNotifiedCaptains(ride._id.toString());

    for (const captainId of notifiedCaptainIds) {
      const captainSocketId = await getCaptainSocket(captainId);
      if (captainSocketId) {
        sendMessageToSocketId(captainSocketId, {
          event: "ride-request-cancelled",
          data: ride,
        });
      }
    }

    await clearNotifiedCaptains(ride._id.toString());
  } catch (error) {
    console.error("Cancel ride error:", error);
    errorResponse.message = "Failed to cancel ride";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function getRideById(req, res) {
  try {
    const { rideId } = req.params;

    if (!rideId) {
      errorResponse.message = "Missing rideId";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const ride = await rideService.getRideById(rideId);
    if (!ride) {
      errorResponse.message = "Ride not found";
      return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
    }

    successResponse.data = ride;
    successResponse.message = "Ride fetched successfully";
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    console.error("Get ride by ID error:", error);
    errorResponse.message = "Failed to fetch ride";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function estimateFare(req, res) {
  try {
    const { pickup, destination, vehicleType } = req.body;

    if (!pickup || !destination || !vehicleType) {
      errorResponse.message = "Missing required fields";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const { fare, distance, duration } = await calculateFare(
      pickup,
      destination,
      vehicleType
    );

    successResponse.data = { fare, distance, duration };
    successResponse.message = "Fare estimated successfully";
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    console.error("Estimate fare error:", error);
    errorResponse.message = "Failed to estimate fare";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }
}

async function estimateFareForAllTypes(req, res) {
  try {
    const { pickup, destination } = req.query;

    if (!pickup || !destination) {
      errorResponse.message = "Missing pickup or destination";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const estimates = await getEstimatesForAllVehicleTypes(pickup, destination);
    successResponse.data = estimates;
    successResponse.message = "Fare estimates for all vehicle types";
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    console.error("Estimate all fares error:", error);
    errorResponse.message = "Failed to estimate fares";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }
}

module.exports = {
  createRide,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  addFeedback,
  getRideById,
  estimateFare,
  estimateFareForAllTypes,
};
