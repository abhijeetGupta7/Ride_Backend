const jwt = require("jsonwebtoken");
const crypto = require("crypto"); 
const { JWT_SECRET, NODE_ENV } = require("../../config/server-config");

async function createToken(payload) {
    return new Promise((resolve, reject) => {
        // Add unique JTI and issued-at timestamp to payload
        const enhancedPayload = {
            ...payload,
            jti: crypto.randomBytes(16).toString("hex"), // Unique token ID
            iat: Math.floor(Date.now() / 1000) // Issued-at timestamp
        };

        jwt.sign(
            enhancedPayload,
            JWT_SECRET,
            { 
                expiresIn: '24h', 
                algorithm: 'HS256' 
            },
            (err, token) => {
                if (err) {
                    console.error("[JWT] Signing error:", err);
                    reject(err);
                    return;
                }
                if (NODE_ENV === "development") {
                    console.log("[JWT] Token created:", token); 
                }
                resolve(token);
            }
        );
    });
}

async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            JWT_SECRET,
            { 
                algorithms: ["HS256"], 
                ignoreExpiration: false // Enforce expiry checks
            },
            (err, decodedToken) => {
                if (err) {
                    console.error("[JWT] Verification failed:", err);
                    reject(err);
                    return;
                }
                resolve(decodedToken);
            }
        );
    });
}

module.exports = {
    createToken,
    verifyToken
};