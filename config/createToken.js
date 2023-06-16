const { secret_key } = require('./secretKay');
const jwt = require('jsonwebtoken');

// create token
const CreateToken = async (admin) => {
    const token = await jwt.sign({ id: admin._id, username: admin.username, email: admin.email }, secret_key, { expiresIn: "5h" });
    // console.log(token);
    return token;
}

module.exports = CreateToken;