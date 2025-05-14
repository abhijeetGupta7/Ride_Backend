const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config/server-config");

async function createToken(payload) {
    return new Promise((resolve,reject) => {
        jwt.sign(payload, JWT_SECRET, {expiresIn: '24h'}, (err,token)=>{
            if(err) {
                console.log(err);
                reject(err);
            }
            console.log('token created',token);
            resolve(token);   
        });
    });   
}


async function verifyToken(token) {
    return new Promise((resolve,reject)=>{
        jwt.verify(token,JWT_SECRET, (err,decodedToken) => {
            if(err) {
                console.log(err);
                reject(err);
            }
            resolve(decodedToken);
        });
    })
}

module.exports={
    createToken,
    verifyToken
}