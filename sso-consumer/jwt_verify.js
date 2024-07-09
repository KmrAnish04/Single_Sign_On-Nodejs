const jwt = require('jsonwebtoken');
const { publicKey } = require('./config/index.config.js').keys;

const ISSUER = "single-sign-on";

const verifyJwtToken = (token) =>
    new Promise((resolve, reject) => {
        console.log('token :>> ', token);
        jwt.verify(
            token,
            publicKey, {
                issuer: ISSUER,
                algorithms: ["RS256"]
            },
            (err, decode) => {
                if (err) {
                    return reject(err);
                }
                return resolve(decode);
            }
        );
    });


module.exports = Object.assign({}, {
    verifyJwtToken
});