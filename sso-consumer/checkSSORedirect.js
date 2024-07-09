const url = require("url")
const axios = require('axios');
const { URL } = url;
const { verifyJwtToken } = require("./jwt_verify");
const validReferOrigin = "http://sso.anishkmr.com:3010";
const ssoServerJWTURL = "http://127.0.0.1:3010/sso-server/verifytoken";


const ssoRedirect = ()=>{
    return async function(req, res, next){
        console.info("Inside ssoRedirect()");
        const { ssoToken } = req.query;
        console.info("ssoToken: ", ssoToken);

        if(ssoToken != null){
            const redirectURL = url.parse(req.url).pathname;
            try{
                const response = await axios.get(
                    `${ssoServerJWTURL}?ssoToken=${ssoToken}`,
                    {
                        headers: {
                            Authorization: "Bearer l1Q7zkOL59cRqWBkQ12ZiGVW2DBL"
                        }
                    }
                )

                const {token} = response.data;
                const decoded = await verifyJwtToken(token);
                req.session.user = decoded;
            }
            catch(err){
                return next(err);
            }

            return res.redirect(`${redirectURL}`);
        }

        return next();
    };
};


module.exports = ssoRedirect;