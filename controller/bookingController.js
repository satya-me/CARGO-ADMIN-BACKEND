const BookingModel = require('../model/booking');

// take booking
exports.createBooking = async (req, res) => {
    // console.log(req.body);
    // return;
    const { destination, departure_dest, shipment_date_time, customer_name, customer_phone, customer_email, customer_address, product_details, _userID, totalWeight, dimension, chargeableWeight } = req.body;
    try {
        if (!(destination && departure_dest && shipment_date_time && customer_name && customer_phone && customer_email && customer_address && product_details && _userID && totalWeight && dimension && chargeableWeight)) {
            return res.status(400).json({ success: false, message: "All Fields Are Required" });
        } else {
            // generateAWBNumber
            function generateAWBNumber() {
                const length = 10;
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let awbNumber = '';

                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    awbNumber += characters.charAt(randomIndex);
                }
                return awbNumber;
            }
            const TYPE = "A2A";
            const newBooking = new BookingModel({
                destination,
                departure_dest,
                shipment_date_time,
                customer_name,
                customer_phone,
                customer_email,
                customer_address,
                product_details,
                booking_status: true,
                AWB_number: generateAWBNumber(),
                type: TYPE,
                totalWeight: totalWeight,
                chargeableWeight: dimension,
                dimension: chargeableWeight,
                _vendorId: _userID
            });
            // console.log(newBooking);
            // return;

            // var transporter = nodemailer.createTransport({
            //     host: "smtp.gmail.com",
            //     port: 587,
            //     secure: false,
            //     requireTLS: true,
            //     auth: {
            //         user: process.env.EMAIL_ID,
            //         pass: process.env.APP_PASSWORD
            //     },
            // });

            // var mailOptions = {
            //     from: "no-reply@surajit.com",
            //     to: newBooking.customer_email,
            //     subject: "cargo Booking",
            //     text:
            //         "Hello! Your Booking created successfully",
            // };
            // transporter.sendMail(mailOptions, function (err) {
            //     if (err) {
            //         console.log("Technical Issues...");
            //         return res.status(400).json({ success: false, message: "Technical Issues" });
            //     } else {
            //         console.log("Mail Sent.....");
            //         return res.status(200).json({ success: true, message: 'Booking created successfully' });
            //     }
            // });
            await newBooking.save();
            return res.status(200).json({ success: true, message: 'Booking created successfully' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to save booking' });
    }
};


// getAllBookingData
exports.getAllBookingData = async (req, res) => {
    // console.log(req.body);
    // return;
    try {
        const allBookings = await BookingModel.find().populate({
            path: '_vendorId',
            select: '_id type vendor_name reporting_person_name reporting_person_email reporting_person_phone reporting_person_alt_phone HO_address status isDeleted vendor_logo _airlineId'
        });
        return res.status(200).json({ success: true, message: "Data Fetched Successfully", data: allBookings });
    } catch (exc) {
        return res.status(404).json({ success: false, message: "Data Not Found" });
    }
}


// delete booking (soft delete)
exports.deleteBooking = async (req, res) => {
    // console.log(req.params);
    // return;
    try {
        const booking = await BookingModel.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Data Not Found" });
        } else {
            const deleteBooking = await BookingModel.findByIdAndUpdate(
                req.params.id,
                { isDeleted: true }
            );
            if (!deleteBooking) {
                return res.status(404).json({ success: false, message: "Data Not Found" });
            } else {
                // const DELETED_ADMIN_DATA = await BookingModel.findById(req.params.id, { password: 0 });
                return res.status(200).json({ success: true, message: "Booking Deleted Successfully" });
            }
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}