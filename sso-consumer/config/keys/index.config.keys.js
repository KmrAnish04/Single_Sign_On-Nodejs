const fs = require("fs");
const path = require("path");

const publicKeyFilePath = process.env.JWT_CW_PUBLIC_KEY_FILE || 
                          path.resolve(__dirname, './jwtPublic.key');

const publicKey = fs.readFileSync(publicKeyFilePath);
const jwtValidityKey = "sigle-sign-on-validity";

module.exports = Object.assign({}, {publicKey, jwtValidityKey});
