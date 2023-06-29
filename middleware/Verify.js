const AirlineModel = require('../model/airline');
const AdminModel = require('../model/admin');
const VendorModel = require('../model/vendor');
const fs = require('fs');

// duplicateAdminCheck
exports.duplicateAdminCheck = async (req, res, next) => {
    try {
        const { username, email, phone } = req.body;
        const check_username = await AdminModel.findOne({ username });
        const check_email = await AdminModel.findOne({ email });
        const check_phone = await AdminModel.findOne({ phone });

        if (check_username) {
            return res.status(409).json({ success: false, message: `Username '${username}' Already Exsists.` });
        } else if (check_email) {
            return res.status(409).json({ success: false, message: `Email '${email}' Already Exsists.` });
        } else if (check_phone) {
            return res.status(409).json({ success: false, message: `Phone Number '${phone}' Already Exsists.` });
        }

    } catch (exc) {
        return res.status(404).json({ success: false, message: "Data Not Found" })
    }

    return next();
}


// duplicateAirlineCheck
exports.duplicateAirlineCheck = async (req, res, next) => {
    // console.log(req.body);
    // return;
    const filePath = req.file ? './public/uploads/' + req.file.filename : ""; // Specify the path to the file

    try {
        const { airline, email, phone } = req.body;
        const check_airline = await AirlineModel.findOne({ airline });
        const check_email = await AirlineModel.findOne({ email });
        const check_phone = await AirlineModel.findOne({ phone });

        // Delete the file
        if (check_airline || check_email || check_phone) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("error ==>", err);
                    return;
                }
                console.log('File deleted successfully After Duplicate Detection');
            });
        }

        if (check_airline) {
            return res.status(409).json({ success: false, message: `${airline} Already Exsists.` });
        } else if (check_email) {
            return res.status(409).json({ success: false, message: `${email} Already Exsists.` });
        } else if (check_phone) {
            return res.status(409).json({ success: false, message: `${phone} Already Exsists.` });
        }

    } catch (exc) {
        return res.status(404).json({ success: false, message: "Data Not Found" });
    }

    return next();
}


// duplicateAdminCheck
exports.duplicateVendorCheck = async (req, res, next) => {
    const filePath = req.file ? './public/uploads/' + req.file.filename : ""; // Specify the path to the file

    try {
        const { vendor_name, reporting_person_email, reporting_person_phone, _airlineId } = req.body;
        const check_vendor_name = await VendorModel.findOne({ vendor_name });
        const check_email = await VendorModel.findOne({ reporting_person_email });
        const check_phone = await VendorModel.findOne({ reporting_person_phone });
        const check_airline_id = await VendorModel.findOne({ _airlineId });

        // Delete the file
        if (check_vendor_name || check_email || check_phone) {
            if (req.file) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error("verify error line-87==>", err);
                        return;
                    }
                    console.log('File Deleted Successfully After Duplicate Detection');
                });
            }
        }

        // if (check_airline_id) {
        if (check_vendor_name?.vendor_name == check_airline_id?.vendor_name) {
            return res.status(409).json({ success: false, message: `Vendor '${vendor_name}' Already Exsists For This Airline.` });
        } else if (check_email?.reporting_person_email == check_airline_id?.reporting_person_email) {
            return res.status(409).json({ success: false, message: `Email '${reporting_person_email}' Already Exsists For This Airline.` });
        } else if (check_phone?.reporting_person_phone == check_airline_id?.reporting_person_phone) {
            return res.status(409).json({ success: false, message: `Phone Number '${reporting_person_phone}' Already Exsists For This Airline.` });
        }
        //     return res.status(409).json({ success: false, message: `You Already Registered With '${check_airline.airline}'` });
        // }

    } catch (exc) {
        return res.status(404).json({ success: false, message: "Data Not Found" })
    }

    return next();
}