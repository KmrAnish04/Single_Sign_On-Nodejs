const express = require('express');
const session = require('express-session');
const engine = require('ejs-mate');

//////////////////////////////////////////////////////////
//                  Custom Scripts Imports
/////////////////////////////////////////////////////////
const isAuthenticated = require('./isAuthenticated.js');
const checkSSORedirect = require('./checkSSORedirect.js');



//////////////////////////////////////////////////////////
//                  Express App Initialization
/////////////////////////////////////////////////////////
const app = express();




//////////////////////////////////////////////////////////
//                  Middlewares
/////////////////////////////////////////////////////////
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set("view engine", "ejs");
app.engine("ejs", engine);
app.set("views", __dirname + "/views");

app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
}));

app.use(checkSSORedirect());




//////////////////////////////////////////////////////////
//                          Routes
/////////////////////////////////////////////////////////
app.get("/", isAuthenticated, (req, res, next)=>{
    res.render("index", {
        what: `SSO-Consumer One ${JSON.stringify(req.session.user)}`,
        title: "SSO-Consumer | Home"
    });
});





//////////////////////////////////////////////////////////
//                     Error Handling
/////////////////////////////////////////////////////////
app.use((req, res, next)=>{
    console.log('error on path req.path :>> ', req.originalUrl);

    // catch 404 and forward to error handler
    const err = new Error("Resource Not Found!!!");
    err.status = 404;
    next(err);
});


app.use((err, req, res, next)=>{
    console.log('error on path req.path :>> ', req.originalUrl);

    console.error({
        message: err.message,
        error: err
    });

    const statusCode = err.status || 500;
    let message = err.message || "Internal Server Error!!!";
    if(statusCode === 500){ message = "Internal Server Error!!!";}

    res.status(statusCode).json({message});
});


module.exports = app;