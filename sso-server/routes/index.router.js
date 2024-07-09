const express = require('express');
const router = express.Router();

const {login, doLogin, verifySSOToken} = require('../controller/index.controller.js');

router
    .route("/login")
    .get(login)
    .post(doLogin);

router
    .get("/verifytoken", verifySSOToken)


module.exports = router;