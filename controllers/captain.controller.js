const CaptainService = require('../services/captain.service');
const { StatusCodes } = require('http-status-codes');
const successReponse = require('../utils/common/success-reponse');
const errorResponse = require('../utils/common/error-response');
const { createToken, verifyToken } = require('../utils/common/auth');
const blacklistedTokenModel = require("../models/blacklistedToken.model");

const captainService = new CaptainService();

async function registerCaptain(req,res) {
    try {
        console.log('Registering Captain:', req.body);
        const { fullname, email, password, vehicle } = req.body;
        
        const captain = await captainService.registerCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password,
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
        });

        const token = await createToken({
            captainId: captain._id,
            captainEmail: captain.email
        })

        res.cookie('captainToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        
        successReponse.data = { captain, token };
        successReponse.message = 'Captain registered successfully';
        return res.status(StatusCodes.CREATED).json(successReponse);
    } catch (error) {
        console.error('Register Error:', error);
        errorResponse.message = 'Failed to register captain';
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
            captainEmail: captain.email
        });

        res.cookie('captainToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        successReponse.data = { captain, token };
        successReponse.message = 'Captain logged in successfully';
        return res.status(StatusCodes.OK).json(successReponse);
    } catch (error) {
        console.error('Login Error:', error);
        errorResponse.message = 'Failed to login captain';
        errorResponse.error = error.message || error;     // small fix, can be improved
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function getCaptainProfile(req, res) {
    try {
        const captainId = req.captain?.captainId;
        console.log('Captain ID:', captainId);
        const captain = await captainService.getCaptain(captainId);
        if (!captain) {
            errorResponse.message = 'Captain not found';
            return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
        }
        successReponse.data = captain ;
        successReponse.message = 'Captain profile retrieved successfully';
        return res.status(StatusCodes.OK).json(successReponse);
    } catch (error) {
        console.error('Get Captain Profile Error:', error);
        errorResponse.message = 'Failed to retrieve captain profile';
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

async function logoutCaptain(req, res) {
   let token;
    if (req.cookies && req.cookies.captainToken) {
        token = req.cookies.captainToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } 
    
    if (!token) {
        errorResponse.message = 'No token provided';
        return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }
    
    const decodedToken= await verifyToken(token);

    // Add the token to the blacklist
    await blacklistedTokenModel.create({
        jti:decodedToken.jti,
        token: token,
    });
    
    res.clearCookie('captainToken');
    successReponse.message = 'Captain logged out successfully';
    return res.status(StatusCodes.OK).json(successReponse);
}

module.exports = {
    registerCaptain,
    loginCaptain,
    getCaptainProfile,
    logoutCaptain
    
}