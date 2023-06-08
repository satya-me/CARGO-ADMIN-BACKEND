const AirlineModel = require('../model/airline');
const AdminModel = require('../model/admin');

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
    try {
        const { aireline, email, phone } = req.body;
        const check_airline = await AirlineModel.findOne({ aireline });
        const check_email = await AirlineModel.findOne({ email });
        const check_phone = await AirlineModel.findOne({ phone });


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