const { secret_key } = require('./secretKay');
const jwt = require('jsonwebtoken');

// create token
const CreateToken = async (user) => {
    const token = await jwt.sign({ id: user._id }, secret_key, { expiresIn: "5h" });
    // console.log(token);
    return token;
}

module.exports = CreateToken;