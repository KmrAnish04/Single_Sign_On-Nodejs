const url = require("url")
const axios = require('axios');
const { URL } = url;
const { verifyJwtToken } = require("./jwt_verify");
const validReferOrigin = "http://sso.anishkmr.com:3010";
const ssoServerJWTURL = "http://localhost:3000/api/v1/auth/verifySSOToken";


const ssoRedirect = ()=>{
    return async function(req, res, next){
        console.info("Inside ssoRedirect()");
        const { ssoToken } = req.query;
        console.info("ssoToken: ", ssoToken);

        if(ssoToken){
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

                const { accessToken, refreshToken } = response.data.data;
                const decoded = await verifyJwtToken(accessToken);
                req.session.user = {
                    ...decoded, 
                    accessToken, 
                    refreshToken
                };


                console.log("saving data in session store", req.sessionID)

                // Register the sessionID in SSO server 
                const registerSIDResponse = await axios.post(
                    "http://localhost:3000/api/v1/auth/register-sessionid",
                    {userId: req.session.user.userId, sessionID: req.sessionID},
                    { headers: { Authorization: "Bearer l1Q7zkOL59cRqWBkQ12ZiGVW2DBL" } }    
                );

                console.log(registerSIDResponse)
                


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