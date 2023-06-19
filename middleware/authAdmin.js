const jwt = require('jsonwebtoken');
const { secret_key } = require('../config/secretKay');

exports.verifyToken = (req, res, next) => {
    // console.log(req.body);
    // console.log(req.headers.authorization);
    // return;
    let token = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers.authorization;
    // console.log("token=>", token);
    // return;

    // Remove the "Bearer " prefix from the token
    if (token?.startsWith('Bearer ')) {
        token = token.slice(7); // Removes the first 7 characters ("Bearer ")
    }
    if (!token) {
        return res.status(401).json({ status: false, msg: "A token is required for authentication" });
    }
    try {
        // console.log("token===>", token);
        // console.log("secret_key===>", secret_key);

        const decoded = jwt.verify(token, secret_key);

        // console.log("decoded", decoded);

        req.admin = decoded;
        next();
        // console.log("after next");
    } catch (exc) {
        return res.status(401).json({ status: false, msg: "Invalid token access" });
    }
};
