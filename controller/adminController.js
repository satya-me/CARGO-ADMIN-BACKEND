const AdminModel = require('../model/admin');
const bcryptjs = require('bcryptjs');
const CreateToken = require('../config/createToken');
const SecurePassword = require('../config/securePassword');
const jwt = require('jsonwebtoken');
const { secret_key } = require('../config/secretKay');
const TokenModel = require('../model/token');
const nodemailer = require('nodemailer');
const crypto = require('crypto');




// admin register
exports.registerAdmin = async (req, res) => {
    const { full_name, username, email, phone, role } = req.body;
    try {
        const adminEmail = await AdminModel.findOne({ email });
        const adminUsername = await AdminModel.findOne({ username });

        if (adminEmail) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        } else if (adminUsername) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        } else {
            const NewAdmin = new AdminModel({
                full_name,
                username,
                email,
                phone,
                role,
                password: "",
                admin_type: "admin"
            });

            const user = await NewAdmin.save();

            const token = new TokenModel({
                _userId: user._id,
                token: crypto.randomBytes(16).toString("hex"),
            });

            await token.save();

            var transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.APP_PASSWORD
                },
            });

            var mailOptions = {
                from: "no-reply@surajit.com",
                to: user.email,
                subject: "Set Password Link",
                text:
                    "Hello " +
                    full_name +
                    ",\n\n" +
                    "Please set your password by clicking the link: \nhttp:\/\/" +
                    req.headers.host +
                    "\/api\/admin\/auth\/setpassword\/" +
                    email +
                    "\/" +
                    token.token +
                    "\n\nThank You!!\n",
            };
            transporter.sendMail(mailOptions, function (err) {
                if (err) {
                    console.log("Technical Issues...");
                    return res.status(400).json({ success: false, message: "Technical Issues" });
                } else {
                    console.log("Mail Sent.....");
                    return res.status(200).json({
                        success: true,
                        message:
                            "An Email Sent To Your Email ID For Set Your Password. It Will Expire Within 24 Hours.",
                    });
                }
            });
        }
    } catch (err) {
        console.log("Error:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// set admin password
exports.setAdminPassword = async (req, res) => {
    const { email, token } = req.params;
    const setPassword = await SecurePassword(req.body.password);
    try {
        const adminToken = await TokenModel.findOne({ token: token });

        if (!adminToken) {
            console.log("Verification Link May Be Expired :(");
            return res.status(400).json({ success: false, message: "Verification Link May Be Expired :(" });
        } else {
            const ADMIN = await AdminModel.findOne({ _id: adminToken._userId, email });

            if (!ADMIN) {
                console.log("User Not found");
            } else if (ADMIN.password) {
                console.log("Password Already Set for the User");
                return res.status(400).json({ success: false, message: "Password Already Set for the User" });
            } else {
                ADMIN.password = setPassword; // Update the password field in the ADMIN object
                await ADMIN.save();
                await CreateToken(ADMIN);
                return res.status(200).json({ success: true, message: "Password Set Successfully" });
            }
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


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
                res.cookie('username', username);
                res.cookie('password', password);
                // const token = jwt.sign({ id: existingAdmin._id }, secret_key, {
                //     expiresIn: '7d', // Set the token expiration time (e.g., 7 days)
                // });

                // const cookie = res.cookie('token', token, {
                //     maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiry time in milliseconds (7 days)
                //     httpOnly: true, // The cookie is inaccessible to JavaScript
                //     secure: false, // The cookie is sent only over HTTPS if enabled
                //     // sameSite: 'strict' // The cookie is sent only for same-site requests
                // });
                // console.log(cookie);
            }
            return res.status(200).json({ success: true, message: "Login Successfully", data: ADMINDATA, token: tokenData });
        } else {
            return res.status(404).json({ success: false, message: "Invalid username or password. Please try again" })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
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