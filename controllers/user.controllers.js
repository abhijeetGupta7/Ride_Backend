const { StatusCodes } = require("http-status-codes");
const UserService = require("../services/user-service");
const { createToken, verifyToken } = require("../utils/common/auth");
const successReponse = require("../utils/common/success-reponse");
const errorResponse = require("../utils/common/error-response");


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


module.exports = { registerUser, loginUser };
