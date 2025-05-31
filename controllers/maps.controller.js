const MapsService = require('../services/maps.service');
const { StatusCodes } = require('http-status-codes');
const successResponse = require('../utils/common/success-reponse');
const errorResponse = require('../utils/common/error-response');

const mapsService = new MapsService();

async function getAddressCoordinates(req,res) {
    try {
        const { address } =req.query;
        const response = await mapsService.getAddressCoordinates(address);
        successResponse.data = response;
        successResponse.message = 'Coordinates fetched successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to fetch coordinates';
        errorResponse.error = error.error || error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);   
    }    
}

async function getDistanceAndDuration(req, res) {
    try {
        const { origin, destination } = req.query;
        const response = await mapsService.getDistanceAndDuration(origin, destination);
        successResponse.data = response;
        successResponse.message = 'Distance and duration fetched successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to fetch distance and duration';
        errorResponse.error = error.error || error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);   
    }
}

async function getAutoCompleteSuggestions(req, res) {
    try {
        const { input } = req.query;
        const response = await mapsService.getAutoCompleteSuggestions(input);
        successResponse.data = response;
        successResponse.message = 'Suggestions fetched successfully';
        return res.status(StatusCodes.OK).json(successResponse);
    } catch (error) {
        errorResponse.message = 'Failed to fetch suggestions';
        errorResponse.error = error.error || error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);   
    }
}

module.exports = {
    getAddressCoordinates,
    getDistanceAndDuration,
    getAutoCompleteSuggestions
}