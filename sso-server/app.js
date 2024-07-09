const express = require('express');
const engine = require('ejs-mate');
const session = require('express-session');

//////////////////////////////////////////////////////////
//                  Custom Scripts Imports
/////////////////////////////////////////////////////////
const route = require('./routes/index.router.js');


//////////////////////////////////////////////////////////
//                Express App Initialization
//////////////////////////////////////////////////////////
const app = express();



//////////////////////////////////////////////////////////
//                        Middlewares
//////////////////////////////////////////////////////////
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.set('views', __dirname + '/views');

app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true 
}));



//////////////////////////////////////////////////////////
//                        Routes
//////////////////////////////////////////////////////////
app.use("/sso-server", route);

app.get("/", (req, res, next)=>{
    const user = req.session.user || "unlogged";
    res.render("index", {
        what: `SSO-Server ${user}`,
        title: "SSO-Server | Home"
    });
});





//////////////////////////////////////////////////////////
//                     Error Handling
/////////////////////////////////////////////////////////
app.use((req, res, next)=>{
    console.log('error on path req.path :>> ', req.originalUrl);

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
    if(statusCode === 500){message = "Internal Server Error!!!"}

    res.status(statusCode).json({message});
});


module.exports = app;