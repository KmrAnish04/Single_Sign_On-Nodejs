const { v4: uuidv4 } = require('uuid');
const Hashids = require("hashids");
const URL = require("url").URL;

const hashids = new Hashids();
const { genJwtToken } = require("./jwt_helper.js");

const re = /(\S+)\s+(\S+)/;
const AUTH_HEADER = "authorization";
const BEARER_AUTH_SCHEME = "bearer";



const deHyphenatedUUID = () => uuidv4().replace(/-/gi, "");
const encodedId = () => hashids.encodeHex(deHyphenatedUUID());

const userDB = {
    "info@anishKumar.com": {
        password: "test",
        userId: encodedId(), // incase you dont want to share the user-email.
        appPolicy: {
            sso_consumer: {
                role: "admin",
                shareEmail: true
            },
            singleSignOn_consumer: {
                role: "user",
                shareEmail: false
            },
            local_consumer: {
                role: "user",
                shareEmail: false
            }

        }
    }
};

const appTokenDB = {
    sso_consumer: "l1Q7zkOL59cRqWBkQ12ZiGVW2DBL",
    local_consumer: "l1Q7zkOL59cRqWBkQ12ZiGVW2DBL",
    singleSignOn_consumer: "1g0jJwGmRQhJwvwNOrY4i90kD0m"
};

const allowOrigin = {
    "http://consumer.anishkmr.in:3020": true,
    "http://consumertwo.anishkmr.in:3030": true,
    "http://sso.anishkmr.in:3080": false,

    "http://127.0.0.1:3020": true
};

const originAppName = {
    "http://consumer.anishkmr.in:3020": "sso_consumer",
    "http://consumertwo.anishkmr.in:3030": "singleSignOn_consumer",
    "http://127.0.0.1:3020": "local_consumer"
};
const sessionUser = {};
const sessionApp = {};
const intrmTokenCache = {};



const fillIntrmTokenCache = (origin, id, intrmToken) => {
    intrmTokenCache[intrmToken] = [id, originAppName[origin]];
};

const storeApplicationInCache = (origin, id, intrmToken) => {
    if (sessionApp[id] == null) {
        sessionApp[id] = {
            [originAppName[origin]]: true
        };

        fillIntrmTokenCache(origin, id, intrmToken);
    } else {
        sessionApp[id][originAppName[origin]] = true;
        fillIntrmTokenCache(origin, id, intrmToken);
    }

    console.log({
        ...sessionApp
    }, {
        ...sessionUser
    }, {
        intrmTokenCache
    });
};

const parseAuthHeader = (hdrValue)=>{
    if(typeof hdrValue !== "string") return null;
    const matches = hdrValue.match(re);
    return matches && {scheme: matches[1], value: matches[2]};
}

const fromAuthHeaderWithSchema = (authScheme)=>{
    const authSchemeLower = authScheme.toLowerCase();
    return function(request){
        let token = null;
        if(request.headers[AUTH_HEADER]){
            const authParams = parseAuthHeader(request.headers[AUTH_HEADER]);
            console.log('authParams :>> ', authParams);
            if(authParams && authSchemeLower === authParams.scheme.toLowerCase()){
                console.log('token :>> ', authParams.value);
                token = authParams.value;
            }
        }

        return token;
    }
}

const fromAuthHeaderAsBearerToken = function(){
    return fromAuthHeaderWithSchema(BEARER_AUTH_SCHEME);
}

const appTokenFromRequest = fromAuthHeaderAsBearerToken();


const generatePayload = ssoToken => {
    const globalSessionToken = intrmTokenCache[ssoToken][0];
    const appName = intrmTokenCache[ssoToken][1];
    const userEmail = sessionUser[globalSessionToken];
    const user = userDB[userEmail];
    const appPolicy = user.appPolicy[appName];
    const email = appPolicy.shareEmail === true ? userEmail : undefined;
    const payload = {
        ...{
            ...appPolicy
        },
        ...{
            email,
            shareEmail: undefined,
            uid: user.userId,
            globalSessionID: globalSessionToken
        }
    };

    return payload;
}


const verifySSOToken = async (req, res, next)=>{
    const appToken = appTokenFromRequest(req);
    const { ssoToken } = req.query;
    console.log('In verifySSOToken :>> ');

    if(appToken == null || ssoToken == null || intrmTokenCache[ssoToken] == null){
        return res.status(400).json({message: "Bad Request!!!"});
    }

    const appName = intrmTokenCache[ssoToken][1];
    const globalSessionToken = intrmTokenCache[ssoToken][0];

    if(
        appToken !== appTokenDB[appName] ||
        sessionApp[globalSessionToken][appName] !== true
    ){
        return res.status(403).json({message: "unauhorized!!!"});
    }

    const payload = generatePayload(ssoToken);

    const token = await genJwtToken(payload);

    delete intrmTokenCache[ssoToken];
    return res.status(200).json({token});
};


const doLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!(userDB[email] && password === userDB[email].password)) {
        return res
            .status(404)
            .json({ message: "Invalid email and password!!!" });
    }

    const { redirectURL } = req.query;
    const id = encodedId();
    req.session.user = id;
    sessionUser[id] = email;
    if (redirectURL == null) { return res.redirect("/"); }

    const url = new URL(redirectURL);
    const intrmId = encodedId();
    storeApplicationInCache(url.origin, id, intrmId);
    console.log("Redirecting User To Its Origin!!!\n")
    console.log('url :>> ', `${redirectURL.slice(0, redirectURL.length-1)}?ssoToken=${intrmId}`);
    return res.redirect(`${redirectURL.slice(0, redirectURL.length-1)}?ssoToken=${intrmId}`);
};


const login = (req, res, next) => {
    const {
        redirectURL
    } = req.query;
    if (redirectURL != null) {
        const url = new URL(redirectURL);
        if (allowOrigin[url.origin] !== true) {
            res
                .status(401)
                .json({
                    message: "You are not allowed to access the sso-server!!!"
                });
        }
    }

    if (req.session.user != null && redirectURL == null) {
        res.redirect("/");
    }

    if (req.session.user != null && redirectURL != null) {
        const url = new URL(redirectURL);
        const intrmId = encodedId();
        storeApplicationInCache(url.origin, req.session.user, intrmId);
        return res.redirect(`${redirectURL}?ssoToken=${intrmId}`)
    }

    return res.render("login", {
        title: "SSO-Server | Login"
    });
}


module.exports = {login, doLogin, verifySSOToken};