const jwt = require('jsonwebtoken');
const { privateCert } = require('../config/index.config.js').keys;

const ISSUER = "single-sign-on"

const genJwtToken = (payload)=>
    new Promise((resolve, reject)=>{
        console.log('payload :>> ', payload);
        jwt.sign({
            ...payload}, 
            privateCert,
            {
                issuer: ISSUER,
                algorithm: "RS256",
                expiresIn: "1h"
            },
            (err, token)=>{
                if(err){ return reject(err) }
                return resolve(token);
            }
        );
    });


module.exports = Object.assign({}, {genJwtToken});