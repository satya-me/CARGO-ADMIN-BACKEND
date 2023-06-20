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
        require: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    vendor_logo: {
        type: String
    }
}, { timestamps: true })


module.exports = mongoose.model("vendor", vendorSchema);