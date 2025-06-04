const CaptainRepostory = require("../repositories/captain.repository");
const bcrypt = require("bcrypt");
const Captain = require("../models/captain.model");

class CaptainService {
  #captainRepository;

  constructor() {
    this.#captainRepository = new CaptainRepostory();
  }

  async registerCaptain({
    firstname,
    lastname,
    email,
    password,
    color,
    plate,
    capacity,
    vehicleType,
  }) {
    try {
      console.log("Working wokring");
      const hashedPassword = await bcrypt.hash(password, 10);
      const captain = await this.#captainRepository.create({
        fullname: {
          firstname,
          lastname,
        },
        email,
        password: hashedPassword,
        vehicle: {
          color,
          plate,
          capacity,
          vehicleType,
        },
      });

      return captain;
    } catch (error) {
      console.error("Error in registerCaptain:", error);
      throw error;
    }
  }

  async loginCaptain({ email, password }) {
    try {
      const captain = await this.#captainRepository.getUserByEmail(email);
      if (!captain) {
        throw new Error("Captain does not exist");
      }

      const isMatch = await captain.comparePassword(password);
      if (!isMatch) {
        throw new Error("Invalid email or password");
      }
      return captain;
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  }

  async getCaptain(captainId) {
    try {
      const captain = await this.#captainRepository.get(captainId);
      if (!captain) {
        throw new Error("Captain not found");
      }
      return captain;
    } catch (error) {
      console.error("Error in getCaptainProfile:", error);
      throw error;
    }
  }

  /**
   * Find active captains within a radius (in kilometers)
   * @param {[number, number]} center - [longitude, latitude]
   * @param {number} radiusKm - Search radius in kilometers
   * @param {string} vehicleType - Optional filter by vehicle type
   * @returns {Promise<Array>} Array of captain documents
   */
  async getCaptainsInRadius(center, radiusKm, vehicleType = null) {
    const query = {
      status: "active",
      lastActive: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // Active in last 30 mins
      location: {
        $geoWithin: {
          $centerSphere: [center, radiusKm / 6378.1], // Convert km to radians
        },
      },
    };

    if (vehicleType) {
      query["vehicle.vehicleType"] = vehicleType;
    }

    return await Captain.find(query)
      .select("-password") // Exclude sensitive data
      .limit(50); // Prevent over-fetching
  }

  /**
   * Update captain's location
   * @param {string} captainId
   * @param {[number, number]} coords - [longitude, latitude]
   */
  async updateLocation(captainId, coords) {
    const response = await Captain.findByIdAndUpdate(captainId, {
      location: {
        type: "Point",
        coordinates: coords,
      },
      lastActive: new Date(),
    });
    return response;
  }

  /**
   * Update captain's socket ID
   * @param {string} captainId
   * @param {string} socketId
   */
  async updateSocketId(captainId, socketId) {
    return await Captain.findByIdAndUpdate(captainId, { socketId });
  }
}
module.exports = CaptainService;
