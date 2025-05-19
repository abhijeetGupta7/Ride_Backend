const express= require('express');
const { body } = require('express-validator');
const validate = require('../../middlewares/validate');
const captainController = require('../../controllers/captain.controller');
const { authenticateCaptain } = require('../../middlewares/auth.middleware');

const router=express.Router();

router.post('/register', [
    body('fullname.firstname')
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 characters long'),
    body('email')
        .isEmail()
        .withMessage('Invalid Email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('vehicle.color')
        .isLength({ min: 3 })
        .withMessage('Color must be at least 3 characters long'),
    body('vehicle.plate')
        .isLength({ min: 3 })
        .withMessage('Plate must be at least 3 characters long'),
    body('vehicle.capacity')
        .isInt({min: 1})
        .withMessage('Capacity must be at least 1'),
    body('vehicle.vehicleType')
        .isIn(['car', 'bike', 'auto']) 
        .withMessage('Vehicle type must be one of the following: car, bike, auto'),   
    validate
], captainController.registerCaptain);


router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Invalid Email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    validate
], captainController.loginCaptain);


router.get('/profile', authenticateCaptain, captainController.getCaptainProfile);

router.post('/logout', captainController.logoutCaptain);


module.exports = router;