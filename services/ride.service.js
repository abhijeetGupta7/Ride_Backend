const RideRepository = require("../repositories/ride.repository");
const { calculateFare } = require("../utils/calculate-fare");
const { generateOtp } = require("../utils/generateOtp");
const MapsService = require("./maps.service");

const mapsService = new MapsService();

class RideService {
    #rideRepository;

    constructor() {
        this.#rideRepository = new RideRepository();
    }

    async createRide({ user, pickup, destination, vehicleType }) {
        try {
            
            if(!['car', 'auto', 'bike'].includes(vehicleType)) {
                throw new Error('Invalid vehicle type. Must be "car", "auto", or "bike".');
            }   

            const {fare, distance, duration} = await calculateFare(pickup, destination, vehicleType);
            const otp=generateOtp(5);
            
            const pickupCoords = await mapsService.getAddressCoordinates(pickup);
            const destinationCoords = await mapsService.getAddressCoordinates(destination)
            if (!pickupCoords || !destinationCoords) {
                throw new Error("Invalid pickup or destination address");
            }   
            const ride = await this.#rideRepository.create({
                user,
                pickup:{
                    address: pickup,
                    coordinates: {
                        type: 'Point',
                        coordinates: [ pickupCoords.lng, pickupCoords.lat ]
                    }
                },
                destination: {
                    address: destination,
                    coordinates: {
                        type: 'Point',
                        coordinates: [ destinationCoords.lng, destinationCoords.lat ]
                    }
                },
                fare,
                vehicleType, 
                otp,
                distance,
                duration,
                status: 'pending'
            });
            return ride;
        } catch (error) {
            console.error("Error in createRide:", error);
            throw error;
        }
    }

    async acceptRide({ rideId, captainId }) {
        try {
            const ride = await this.#rideRepository.updateRideIfStatus(
                { _id: rideId, status: 'pending' }, 
                { status: 'accepted', captain: captainId }
            )
            return ride;
        } catch (error) {
            console.error("Error in confirmRide:", error);
            throw error;
        }
    }

    async startRide({rideId, otp, captainId}) {
        try {
            
            const ride = await this.#rideRepository.updateRideIfStatus(
                { _id: rideId, status: 'accepted', otp: otp },
                { status: 'ongoing', captain: captainId }
            )

            return ride;
        } catch (error) {
            console.error("Error in startRide:", error);
            throw error;
        }
    }

    async completeRide({rideId, duration}) {
        try {

            // later on we can add extra logic to recalculate fare based on certain conditions like traffic, route taken, user kept waiting, etc.
            
            let updatedObject = { status: 'completed' };
            if(duration) {
                updatedObject.duration = duration;
            }

            const ride = await this.#rideRepository.updateRideIfStatus(
                { _id: rideId, status: 'ongoing' },
                updatedObject
            );
            return ride;
        } catch (error) {
            console.error("Error in completeRide:", error);
            throw error;
        }
    }

    async cancelRide({rideId, reason}) {
        try {
            let ride = await this.#rideRepository.get(rideId);
            if (!ride || ride.status === 'completed') {
                throw new Error("Ride not found or already completed");
            }

            ride = await this.#rideRepository.cancelRide(rideId, reason);
            return ride;
        } catch (error) {
            console.error("Error in cancelRide:", error);
            throw error;
        }
    }

    async getUserRides({userId, status = null}) {
        try {
            return await this.#rideRepository.findByUserId(userId, status);
        } catch (error) {
            console.error("Error in getUserRides:", error);
            throw error;
        }
    }

    async getCaptainRides({captainId, status = null}) {
        try {
            return await this.#rideRepository.findByCaptainId(captainId, status);
        } catch (error) {
            console.error("Error in getCaptainRides:", error);
            throw error;
        }
    }

    async addFeedback({rideId, feedback}) {
        try {
            return await this.#rideRepository.addFeedback(rideId, feedback);
        } catch (error) {
            console.error("Error in addFeedback:", error);
            throw error;
        }
    }

    async findNearbyPendingRides({coords, radiusKm = 3}) {
        try {
            return await this.#rideRepository.findPendingRidesNearPickup(coords, radiusKm);
        } catch (error) {
            console.error("Error in findNearbyPendingRides:", error);
            throw error;
        }
    }

    async getRideById(rideId) {
        try {
            return await this.#rideRepository.get(rideId);
        } catch (error) {
            console.error("Error in getRideById:", error);
            throw error;
        }
    }

    async addPaymentDetails({ rideId, paymentDetails }) {
        try {
            // temp payment details we can add, later in feature integrate with payment gateway
            return await this.#rideRepository.addPaymentDetails(rideId, paymentDetails);
        } catch (error) {
            console.error("Error in addPaymentDetails:", error);
            throw error;
        }
    }

    
}

module.exports = RideService;