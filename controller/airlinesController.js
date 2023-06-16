const AirlineModel = require('../model/airline');


// add airline
exports.addAirline = async (req, res) => {
    // console.log(req.body);
    // return;
    const { aireline, person_name, person_designation, email, phone, role, status } = req.body;
    try {
        if (aireline && person_name && person_designation && email && phone && role && status && req.file.filename) {
            const newAirline = await AirlineModel({
                aireline, person_name, person_designation, email, phone, role, status, aireline_logo: "/public/uploads/" + req.file.filename
            });
            const saveAirline = await newAirline.save();
            // console.log("airlineController line 10===>", saveAirline);
            if (saveAirline) {
                return res.status(200).json({ success: true, message: "Data Added Successfully" });
            } else {
                return res.status(400).json({ success: false, message: "Something Went Wrong.Please Try Again" });
            }
        } else {
            return res.status(400).json({ success: false, message: "All Fields Are Required" });
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


// all airline
exports.allAirline = async (req, res) => {
    // console.log(req.body);
    // return;
    try {
        const allAirlines = await AirlineModel.find();
        return res.status(200).json({ success: true, message: "Data Fetched Successfully", data: allAirlines });
    } catch (exc) {
        return res.status(404).json({ success: false, message: "Data Not Found" });
    }
}


// update airlines
exports.updateAirline = async (req, res) => {
    try {
        const { person_name, person_designation, email, phone, role, status } = req.body;

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
            { person_name, person_designation, email, phone, role, status },
            { useFindAndModify: false }
        );

        if (!updateAirline) {
            return res.status(404).json({ success: false, message: "Data Not Found" });
        } else {
            return res.status(200).json({ success: true, message: "Data Updated Successfully" });
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
                return res.status(200).json({ success: true, message: "Data Deleted Successfully" });
            }
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
