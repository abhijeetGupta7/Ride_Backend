const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const userController = require('../../controllers/user.controller');
const validate = require('../../middlewares/validate');
const { authenticateUser } = require('../../middlewares/auth.middleware');

router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname')
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 characters long'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    validate 
], userController.registerUser);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    validate 
], userController.loginUser);


router.get('/profile',authenticateUser, userController.getUserProfile);

router.post('/logout', userController.logoutUser);


module.exports = router;
