const AdminModel = require('../model/admin');
const bcryptjs = require('bcryptjs');
const CreateToken = require('../config/createToken');
const SecurePassword = require('../config/securePassword');
const jwt = require('jsonwebtoken');
const { secret_key } = require('../config/secretKay');


// admin register
exports.registerAdmin = async (req, res) => {
    // console.log(req.body);
    // return;
    const setPassword = await SecurePassword(req.body.password);
    const { full_name, username, email, phone, role } = req.body;
    try {
        const NewAdmin = new AdminModel({ full_name, username, email, phone, role, password: setPassword })
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
    const { username, password, isRemember } = req.body;
    try {
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
            if (isRemember) {
                const token = jwt.sign({ id: existingAdmin._id }, secret_key, {
                    expiresIn: '7d', // Set the token expiration time (e.g., 7 days)
                });

                const cookie = res.cookie('token', token, {
                    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiry time in milliseconds (7 days)
                    httpOnly: true, // The cookie is inaccessible to JavaScript
                    secure: false, // The cookie is sent only over HTTPS if enabled
                    // sameSite: 'strict' // The cookie is sent only for same-site requests
                });
                // console.log(cookie);
            }
            return res.status(200).json({ success: true, message: "Login Successfully", data: ADMINDATA, token: tokenData });
        } else {
            return res.status(404).json({ success: false, message: "Invalid username or password. Please try again" })
        }
    } catch (err) {
        return res.status(400).json(err.message)
    }
}


// get all admin
exports.getAllAdmins = async (req, res) => {
    // console.log(req.body);
    // return;
    try {
        const allAdmins = await AdminModel.find({}, { password: 0 });
        return res.status(200).json({ success: true, message: "Data Fetched Successfully", data: allAdmins });
    } catch (exc) {
        return res.status(404).json({ success: false, message: "Data Not Found" });
    }
}


// update admin
exports.updateAdmin = async (req, res) => {
    const { full_name, username, email, phone, role, status } = req.body;
    try {
        // Check for duplicate email or phone number
        const duplicateData = await AdminModel.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ],
            _id: { $ne: req.params.id } // Exclude the current document being updated
        });

        if (duplicateData) {
            return res.status(400).json({ success: false, message: "Duplicate Email or Phone Number" });
        }

        const updateAdmin = await AdminModel.findByIdAndUpdate(
            req.params.id,
            { full_name, username, email, phone, role, status },
            { useFindAndModify: false }
        );

        if (!updateAdmin) {
            return res.status(404).json({ success: false, message: "Data Not Found" });
        } else {
            // const UPDATED_ADMIN_DATA = await AdminModel.findById(req.params.id, { password: 0 });
            return res.status(200).json({ success: true, message: "User Updated Successfully" });
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


// delete admin (soft delete)
exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await AdminModel.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Data Not Found" });
        } else {
            const deleteAdmin = await AdminModel.findByIdAndUpdate(
                req.params.id,
                { isDeleted: true }
            );
            if (!deleteAdmin) {
                return res.status(404).json({ success: false, message: "Data Not Found" });
            } else {
                // const DELETED_ADMIN_DATA = await AdminModel.findById(req.params.id, { password: 0 });
                return res.status(200).json({ success: true, message: "User Deleted Successfully" });
            }
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}