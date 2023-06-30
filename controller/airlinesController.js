const AirlineModel = require('../model/airline');
const TokenModel = require('../model/token');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const CreateToken = require('../config/createToken');
const SecurePassword = require('../config/securePassword');

// add airline
exports.addAirline = async (req, res) => {
    // console.log(req.body);
    // return;
    const { airline, person_name, person_designation, email, phone, role, status } = req.body;
    const img = req.file ? '/public/uploads/' + req.file.filename : "";
    try {
        if (airline && person_name && person_designation && email && phone && role && status) {

            const airlineEmail = await AirlineModel.findOne({ email });
            const airlinePhone = await AirlineModel.findOne({ phone });

            if (airlineEmail) {
                return res.status(400).json({ success: false, message: "Email already exists" });
            } else if (airlinePhone) {
                return res.status(400).json({ success: false, message: "Username already exists" });
            } else {
                const newAirline = await AirlineModel({
                    airline,
                    person_name,
                    person_designation,
                    email,
                    phone,
                    role,
                    status,
                    password: "",
                    airline_logo: img,
                    type: "airline"
                });
                // var saveAirline = await newAirline.save();

                const user = await newAirline.save();

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
                        person_name +
                        ",\n\n" +
                        "Please set your " + airline + " password by clicking the link: \nhttp:\/\/" +
                        req.headers.host +
                        "\/api\/system\/airline\/setpassword\/" +
                        email +
                        "\/" +
                        token.token +
                        "\/" + newAirline.type +
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
            // if (saveAirline) {
            //     return res.status(200).json({ success: true, message: "New Airline Added Successfully" });
            // } else {
            //     return res.status(400).json({ success: false, message: "Something Went Wrong.Please Try Again" });
            // }
        } else {
            return res.status(400).json({ success: false, message: "All Fields Are Required" });
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


// set airline password
exports.setAirlinePassword = async (req, res) => {
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
            const AIRLINE = await AirlineModel.findOne({ _id: TOKEN._userId, email });

            if (!AIRLINE) {
                // console.log("User Not found");
                return res.status(404).json({ success: false, message: "User Not found" });
            } else if (AIRLINE.password) {
                // console.log("Password Already Set for the User");
                return res.status(200).json({ success: false, message: "Password Already Set for the User" });
            } else {
                AIRLINE.password = setPassword; // Update the password field in the AIRLINE object
                await AIRLINE.save();
                await CreateToken(AIRLINE);
                // console.log("Password Set Successfully");
                return res.status(200).json({ success: true, message: "Password Set Successfully" });
            }
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// airline login
exports.loginAirline = async (req, res) => {
    // console.log(req.body);
    // return;
    const { email, password, isRemember } = req.body;
    try {
        if (!(email && password)) {
            return res.status(400).json({ success: false, message: "All Fields Are Required" });
        }

        const existingAirline = await AirlineModel.findOne({ email });

        if (!existingAirline) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        } else {
            if (existingAirline?.isDeleted === true) {
                return res.status(401).json({ success: false, message: "You subscription has been suspended" });
            } else {
                if (existingAirline?.status === "Inactive") {
                    return res.status(403).json({ success: false, message: "You are not authorized" });
                } else if (existingAirline?.password?.length === 0) {
                    return res.status(403).json({ success: false, message: "You did not created your password yet. Please check your email." });
                } else {
                    const AIRLINEDATA = {
                        id: existingAirline._id,
                        airline: existingAirline.airline,
                        person_name: existingAirline.person_name,
                        person_designation: existingAirline.person_designation,
                        email: existingAirline.email,
                        phone: existingAirline.phone,
                        role: existingAirline.role,
                        status: existingAirline.status,
                        type: existingAirline.type,
                    };


                    if (existingAirline && (bcryptjs.compareSync(password, existingAirline.password))) {
                        const tokenData = await CreateToken(existingAirline._id);
                        if (isRemember) {
                            res.cookie('email', email);
                            res.cookie('password', password);
                            // const token = jwt.sign({ id: existingAirline._id }, secret_key, {
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
                        return res.status(200).json({ success: true, message: "Login Successfully", data: AIRLINEDATA, token: tokenData });
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


// all airline
exports.allAirline = async (req, res) => {
    try {
        const allAirlines = await AirlineModel.find().lean();
        return res.status(200).json({ success: true, message: "Data Fetched Successfully", data: allAirlines });
    } catch (exc) {
        return res.status(404).json({ success: false, message: "Data Not Found" });
    }
}


// update airlines
exports.updateAirline = async (req, res) => {

    const { person_name, person_designation, email, phone, role, status } = req.body;
    const img = req.file ? '/public/uploads/' + req.file.filename : "";

    try {
        // Check for duplicate email or phone number
        const duplicateData = await AirlineModel.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ],
            _id: { $ne: req.params.id } // Exclude the current document being updated
        });

        // console.log(duplicateData);
        // return;

        if (duplicateData) {
            return res.status(400).json({ success: false, message: "Duplicate Email or Phone Number" });
        }

        const updateAirline = await AirlineModel.findByIdAndUpdate(
            req.params.id,
            {
                person_name,
                person_designation,
                email, phone,
                role,
                status,
                aireline_logo: img
            },
            { useFindAndModify: false }
        );

        if (!updateAirline) {
            return res.status(404).json({ success: false, message: "Data Not Found" });
        } else {
            return res.status(200).json({ success: true, message: "Airline Updated Successfully" });
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


// delete air line (soft delete)
exports.deleteAirline = async (req, res) => {
    try {
        const airline = await AirlineModel.findById(req.params.id);
        if (!airline) {
            return res.status(404).json({ success: false, message: "Data Not Found" });
        } else {
            const deleteAirline = await AirlineModel.findByIdAndUpdate(
                req.params.id,
                { isDeleted: true }
            );
            if (!deleteAirline) {
                return res.status(404).json({ success: false, message: "Data Not Found" });
            } else {
                return res.status(200).json({ success: true, message: "Airline Deleted Successfully" });
            }
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


// set airline password VIEW
exports.setAirlinePasswordView = (req, res) => {
    // console.log(req.params);
    const DATA = {
        email: req.params.email,
        token: req.params.token,
        user_type: req.params.user_type,
    }
    res.render("createpassword", {
        title: "createpassword",
        data: DATA
    })
};