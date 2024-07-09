const fs = require('fs');
const path = require('path');


const privateFileKeyPath = process.env.JWT_SSO_PRIVATE_KEY_FILE || 
                           path.resolve(__dirname, './jwtPrivate.key');

const privateCert = fs.readFileSync(privateFileKeyPath);

const jwtValidityKey = "sigle-sign-on-validity";

module.exports = Object.assign({}, {privateCert, jwtValidityKey});