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
        .select('+otp')
        .populate('captain')
        .populate('user');
    }

    async addFeedback(rideId, feedback) {
        return Ride.findByIdAndUpdate(
            rideId,
            { feedback },       //   { rating, comment }
            { new: true }
        );
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

    async getRideWithUserById(rideId) {
        return Ride.findById(rideId)
            .populate('user', '-passsword')
            .select('-otp');
    }
}


module.exports = RideRepository;