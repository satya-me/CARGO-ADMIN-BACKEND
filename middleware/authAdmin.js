const jwt = require('jsonwebtoken');
const config = require('../config/config')

const verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"]
    if (!token) {
        return res.status(401).json({ status: false, msg: "A token is required for authentication" });
    }
    try {
        const decoded = jwt.verify(token, config.secret_key);
        req.admin = decoded;
    } catch (exc) {
        return res.status(401).json({ status: false, msg: "Invalid token access" });
    }
    return next()
}

module.exports = verifyToken;