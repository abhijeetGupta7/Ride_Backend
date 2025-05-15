const { StatusCodes } = require("http-status-codes");
const { verifyToken } = require("../utils/common/auth");
const errorResponse = require("../utils/common/error-response");
const blacklistedTokenModel = require("../models/blacklistedToken.model");

async function authenticateUser(req, res, next) {
    try {
        console.log("Request Headers:", req.headers);
        console.log("Request Cookies:", req.cookies);

        // Try to get token from Authorization header
        let token = null;

        if (req.cookies && req.cookies.token) {
            // Fallback: Try to get token from cookies
            console.log("Token from cookies:", req.cookies.token);
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } 

        if (!token) {
            throw new Error("No token provided or invalid token format");
        }

        const isBlacklistedToken = await blacklistedTokenModel.findOne({token: token})
        console.log("Is Blacklisted Token:", isBlacklistedToken);
        if (isBlacklistedToken) {
            throw new Error("Token is blacklisted");
        }

        const decoded = await verifyToken(token);
        req.user = decoded;
        console.log("Authenticated User:", req.user);
        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        errorResponse.message = "Failed to authenticate user";
        errorResponse.error = error.message || error;
        return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
    }
}

module.exports = {
    authenticateUser
};
