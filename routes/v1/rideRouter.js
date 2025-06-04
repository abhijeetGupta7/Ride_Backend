const express = require('express');
const { body, query } = require('express-validator');
const rideController = require('../../controllers/ride.controller');
const validate = require('../../middlewares/validate');
const { authenticateUser } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', [
    body('pickup').notEmpty(),
    body('destination').notEmpty(),
    body('vehicleType').isIn(['car', 'auto', 'bike']),
    validate
], authenticateUser, rideController.createRide);

router.post('/accept', [
    body('rideId').notEmpty(),
    body('captainId').notEmpty(),
    validate
], rideController.acceptRide);

router.post('/start', [
    body('rideId').notEmpty(),
    body('otp').notEmpty(),
    body('captainId').notEmpty(),
    validate
], rideController.startRide);

router.post('/complete', [
    body('rideId').notEmpty(),
    body('duration').optional().isNumeric(),
    validate
], rideController.completeRide);

router.post('/cancel', [
    body('rideId').notEmpty(),
    body('reason').notEmpty(),
    validate
], rideController.cancelRide);

router.get('/user-rides', [
    query('userId').notEmpty(),
    query('status').optional(),
    validate
], rideController.getUserRides);

router.get('/captain-rides', [
    query('captainId').notEmpty(),
    query('status').optional(),
    validate
], rideController.getCaptainRides);

router.post('/feedback', [
    body('rideId').notEmpty(),
    body('feedback').notEmpty(),
    validate
], rideController.addFeedback);

router.get('/nearby', [
    query('coords').isArray({ min: 2, max: 2 }),
    query('radiusKm').optional().isNumeric(),
    validate
], rideController.findNearbyPendingRides);

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

// router.get('/:rideId', [
//     param('rideId').notEmpty(),
//     validate
// ], rideController.getRideById);


module.exports = router;