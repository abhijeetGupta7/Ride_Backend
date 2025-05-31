const { query } = require('express-validator');
const mapsController = require('../../controllers/maps.controller');
const validate  = require('../../middlewares/validate');

const router = require('express').Router();

router.get('/coordinates', [
    query('address')
        .isString()
        .withMessage('Address must be a string')
        .notEmpty()
        .withMessage('Address cannot be empty')
        .isLength({ min: 3 })
        .withMessage('Address must be at least 3 characters long'),
    validate
], mapsController.getAddressCoordinates);

router.get('/distance-duration', [
    query('origin')
        .isString()
        .withMessage('Origin must be a string')
        .notEmpty()
        .withMessage('Origin cannot be empty'),
    query('destination')
        .isString()
        .withMessage('Destination must be a string')
        .notEmpty()
        .withMessage('Destination cannot be empty'),
    validate
], mapsController.getDistanceAndDuration);    

router.get('/auto-suggestions', [
    query('input')
        .isString()
        .withMessage('Input must be a string')
        .notEmpty()
        .withMessage('Input cannot be empty'),
    validate
], mapsController.getAutoCompleteSuggestions);

module.exports = router;
