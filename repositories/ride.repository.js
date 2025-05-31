const Ride = require("../models/ride.model");
const CrudRepository = require("./crud.respository");

class RideRepository extends CrudRepository {
    constructor() {
        super(Ride);
    }

    async findByUserId(userId, status=null) {
        const query = { user:userId };
        if (status) {
            query.status = status;
        }
        return Ride.find(query)
            .populate('captain', 'fullname vehicle')
            .populate('user', 'fullname')
            .sort({ createdAt: -1 });
            // later we can add skip and limit for pagination
    }


    async findByCaptainId(captainId, status=null) {
        const query = { captain:captainId };
        if (status) {
            query.status = status;
        }
        return Ride.find(query)
            .populate('captain', 'fullname vehicle')
            .populate('user', 'fullname')
            .sort({ createdAt: -1 });
            // later we can add skip and limit for pagination
    }

    async updateRideIfStatus(queryObj, updatedObj) {
        return Ride.findOneAndUpdate(
            queryObj,
            { $set: updatedObj },  // updatedObj can contain status, duration, fare, etc.
            { new: true }          // return the updated document
        )
        .populate('captain', 'fullname vehicle')
        .populate('user', 'fullname');
    }

    async addFeedback(rideId, feedback) {
        return Ride.findByIdAndUpdate(
            rideId,
            { feedback },       //   { rating, comment }
            { new: true }
        );
    }

    async findPendingRidesNearPickup(coords, radiusKm = 3) {   //  coords: [longitude, latitude]
        return Ride.find({
            status: 'pending',
            "pickup.coordinates": {
                $nearSphere: {
                    $geometry: { type: "Point", coordinates: coords },
                    $maxDistance: radiusKm * 1000 // meters
                }
            }
        });
    }   
    
    async findRideByIdWithOtp(rideId) {
        return Ride.findById(rideId)
            .select('+otp')
            .populate('captain')
            .populate('user')
    }

    async cancelRide(rideId, reason) {
        return Ride.findByIdAndUpdate(
            rideId,
            {
                status: 'cancelled',
                cancellationReason: reason,
                cancelledAt: new Date()
            },
            { new: true }
        )
        .populate('captain', 'fullname vehicle')
        .populate('user', 'fullname');
    }

    // later add payment feature
    async addPaymentDetails(rideId, paymentDetails) {
    return Ride.findByIdAndUpdate(
        rideId,
        { paymentDetails },
        { new: true }
    );
}
}


module.exports = RideRepository;