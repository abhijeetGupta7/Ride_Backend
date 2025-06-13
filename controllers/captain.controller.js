const CaptainService = require("../services/captain.service");
const { StatusCodes } = require("http-status-codes");
const successReponse = require("../utils/common/success-reponse");
const errorResponse = require("../utils/common/error-response");
const { createToken, verifyToken } = require("../utils/common/auth");
const blacklistedTokenModel = require("../models/blacklistedToken.model");

const captainService = new CaptainService();

async function registerCaptain(req, res) {
  try {
    // console.log('Registering Captain:', req.body);
    const { fullname, email, password, vehicle } = req.body;

    const captain = await captainService.registerCaptain({
      firstname: fullname.firstname,
      lastname: fullname.lastname,
      email,
      password,
      color: vehicle.color,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
    });

    const token = await createToken({
      captainId: captain._id,
      captainEmail: captain.email,
    });

    res.cookie("captainToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    successReponse.data = { captain, token };
    successReponse.message = "Captain registered successfully";
    return res.status(StatusCodes.CREATED).json(successReponse);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      errorResponse.message = "Captain already exists";
      errorResponse.error = `Email ${error.keyValue.email} is already registered`;
      return res.status(StatusCodes.CONFLICT).json(errorResponse);
    }
    console.error("Register Error:", error);
    errorResponse.message = "Failed to register captain";
    errorResponse.error = error || error.message;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function loginCaptain(req, res) {
  try {
    const { email, password } = req.body;
    const captain = await captainService.loginCaptain({ email, password });

    const token = await createToken({
      captainId: captain._id,
      captainEmail: captain.email,
    });

    res.cookie("captainToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    successReponse.data = { captain, token };
    successReponse.message = "Captain logged in successfully";
    return res.status(StatusCodes.OK).json(successReponse);
  } catch (error) {
    console.error("Login Error:", error);
    errorResponse.message = "Failed to login captain";
    errorResponse.error = error.message || error; // small fix, can be improved
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }
}

async function getCaptainProfile(req, res) {
  try {
    const captainId = req.captain?.captainId;
    // console.log('Captain ID:', captainId);
    const captain = await captainService.getCaptain(captainId);
    if (!captain) {
      errorResponse.message = "Captain not found";
      return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
    }
    successReponse.data = captain;
    successReponse.message = "Captain profile retrieved successfully";
    return res.status(StatusCodes.OK).json(successReponse);
  } catch (error) {
    console.error("Get Captain Profile Error:", error);
    errorResponse.message = "Failed to retrieve captain profile";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function logoutCaptain(req, res) {
  let token;
  if (req.cookies && req.cookies.captainToken) {
    token = req.cookies.captainToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    errorResponse.message = "No token provided";
    return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }

  const decodedToken = await verifyToken(token);

  // Add the token to the blacklist
  await blacklistedTokenModel.create({
    jti: decodedToken.jti,
    token: token,
  });

  res.clearCookie("captainToken");
  successReponse.message = "Captain logged out successfully";
  return res.status(StatusCodes.OK).json(successReponse);
}

async function getCaptainsInRadius(req, res) {
  try {
    const { latitude, longitude, radius, vehicleType } = req.query;
    if (!latitude || !longitude || !radius) {
      errorResponse.message = "Missing required parameters";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const center = [parseFloat(longitude), parseFloat(latitude)];
    const captains = await captainService.getCaptainsInRadius(
      center,
      radius,
      vehicleType
    );
    successReponse.data = captains;
    successReponse.message = "Captains fetched successfully";
    return res.status(StatusCodes.OK).json(successReponse);
  } catch (error) {
    console.error("Get Captains In Radius Error:", error);
    errorResponse.message = "Failed to fetch captains in radius";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function updateCaptainLocation(req, res) {
  try {
    const { latitude, longitude } = req.body;
    const captainId = req.captain?.captainId;

    if (!latitude || !longitude) {
      errorResponse.message = "Latitude and longitude are required";
      return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    const coords = [parseFloat(longitude), parseFloat(latitude)];
    const updatedCaptain = await captainService.updateLocation(
      captainId,
      coords
    );
    successReponse.data = updatedCaptain;
    successReponse.message = "Captain location updated successfully";
    return res.status(StatusCodes.OK).json(successReponse);
  } catch (error) {
    console.error("Update Captain Location Error:", error);
    errorResponse.message = "Failed to update captain location";
    errorResponse.error = error.message || error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

module.exports = {
  registerCaptain,
  loginCaptain,
  getCaptainProfile,
  logoutCaptain,
  getCaptainsInRadius,
  updateCaptainLocation,
};
