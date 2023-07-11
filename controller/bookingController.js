const BookingModel = require('../model/booking');
const path = require('path');
const pdf = require('html-pdf');
const fs = require('fs-extra')

// take booking
exports.createBooking = async (req, res) => {
    // console.log(req.body);
    // return;
    const { destination, departure_dest, shipment_date_time, customer_name, customer_phone, customer_email, customer_address, product_details, _userID, totalWeight, dimension, chargeableWeight, flight } = req.body;
    try {
        if (!(destination && departure_dest && shipment_date_time && customer_name && customer_phone && customer_email && customer_address && product_details && _userID && totalWeight && dimension && chargeableWeight && flight)) {
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
                flight,
                booking_status: true,
                AWB_number: generateAWBNumber(),
                type: TYPE,
                totalWeight: totalWeight,
                chargeableWeight: dimension,
                dimension: chargeableWeight,
                _vendorId: _userID
            });
            await newBooking.save();

            const tmp_folder = Date.now();
            var dir = path.join(__dirname, '../', 'public', `Download/${tmp_folder}`);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const filePath = path.join(__dirname, '../', 'public', `Download/${tmp_folder}`, `${flight}.html`);
            var fileContent = `<!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            
            <body>
                <h1>Invoice</h1>
                <h5>Destination: ${newBooking?.destination} </h5>
                <h5>Departure Destination: ${newBooking?.departure_dest} </h5>
                <h5>Shipment Date Time: ${newBooking?.shipment_date_time} </h5>
                <h5>Customer Name: ${newBooking?.customer_name} </h5>
                <h5>Customer Phone: ${newBooking?.customer_phone} </h5>
                <h5>Customer Email: ${newBooking?.customer_email} </h5>
                <h5>Customer Address: ${newBooking?.customer_address} </h5>
                <h5>Product Details: ${newBooking?.product_details?.map((item, index) => {
                return (
                    `<br><span key= ${index}>
                    <span>Prduct(${index + 1})==> </span><span>Length: ${item?.Length} ,</span><span>Width: ${item?.width} ,</span><span>Height: ${item?.height} ,</span><span>Weight: ${item?.weight} ,</span><span>Count: ${item?.count === "Total" ? "Total" : "Per Item"} ,</span> <span>Stockable: ${item?.isStockable ? "Yes" : "No"} ,</span><span>Trunable: ${item?.isTrunable ? "Yes" : "No"} ,</span><span>Battery Included: ${item?.isBatteryIncluded ? "Yes" : "No"} ,</span>
                    </span> <br>`
                )
            })}
                </h5>
                <h5>Flight: ${newBooking?.flight} </h5>
                <h5>Booking Status: ${newBooking?.booking_status ? "Success" : "Pending"} </h5>
                <h5>AWB Number: ${newBooking?.AWB_number} </h5>
                <h5>Type: ${newBooking?.type} </h5>
                <h5>Total Weight: ${newBooking?.totalWeight} Kg.</h5>
                <h5>Chargeable Weight: ${newBooking?.chargeableWeight} Kg.</h5>
                <h5>Dimension: ${newBooking?.dimension} cm<sup>3</sup> </h5>
                <h5>Price Paid: 12200/- </h5>
            </body>
            
            </html>`;

            fs.writeFile(filePath, fileContent, (err) => {
                if (err) throw err;
                console.log('File has been saved!');
                const html = fs.readFileSync(filePath, 'utf8');

                const options = {
                    timeout: 300000,
                    format: 'A4',
                    border: {
                        top: '0.5in',
                        right: '0.5in',
                        bottom: '0.5in',
                        left: '0.5in'
                    }
                };

                // pdf create
                pdf.create(html, options).toFile(path.join(__dirname, '../', 'public', `Download/${tmp_folder}`, `${flight?.replace(/\s/g, "")}.pdf`), function (err, result) {
                    if (err) return console.log(err);
                    // console.log({ host: process.env.HOST, result: result, status: true, folder: tmp_folder, file_name: `${flight}.pdf` });
                    res.status(200).json({ success: true, host: process.env.HOST, result: result, status: true, folder: tmp_folder, file_name: `${flight?.replace(/\s/g, "")}.pdf`, message: 'Booking created successfully' });
                });

            });
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


// updateBooking
exports.updateBooking = async (req, res) => {
    // console.log(req.body);
    // console.log(req.params.id);
    // return;
    const { destination, departure_dest, shipment_date_time, customer_name, customer_phone, customer_email, customer_address, product_details, _userID, totalWeight, dimension, chargeableWeight, flight } = req.body;
    try {
        if (!(destination && departure_dest && shipment_date_time && customer_name && customer_phone && customer_email && customer_address && product_details && _userID && totalWeight && dimension && chargeableWeight && flight)) {
            return res.status(400).json({ success: false, message: "All Fields Are Required" });
        } else {

            const updateBooking = await BookingModel.findByIdAndUpdate(
                req.params.id,
                {
                    destination,
                    departure_dest,
                    shipment_date_time,
                    customer_name,
                    customer_phone,
                    customer_email,
                    customer_address,
                    product_details,
                    _userID,
                    totalWeight,
                    dimension,
                    chargeableWeight,
                    flight
                },
                { useFindAndModify: false }
            );

            if (!updateBooking) {
                return res.status(404).json({ success: false, message: "Data Not Found" });
            } else {
                return res.status(200).json({ success: true, message: "Booking Data Updated Successfully" });
            }
        }
    } catch (exc) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
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


// delete file
exports.fileDelete = async (req, res) => {
    const { folder } = req.body;
    const directoryPath = path.join(__dirname, '../', 'public', `Download/${folder}`);
    // console.log(directoryPath);

    try {
        await fs.remove(directoryPath);
        console.log('Directory removed successfully...');
        res.status(200).json({ message: 'Directory removed successfully.' });
    } catch (err) {
        console.error('Error removing directory:', err);
        res.status(500).json({ error: 'Failed to remove directory.' });
    }
}