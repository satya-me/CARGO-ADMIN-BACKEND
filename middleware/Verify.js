const AirlineModel = require('../model/airline');
const AdminModel = require('../model/admin');
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
    const filePath = './public/uploads/' + req.file.filename; // Specify the path to the file

    try {
        const { aireline, email, phone } = req.body;
        const check_airline = await AirlineModel.findOne({ aireline });
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
            return res.status(409).json({ success: false, message: `${aireline} Already Exsists.` });
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