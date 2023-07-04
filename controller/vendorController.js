const VendorModel = require('../model/vendor');
const AirlineModel = require('../model/airline');
const TokenModel = require('../model/token');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const CreateToken = require('../config/createToken');
const SecurePassword = require('../config/securePassword');


// vendor register
exports.VendorRegistration = async (req, res) => {
    // console.log(req.body);
    // return;
    const { vendor_name, reporting_person_name, reporting_person_email, reporting_person_phone, reporting_person_alt_phone, HO_address, status, role, _airlineId } = req.body;
    const img = req.file ? '/public/uploads/' + req.file.filename : "";
    try {
        if (!(vendor_name && reporting_person_name && reporting_person_email && reporting_person_phone && HO_address && status && role)) {
            return res.status(400).json({ success: false, message: "All Fields Are Required" });
        } else {
            const NewVendor = new VendorModel({
                vendor_name,
                reporting_person_name,
                reporting_person_email,
                reporting_person_phone,
                reporting_person_alt_phone,
                HO_address,
                status,
                role,
                password: "",
                type: 'vendor',
                vendor_logo: img,
                _airlineId
            });
            // console.log(NewVendor);
            // return;

            // Retrieve the list of indexes for the VendorModel collection
            const indexes = await VendorModel.collection.indexes();
            // Check if the index for reporting_person_email exists
            const reportingPersonEmailIndexExists = indexes.some(index => index.name === 'reporting_person_email_1');
            // Check if the index for reporting_person_phone exists
            const reportingPersonPhoneIndexExists = indexes.some(index => index.name === 'reporting_person_phone_1');
            // Conditionally drop the index for reporting_person_email field
            if (reportingPersonEmailIndexExists) {
                await VendorModel.collection.dropIndex('reporting_person_email_1');
            }
            // Conditionally drop the index for reporting_person_phone field
            if (reportingPersonPhoneIndexExists) {
                await VendorModel.collection.dropIndex('reporting_person_phone_1');
            }
            // save vendor
            const user = await NewVendor.save();

            // console.log(user);
            // return;

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
                to: user.reporting_person_email,
                subject: "Set Password Link",
                text:
                    "Hello " +
                    reporting_person_name +
                    ",\n\n" +
                    "Please set your " + vendor_name + " password by clicking the link: \nhttp:\/\/" +
                    req.headers.host +
                    "\/api\/vendor\/setpassword\/" +
                    reporting_person_email +
                    "\/" +
                    token.token +
                    "\/" + NewVendor.type +
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
        // }
    }
    catch (err) {
        console.log("catch==>");
        return res.status(400).json(err.message);
    }
}


// set vendor password
exports.setVendorPassword = async (req, res) => {
    // console.log(req.params);
    // return;
    const { email, token } = req.params;
    const setPassword = await SecurePassword(req.body.password);
    try {
        const TOKEN = await TokenModel.findOne({ token: token });

        if (!TOKEN) {
            // console.log("Verification Link May Be Expired :(");
            return res.status(400).json({ success: false, message: "Verification Link May Be Expired :(" });
        } else {
            const VENDOR = await VendorModel.findOne({ _id: TOKEN._userId, reporting_person_email: email });

            if (!VENDOR) {
                // console.log("User Not found");
                return res.status(404).json({ success: false, message: "User Not found" });
            } else if (VENDOR.password) {
                // console.log("Password Already Set for the User");
                return res.status(200).json({ success: false, message: "Password Already Set for the User" });
            } else {
                VENDOR.password = setPassword; // Update the password field in the VENDOR object
                await VENDOR.save();
                await CreateToken(VENDOR);
                // console.log("Password Set Successfully");
                return res.status(200).json({ success: true, message: "Password Set Successfully" });
            }
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// vendor login
exports.loginVendor = async (req, res) => {
    // console.log(req.body);
    // return;
    const { email, password, airlineID, isRemember } = req.body;
    try {
        if (!(airlineID)) {
            return res.status(400).json({ success: false, message: "You Are Not Registered With This Airline" });
        } else {
            if (!email && password) {
                return res.status(400).json({ success: false, message: "All Fields Are Required" });
            } else {
                const existingVendor = await VendorModel.findOne({ reporting_person_email: email });
                // console.log(existingVendor);
                // return;
                if (!existingVendor) {
                    return res.status(404).json({ success: false, message: "User Not Found" });
                } else {
                    if (existingVendor?.isDeleted === true) {
                        return res.status(401).json({ success: false, message: "You subscription has been suspended" });
                    } else {
                        if (existingVendor?.status === "Inactive") {
                            return res.status(403).json({ success: false, message: "You are not authorized" });
                        } else if (existingVendor?.password?.length === 0) {
                            return res.status(403).json({ success: false, message: "You did not created your password yet. Please check your email." });
                        } else {
                            const VENDORDATA = {
                                id: existingVendor._id,
                                vendor_name: existingVendor.vendor_name,
                                reporting_person_name: existingVendor.reporting_person_name,
                                reporting_person_email: existingVendor.reporting_person_email,
                                reporting_person_phone: existingVendor.reporting_person_phone,
                                reporting_person_alt_phone: existingVendor.reporting_person_alt_phone,
                                HO_address: existingVendor.HO_address,
                                status: existingVendor.status,
                                type: existingVendor.type,
                                role: existingVendor.role,
                                _airlineId: existingVendor._airlineId,
                            };


                            if (existingVendor && (bcryptjs.compareSync(password, existingVendor.password))) {
                                const tokenData = await CreateToken(existingVendor._id);
                                if (isRemember) {
                                    res.cookie('email', email);
                                    res.cookie('password', password);
                                    // const token = jwt.sign({ id: existingVendor._id }, secret_key, {
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
                                return res.status(200).json({ success: true, message: "Login Successfully", data: VENDORDATA, token: tokenData });
                            } else {
                                return res.status(404).json({ success: false, message: "Invalid username or password. Please try again" })
                            }
                        }
                    }
                }
            }
        }

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


// get all vendors
exports.getAllVendors = async (req, res) => {
    // console.log(req.body);
    // return;
    try {
        const allVendors = await VendorModel.find().populate('_airlineId');
        return res.status(200).json({ success: true, message: "Data Fetched Successfully", data: allVendors });
    } catch (exc) {
        return res.status(404).json({ success: false, message: "Data Not Found" });
    }
}


// update vendor
exports.updateVendor = async (req, res) => {
    // console.log(req.body);
    console.log(req.params);
    // return;
    const { vendor_name, reporting_person_name, reporting_person_email, reporting_person_phone, reporting_person_alt_phone, HO_address, status, _airlineId } = req.body;
    const img = req.file ? '/public/uploads/' + req.file.filename : "";
    try {
        // Check for duplicate email or phone number
        const duplicateData = await VendorModel.findOne({
            $or: [
                { reporting_person_email: reporting_person_email },
                { reporting_person_phone: reporting_person_phone },
                { reporting_person_alt_phone: reporting_person_alt_phone }
            ],
            _id: { $ne: req.params.id } // Exclude the current document being updated
        });

        // console.log(duplicateData);
        // return;

        if (duplicateData) {
            return res.status(400).json({ success: false, message: "Duplicate Email or Phone Number" });
        }

        const updateVendor = await VendorModel.findByIdAndUpdate(
            req.params.id,
            {
                vendor_name,
                reporting_person_name,
                reporting_person_email,
                reporting_person_phone,
                reporting_person_alt_phone,
                HO_address,
                _airlineId,
                status,
                vendor_logo: img
            },
            { useFindAndModify: false }
        );

        if (!updateVendor) {
            return res.status(404).json({ success: false, message: "Data Not Found" });
        } else {
            // const UPDATED_ADMIN_DATA = await VendorModel.findById(req.params.id, { password: 0 });
            return res.status(200).json({ success: true, message: "Vendor Updated Successfully" });
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


// delete vendor (soft delete)
exports.deleteVendor = async (req, res) => {
    // console.log(req.params);
    // return;
    try {
        const vendor = await VendorModel.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: "Data Not Found" });
        } else {
            const deleteVendor = await VendorModel.findByIdAndUpdate(
                req.params.id,
                { isDeleted: true }
            );
            if (!deleteVendor) {
                return res.status(404).json({ success: false, message: "Data Not Found" });
            } else {
                // const DELETED_ADMIN_DATA = await VendorModel.findById(req.params.id, { password: 0 });
                return res.status(200).json({ success: true, message: "Vendor Deleted Successfully" });
            }
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


// set vendor password VIEW
exports.setVendorPasswordView = (req, res) => {
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