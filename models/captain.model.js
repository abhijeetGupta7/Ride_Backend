const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const captainSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength: [3, 'First name must be at least 3 characters long'],
    },
    lastname: {
      type: String,
      minlength: [3, 'Last name must be at least 3 characters long'],
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: [5, 'Email must be at least 5 characters long'],
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  socketId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  vehicle: {
    color: {
      type: String,
      required: true,
      minlength: [3, 'Color must be at least 3 characters long'],
    },
    plate: {
      type: String,
      required: true,
      minlength: [3, 'Plate must be at least 3 characters long'],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
    },
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'auto'],
      required: true,
    },
  },

  // Updated location field for geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (coords) => {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates. Expected [longitude, latitude]'
      }
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for fast geospatial queries
captainSchema.index({ location: '2dsphere' });

// Password comparison method
captainSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const Captain = mongoose.model('captain', captainSchema);
module.exports = Captain;