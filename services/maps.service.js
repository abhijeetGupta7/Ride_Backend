// map service for ride hailing app
const axios = require('axios');
const { GOOGLE_MAPS_API_KEY } = require('../config/server-config');

class MapsService {
    constructor() {
        this.apiKey = GOOGLE_MAPS_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api';
    }

    async getAddressCoordinates(address) {
        try {
            const response = await axios.get(`${this.baseUrl}/geocode/json`, {
                params: {
                    address,
                    key: this.apiKey
                },
            });

            const { data } = response;
            
            if (data.status === 'ZERO_RESULTS') {
                throw new Error('Address not found');
            }
            
            if (data.status !== 'OK') {
                throw new Error(`Google API error: ${data.status}`);
            }

            const {lng, lat } = data.results[0].geometry.location;
            return {lng, lat};
            
        } catch (error) {
            console.error('Geocoding failed:', error.message);
            throw new Error('Could not process address');
        }
    }    

    async getDistanceAndDuration(origin, destination) {
        try {
            const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
                params: {
                    origins: origin,
                    destinations: destination,
                    key: this.apiKey
                },
            });

            const { data } = response;

            if (data.status !== 'OK') {
                throw new Error(`Google API error: ${data.status}`);
            }

            const element = data.rows[0].elements[0];
            if (element.status !== 'OK') {
                throw new Error(`Distance Matrix API error: ${element.status}`);
            }

            return {
                distance: element.distance.text,
                duration: element.duration.text
            };
        } catch (error) {
            console.error('Distance and duration calculation failed:', error.message);
            throw new Error('Could not calculate distance and duration');
        }
    }

    async getAutoCompleteSuggestions(input) {
        try {
            const response = await axios.get(`${this.baseUrl}/place/autocomplete/json`, {
                params: {
                    input,
                    key: this.apiKey,
                },
            });

            const { data } = response;

            if (data.status !== 'OK') {
                throw new Error(`Google API error: ${data.status}`);
            }

            return data.predictions.map( prediction => ({
                // description: prediction.description,
                // placeId: prediction.place_id
                prediction
            }));
        } catch (error) {
            console.error('Autocomplete suggestions failed:', error.message);
            throw new Error('Could not fetch autocomplete suggestions');
        }
    }   
}

module.exports = MapsService;