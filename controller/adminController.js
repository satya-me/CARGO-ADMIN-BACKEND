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
    // console.log(req.body);
    // return;
    const { full_name, username, email, phone, role, status } = req.body;
    try {
        if (!(full_name && username && email && phone && role && status)) {
            return res.status(400).json({ success: false, message: "All Fields Are Required.Please try again" });
        }
        const adminEmail = await AdminModel.findOne({ email });
        const adminUsername = await AdminModel.findOne({ username });
        const adminPhone = await AdminModel.findOne({ phone });

        if (adminEmail) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        } else if (adminUsername) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        } else if (adminPhone) {
            return res.status(400).json({ success: false, message: "Phone Number already exists" });
        } else {
            const NewAdmin = new AdminModel({
                full_name,
                username,
                email,
                phone,
                role,
                status,
                password: "",
                type: "admin"
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
                    "\/" + NewAdmin.type +
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
    } catch (exc) {
        console.log("Error:", exc);
        return res.status(404).json({ success: false, message: exc });
    }
};


// set admin password
exports.setAdminPassword = async (req, res) => {
    // console.log(req.params);
    // return;
    const { email, token } = req.params;
    const setPassword = await SecurePassword(req.body.password);
    try {
        const adminToken = await TokenModel.findOne({ token: token });

        if (!adminToken) {
            // console.log("Verification Link May Be Expired :(");
            return res.status(400).json({ success: false, message: "Verification Link May Be Expired :(" });
        } else {
            const ADMIN = await AdminModel.findOne({ _id: adminToken._userId, email });

            if (!ADMIN) {
                // console.log("User Not found");
                return res.status(404).json({ success: false, message: "User Not found" });
            } else if (ADMIN.password) {
                // console.log("Password Already Set for the User");
                return res.status(200).json({ success: false, message: "Password Already Set for the User" });
            } else {
                ADMIN.password = setPassword; // Update the password field in the ADMIN object
                await ADMIN.save();
                await CreateToken(ADMIN);
                // console.log("Password Set Successfully");
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
            return res.status(400).json({ success: false, message: "All Fields Are Required" });
        }

        const existingAdmin = await AdminModel.findOne({ username });

        if (!existingAdmin) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        } else {
            if (existingAdmin?.isDeleted === true) {
                return res.status(401).json({ success: false, message: "You subscription has been suspended" });
            } else {
                if (existingAdmin?.status === "Inactive") {
                    return res.status(403).json({ success: false, message: "You are not authorized" });
                } else if (existingAdmin?.password?.length === 0) {
                    return res.status(403).json({ success: false, message: "You did not created your password yet. Please check your email." });
                } else {
                    const ADMINDATA = {
                        id: existingAdmin._id,
                        full_name: existingAdmin.full_name,
                        username: existingAdmin.username,
                        email: existingAdmin.email,
                        phone: existingAdmin.phone,
                        role: existingAdmin.role,
                        status: existingAdmin.status,
                        type: "admin"
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
                }
            }
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


// forget password
exports.forgotPassword = async (req, res) => {
    // console.log(req.body);
    // return;
    const { email } = req.body;
    try {
        if (!(email)) {
            return res.status(400).json({ success: false, message: "All Fields Are Required.Please try again" });
        }
        const adminEmail = await AdminModel.findOne({ email });

        // console.log(adminEmail);
        // return;

        if (!adminEmail) {
            return res.status(400).json({ success: false, message: "This Email Is Not Registered With Us" });
        } else {
            const token = new TokenModel({
                _userId: adminEmail._id,
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
                to: adminEmail.email,
                subject: "Forgot Password Link",
                text:
                    "Hello " +
                    adminEmail.full_name +
                    ",\n\n" +
                    "Please reset your password by clicking the link: \nhttp:\/\/" +
                    req.headers.host +
                    "\/api\/admin\/auth\/forgot\/password\/" +
                    email +
                    "\/" +
                    token.token +
                    // "\/" + adminEmail.admin_type +
                    "\/" + "admin" +
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
    } catch (exc) {
        console.log("Error:", exc);
        return res.status(404).json({ success: false, message: exc });
    }
}


// set admin password
exports.resetAdminPassword = async (req, res) => {
    // console.log(req.params);
    // return;
    const { email, token } = req.params;
    const setPassword = await SecurePassword(req.body.password);
    try {
        const adminToken = await TokenModel.findOne({ token: token });

        if (!adminToken) {
            // console.log("Verification Link May Be Expired :(");
            return res.status(400).json({ success: false, message: "Verification Link May Be Expired :(" });
        } else {
            const ADMIN = await AdminModel.findOne({ _id: adminToken._userId, email });

            if (!ADMIN) {
                // console.log("User Not found");
                return res.status(404).json({ success: false, message: "User Not found" });
            } else {
                ADMIN.password = setPassword; // Update the password field in the ADMIN object
                await ADMIN.save();
                await CreateToken(ADMIN);
                // console.log("Password Set Successfully");
                return res.status(200).json({ success: true, message: "Password Reset Successfully" });
            }
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// set admin password VIEW
exports.setAdminPasswordView = (req, res) => {
    // console.log(req.params);
    const DATA = {
        email: req.params.email,
        token: req.params.token,
        user_type: req.params.user_type,
        backend_url: process.env.HOST,
        frontend_url: process.env.REACT_HOST,
    }
    res.render("createpassword", {
        title: "createpassword",
        data: DATA
    })
};


// set admin password VIEW
exports.resetAdminPasswordView = (req, res) => {
    // console.log(req.params);
    const DATA = {
        email: req.params.email,
        token: req.params.token,
        user_type: req.params.user_type,
        backend_url: process.env.HOST,
        frontend_url: process.env.REACT_HOST,
    }
    res.render("resetnewpassword", {
        title: "reset-new-password",
        data: DATA
    })
};