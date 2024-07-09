const isAuthenticated = (req, res, next) => {
    console.info("Inside isAuthenticated()");
    const redirectUrl = `${req.protocol}://${req.headers.host}${req.path}`;
    console.log('redirectUrl :>> ', redirectUrl);
    console.log('user :>> ', req.session.user);
    if (!req.session.user) {
        return res.redirect(`http://127.0.0.1:3010/sso-server/login?redirectURL=${redirectUrl}`);
    }

    next();
};


module.exports = isAuthenticated;