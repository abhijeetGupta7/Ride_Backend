const CaptainRepostory = require("../repositories/captain.repository");
const bcrypt = require("bcrypt");

class CaptainService {
    #captainRepository;

    constructor() {
        this.#captainRepository = new CaptainRepostory();
    }

    async registerCaptain({ firstname, lastname, email, password, color, plate, capacity, vehicleType }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const captain = await this.#captainRepository.create({
                fullname: {
                    firstname,
                    lastname
                },
                email,
                password: hashedPassword,
                vehicle: {
                    color,
                    plate,
                    capacity,
                    vehicleType
                }
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

}
module.exports = CaptainService;