const express= require('express');
const { body, query } = require('express-validator');
const validate = require('../../middlewares/validate');
const captainController = require('../../controllers/captain.controller');
const { authenticateCaptain } = require('../../middlewares/auth.middleware')

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

router.get('/captains-in-radius', [
    query('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    query('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    query('radius')
        .isInt({ min: 1 })
        .withMessage('Radius must be at least 1 km'),
    validate
], captainController.getCaptainsInRadius);

router.put('/update-location', [
    body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    validate
], authenticateCaptain, captainController.updateCaptainLocation)


module.exports = router;