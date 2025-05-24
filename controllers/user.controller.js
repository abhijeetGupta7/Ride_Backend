const { StatusCodes } = require("http-status-codes");
const UserService = require("../services/user.service");
const { createToken, verifyToken } = require("../utils/common/auth");
const successReponse = require("../utils/common/success-reponse");
const errorResponse = require("../utils/common/error-response");
const blacklistedTokenModel = require("../models/blacklistedToken.model");
const { NODE_ENV } = require("../config/server-config");

const userService = new UserService();

async function registerUser(req, res) {
    try {
        const { fullname, email, password } = req.body;

        const user = await userService.registerUser({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password
        });

        const token = await createToken({
            userId:user._id,
            userEmail:user.email
        }); 

      
        res.cookie("userToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        maxAge: 24 * 60 * 60 * 1000  // 1 day
        });
      
        successReponse.data = { user, token };
        successReponse.message = "User registered successfully";
        return res.status(StatusCodes.CREATED).json(successReponse);

    } catch (error) {
        console.error("Register Error:", error);
        errorResponse.message = "Failed to register user";
        errorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

// TODO: Remove password from the response before returning user data
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        const user = await userService.loginUser({ email, password });  
    
        const token = await createToken({
            userId: user._id,
            userEmail: user.email
        });

        res.cookie("userToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        maxAge: 24 * 60 * 60 * 1000
        });

    
        successReponse.data = { user, token };
        successReponse.message = "User logged in successfully"; 
        return res.status(StatusCodes.OK).json(successReponse);        
    } catch (error) {
        console.error("Login Error:", error);
        errorResponse.message = "Failed to login user";
        errorResponse.error = error.message || error;     // small fix, can be improved
        return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
    }
}

async function getUserProfile(req, res) {
    try {
        const userId = req.user?.userId;
        const user = await userService.getUser(userId);
        if (!user) {
            errorResponse.message = "User not found";
            return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
        }
        successReponse.data = user;
        successReponse.message = "User profile retrieved successfully";
        return res.status(StatusCodes.OK).json(successReponse);
    } catch (error) {
        console.error("Get User Profile Error:", error);
        errorResponse.message = "Failed to retrieve user profile";
        errorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}


async function logoutUser(req, res) {
    try {
        let token;

        // Extract from cookie
        if (req.cookies?.userToken) {
            token = req.cookies.userToken;
        }
        // Extract from Authorization header
        else if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "No token provided for logout"
            });
        }

        // Save to blacklist
        await blacklistedTokenModel.create({
            token,
        });
        // Clear the cookie
        res.clearCookie("userToken");
        successReponse.message = "User logged out successfully";
        return res.status(StatusCodes.OK).json(successReponse);

    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to logout",
            error: error.message
        });
    }
}

module.exports = { registerUser, loginUser, getUserProfile, logoutUser };
