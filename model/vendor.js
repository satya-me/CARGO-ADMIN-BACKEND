const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const vendorSchema = new Schema({
    vendor_name: {
        type: String,
        require: true
    },
    reporting_person_name: {
        type: String,
        require: true
    },
    reporting_person_email: {
        type: String,
        require: true
    },
    reporting_person_phone: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    status: {
        type: String,
        default: true
    },
    vendor_logo: {
        type: String,
        require: true
    }
}, { timestamps: true })


module.exports = mongoose.model("vendor", vendorSchema);