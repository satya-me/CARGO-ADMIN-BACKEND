const VendorModel = require('../model/vendor');
const CreateToken = require('../config/createToken');
// const SecurePassword = require('../config/securePassword');


// vendor register
exports.VendorRegistration = async (req, res) => {
    // console.log(req.body);
    // return;
    const { vendor_name, reporting_person_name, reporting_person_email, reporting_person_phone, status } = req.body;
    // const setPassword = await SecurePassword(req.body.password);
    try {
        const NewVendor = new VendorModel({
            vendor_name,
            reporting_person_name,
            reporting_person_email,
            reporting_person_phone,
            status,
            // password: setPassword,
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


// get all vendors
exports.getAllVendors = async (req, res) => {
    // console.log(req.body);
    // return;
    try {
        const allVendors = await VendorModel.find();
        return res.status(200).json({ success: true, message: "Data Fetched Successfully", data: allVendors });
    } catch (exc) {
        return res.status(404).json({ success: false, message: "Data Not Found" });
    }
}


// update vendor
exports.updateVendor = async (req, res) => {
    const { vendor_name, reporting_person_name, reporting_person_email, reporting_person_phone, status } = req.body;
    try {
        // Check for duplicate email or phone number
        const duplicateData = await VendorModel.findOne({
            $or: [
                { email: reporting_person_email },
                { phone: reporting_person_phone }
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
                status,
                vendor_logo: "/public/uploads/" + req.file.filename
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