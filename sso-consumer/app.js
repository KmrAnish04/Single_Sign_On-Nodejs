const express = require('express');
const session = require('express-session');
const engine = require('ejs-mate');
const {connectRedisClient} = require('./RedisConfig/redis.connection.js');
const RedisSessionStore = require('./RedisConfig/redis.sessionStore.js');

//////////////////////////////////////////////////////////
//                  Custom Scripts Imports
/////////////////////////////////////////////////////////
const isAuthenticated = require('./isAuthenticated.js');
const checkSSORedirect = require('./checkSSORedirect.js');



//////////////////////////////////////////////////////////
//                  Express App Initialization
/////////////////////////////////////////////////////////
const app = express();

app.setupApp = async () => {

    const RedisClient = await connectRedisClient('redis://127.0.0.1:6379');
    

    //////////////////////////////////////////////////////////
    //                  Middlewares
    /////////////////////////////////////////////////////////
    app.use(session({
        store: RedisSessionStore(RedisClient),
        resave: false,
        saveUninitialized: false,
        secret: "this is sso-consumer token!",
        cookie: {
          secure: false,
          maxAge: 5 * 60 * 1000
        } // 5 minutes
      }))


    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());

    app.set("view engine", "ejs");
    app.engine("ejs", engine);
    app.set("views", __dirname + "/views");

    app.use(checkSSORedirect());




    //////////////////////////////////////////////////////////
    //                          Routes
    /////////////////////////////////////////////////////////
    app.get("/", isAuthenticated, (req, res, next) => {
        console.log("******* / ********* st")
        console.log("req.session :>>", req.session);
        console.log(" req.sessionID :>>", req.sessionID);
        console.log("req.cookies :>>", req.cookies);
        console.log("******* / ********* end")
        res.render("index", {
            what: `SSO-Consumer One ${JSON.stringify(req.session.user)}`,
            title: "SSO-Consumer | Home"
        });
    });




    ////////////////////////////////////////////////////////////////////////////
    //                           Logout user With SSO Serive
    ////////////////////////////////////////////////////////////////////////////
    app.get("/logout-with-sso", (req, res, next) => {

        console.log("\t***************************************");
        console.log("Inside logoutWithSSO() :>> ");
        const authProviderUrl = "http://localhost:3000/api/v1/auth/logout"; // Replace with your authentication provider's URL
        const redirectUrl = `${req.protocol}://${req.headers.host}`;

        const ssoRedirectUrl = `${authProviderUrl}?redirectURL=${redirectUrl}`;
        console.log(`Redirecting to ${ssoRedirectUrl}`)
        console.log("***************************************\t");
        return res.redirect(ssoRedirectUrl);

    });
    



    ////////////////////////////////////////////////////////////////////////////
    //                    Back Channel Logout Method For SSO Server
    // This route can only accessible to sso server, no user should manually 
    // have the access of this route
    ////////////////////////////////////////////////////////////////////////////
    app.post("/backchannel-logout", async (req, res) => {
        console.log("\t***************************************");
        console.log("Inside backChannelLogoutSSOServer() :>> ");
        console.log("curr user session: ", req.session);
        const {userId, sessionID} = req.body;
        
        console.log("logout req for userId :>> ", userId);
        console.log("with sessionID :>> ", sessionID);

        await RedisSessionStore().destroy(sessionID, (err, data)=>{
            console.log("delting user session data from redis !!!");
            console.log('err :>> ', err);
            console.log('data :>> ', data);
        });
        
        return res
        .status(200)
        .json({status: 200, message: "User LoggedOut Successfully!☑️"});
    })





    //////////////////////////////////////////////////////////
    //                     Error Handling
    /////////////////////////////////////////////////////////
    app.use((req, res, next) => {
        console.log('error on path req.path :>> ', req.originalUrl);

        // catch 404 and forward to error handler
        const err = new Error("Resource Not Found!!!");
        err.status = 404;
        next(err);
    });


    app.use((err, req, res, next) => {
        console.log('error on path req.path :>> ', req.originalUrl);

        console.error({
            message: err.message,
            error: err
        });

        const statusCode = err.status || 500;
        let message = err.message || "Internal Server Error!!!";
        if (statusCode === 500) {
            message = "Internal Server Error!!!";
        }

        res.status(statusCode).json({
            message
        });
    });


}





app.setupApp();
module.exports = app;