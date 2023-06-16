const VendorModel = require('../model/vendor');
const CreateToken = require('../config/createToken');
const SecurePassword = require('../config/securePassword');


// admin register
exports.VendorRegistration = async (req, res) => {
    // console.log(req.body);
    // return;
    const { vendor_name, reporting_person_name, reporting_person_email, reporting_person_phone } = req.body;
    const setPassword = await SecurePassword(req.body.password);
    try {
        const NewVendor = new VendorModel({
            vendor_name,
            reporting_person_name,
            reporting_person_email,
            reporting_person_phone,
            password: setPassword,
            vendor_logo: "/public/uploads/" + req.file.filename
        })
        const vendorEmail = await VendorModel.findOne({ reporting_person_email: req.body.reporting_person_email });
        const vendorPhone = await VendorModel.findOne({ reporting_person_phone: req.body.reporting_person_phone });
        if (vendorEmail) {
            return res.status(400).json({ success: false, message: "Email already exsist" });
        } else if (vendorPhone) {
            return res.status(400).json({ success: false, message: "Phone number already exsist" });
        } else {
            const SaveVendor = await NewVendor.save();
            await CreateToken(SaveVendor);
            return res.status(200).json({ success: true, message: "New Vendor Registered successfully" })
        }
    } catch (err) {
        return res.status(400).json(err.message);
    }
}