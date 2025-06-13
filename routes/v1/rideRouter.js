const express = require('express');
const { body, query } = require('express-validator');
const rideController = require('../../controllers/ride.controller');
const validate = require('../../middlewares/validate');
const { authenticateUser, authenticateCaptain } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', [
    body('pickup').notEmpty(),
    body('destination').notEmpty(),
    body('vehicleType').isIn(['car', 'auto', 'bike']),
    validate
], authenticateUser, rideController.createRide);

router.patch('/accept', [
    body('rideId').notEmpty(),
    body('captainId').notEmpty(),
    validate
], authenticateCaptain, rideController.acceptRide);

router.patch('/start', [
    body('rideId').notEmpty(),
    body('otp').notEmpty(),
    validate
], authenticateCaptain, rideController.startRide);

router.patch('/complete', [
    body('rideId').notEmpty(),
    validate
], authenticateCaptain,rideController.completeRide);

router.patch('/feedback', [
    body('rideId').notEmpty(),
    body('feedback').notEmpty(),
    validate
], authenticateUser, rideController.addFeedback);

router.patch('/cancel', [
    body('rideId').notEmpty(),
    validate
], authenticateUser, rideController.cancelRide);

// Estimate fare for a single vehicle type
router.get('/estimate-fare', [
    query('pickup').notEmpty(),
    query('destination').notEmpty(),
    query('vehicleType').isIn(['car', 'auto', 'bike']),
    validate
], rideController.estimateFare);

// Estimate fare for all vehicle types
router.get('/estimate-fare-all', [
    query('pickup').notEmpty(),
    query('destination').notEmpty(),
    validate
],rideController.estimateFareForAllTypes);



module.exports = router;