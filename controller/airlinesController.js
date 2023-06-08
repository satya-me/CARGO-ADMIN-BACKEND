const AirlineModel = require('../model/airline');


// add airline
exports.addAirline = async (req, res) => {
    // console.log(req.body);
    // return;
    try {
        const { aireline, person_name, person_designation, email, phone, role, status } = req.body;
        const newAirline = await new AirlineModel({
            aireline, person_name, person_designation, email, phone, role, status
        }).save();
        console.log("airlineController line 10===>", newAirline);
        return res.status(201).json({ success: true, message: "Data Added Successfully" })
    } catch (exc) {
        return res.status(404).json({ success: false, message: "Data Not Found" });
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