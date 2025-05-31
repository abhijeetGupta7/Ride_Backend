const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },
  captain: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'captain',
    required: false // Assigned after ride is accepted
  },
  pickup: {
    address: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { 
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: coords =>
            coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 &&
            coords[1] >= -90 && coords[1] <= 90,
          message: 'Invalid pickup coordinates. Expected [longitude, latitude]'
        }
      }
    }
  },
  destination: {
    address: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { 
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: coords =>
            coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 &&
            coords[1] >= -90 && coords[1] <= 90,
          message: 'Invalid destination coordinates. Expected [longitude, latitude]'
        }
      }
    }
  },
  fare: { 
    type: Number, 
    required: true,
    min: 0 
  },
  status: { 
    type: String,
    enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
    default: 'pending'
  },
  duration: {        // in min
    type: Number, 
    min: 0,
    set: v => Math.round(v),
    required: false
  },
  distance: {       // in km
    type: Number, 
    min: 0,
    required: false
  },
  paymentDetails: {
    transactionId: { type: String, select: false },
    method: { type: String, enum: ['card', 'wallet', 'cash'] },
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },
  },
  vehicleType: {
    type: String,
    enum: ['car', 'auto', 'bike'],
    required: true
  },
  otp: { 
    type: String, 
    select: false, 
  },
  cancelledAt: Date,
  cancellationReason: { 
    type: String,
    enum: ['user', 'captain', 'system', 'payment_failed'],
    required: function() { return this.status === 'cancelled'; }
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 }
  }
}, { 
  timestamps: true 
});

// Geospatial indexes for pickup and destination
rideSchema.index({ "pickup.coordinates": "2dsphere" });
rideSchema.index({ "destination.coordinates": "2dsphere" });

// Other useful indexes
rideSchema.index({ user: 1, status: 1 });
rideSchema.index({ captain: 1, status: 1 });
rideSchema.index({ createdAt: -1 });
rideSchema.index({ status: 1, createdAt: -1 }); 

const rideModel = mongoose.model("Ride", rideSchema);

module.exports = rideModel;