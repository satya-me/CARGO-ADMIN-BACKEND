const AdminModel = require('../model/admin');
const bcryptjs = require('bcryptjs');
const CreateToken = require('../config/createToken');
const SecurePassword = require('../config/securePassword');



// admin register
exports.registerAdmin = async (req, res) => {
    // console.log(req.body);
    // return;
    const setPassword = await SecurePassword(req.body.password);
    const { full_name, username, email, phone } = req.body;
    try {
        const NewAdmin = new AdminModel({ full_name, username, email, phone, password: setPassword })
        const adminEmail = await AdminModel.findOne({ email: req.body.email });
        const adminUsername = await AdminModel.findOne({ username: req.body.username });
        if (adminEmail) {
            return res.status(400).json({ success: false, message: "Email already exsist" });
        } else if (adminUsername) {
            return res.status(400).json({ success: false, message: "Username already exsist" });
        } else {
            const SaveAdmin = await NewAdmin.save();
            await CreateToken(SaveAdmin);
            return res.status(200).json({ success: true, message: "Registered successfully" })
        }
    } catch (err) {
        return res.status(400).json(err.message);
    }
}


// Admin login
exports.loginAdmin = async (req, res) => {
    // console.log(req.body);
    // return;
    try {
        const { username, password, isRemember } = req.body;
        if (!(username && password)) {
            return res.status(400).json({ success: false, message: "Invalid username or password. Please try again" });
        }
        const existingAdmin = await AdminModel.findOne({ username });
        const ADMINDATA = {
            id: existingAdmin._id,
            full_name: existingAdmin.full_name,
            username: existingAdmin.username,
            email: existingAdmin.email,
            phone: existingAdmin.phone,
            role: existingAdmin.role,
        };
        if (existingAdmin && (bcryptjs.compareSync(password, existingAdmin.password))) {
            const tokenData = await CreateToken(existingAdmin._id);
            // if (isRemember) {
            //     const user_creds = { username, password }
            //     app.get('/set-cookie', (req, res) => {
            //         console.log(user_creds);
            //         // Set the cookie with the desired name, value, and options
            //         res.cookie('user_creds', user_creds, {
            //             maxAge: 86400000, // Cookie expiry time in milliseconds (1 day in this example)
            //             httpOnly: false, // The cookie is inaccessible to JavaScript
            //             secure: false, // The cookie is sent only over HTTPS if enabled
            //             // sameSite: 'strict' // The cookie is sent only for same-site requests
            //         });

            //         res.send('Cookie set successfully!');
            //     });
            // }
            return res.status(200).json({ success: true, message: "Login Successfully", data: ADMINDATA, token: tokenData });
        } else {
            return res.status(404).json({ success: false, message: "Invalid username or password. Please try again" })
        }
    } catch (err) {
        return res.status(400).json(err.message)
    }
}
