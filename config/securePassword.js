const bcryptjs = require('bcryptjs');

// secure_password
const SecurePassword = async (password) => {
    const HashPassword = await bcryptjs.hash(password, 10);
    // console.log(HashPassword);
    return HashPassword;
}

module.exports = SecurePassword;
