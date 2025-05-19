const UserRepository = require("../repositories/user.repository");
const { createToken, verifyToken } = require("../utils/common/auth");
const bcrypt = require("bcrypt");

class UserService {
    #userRepository;

    constructor() {
        this.#userRepository = new UserRepository();
    }

    async registerUser({ firstname, lastname, email, password }) {
        try {

            const hashedPassword = await bcrypt.hash(password, 10);
            
            const user = await this.#userRepository.create({
                fullname: {
                    firstname,
                    lastname
                },
                email,
                password: hashedPassword,
            });

            return user;
        } catch (error) {
            console.error("Error in registerUser:", error);
            throw error;
        }
    }

    async loginUser({ email, password }) {
        try {
            const user = await this.#userRepository.getUserByEmail(email);
            console.log(user);
            if (!user) {
                throw new Error("User does not exist");
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new Error("Invalid email or password");
            }
            return user;
        } catch (error) {
            console.error("Error in login:", error);
            throw error;
        }
    }

    // async authenticateUser(token) {
    //     try {
    //         const decodedToken = await verifyToken(token);

    //         const user = await this.#userRepository.get(decodedToken.userId);
    //         if (!user) {
    //             throw new Error("User not found");
    //         }

    //         return decodedToken;
    //     } catch (error) {
    //         console.error("Error in authenticateUser:", error);
    //         throw new Error("Authentication failed");
    //     }
    // }

    async getUser(userId) {
        try {
            return await this.#userRepository.get(userId);
        } catch (error) {
            console.error("Error in getUser:", error);
            throw new Error("Unable to fetch user");
        }
    }

    async getAll() {
        try {
            return await this.#userRepository.getAll();
        } catch (error) {
            console.error("Error in getAll:", error);
            throw new Error("Unable to fetch users");
        }
    }

    async updateUser(userId, updateData) {
        try {
            return await this.#userRepository.update(userId, updateData);
        } catch (error) {
            console.error("Error in updateUser:", error);
            throw new Error("Update failed");
        }
    }

    async deleteUser(userId) {
        try {
            return await this.#userRepository.deleteById(userId);
        } catch (error) {
            console.error("Error in deleteUser:", error);
            throw new Error("Deletion failed");
        }
    }
}

module.exports = UserService;
