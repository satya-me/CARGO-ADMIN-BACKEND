const AdminModel = require('../model/admin');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const config = require('../config/config');
const cookie = require('cookie');
const http = require('http');
const crypto = require('crypto');
const nodeMailer = require('nodemailer');



// secure_password
const SecurePassword = async (password) => {
    try {
        const HashPassword = await bcryptjs.hash(password, 10);
        return HashPassword;
    } catch (err) {
        console.log(err.message);
    }
}


// create token
const CreateToken = async (id) => {
    try {
        const token = await jwt.sign({ _id: id }, config.secret_key, { expiresIn: "5h" });
        return token;
    } catch (err) {
        console.log(err.message);
    }
}


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
            await CreateToken(SaveAdmin._id);
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
            //     const server = http.createServer((req, res) => {
            //         // Set the cookie
            //         res.setHeader('Set-Cookie', cookie.serialize('username', username));;
            //         res.setHeader('Set-Cookie', cookie.serialize('password', password));;

            //         // Send response
            //         res.end('Cookie has been set');
            //     });

            //     server.listen(3304, () => {
            //         console.log('Server is running on port 3304');
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
