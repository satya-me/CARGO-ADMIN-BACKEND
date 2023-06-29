const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const vendorSchema = new Schema({
    type: {
        type: String,
        dafault: "vendor"
    },
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
    reporting_person_alt_phone: {
        type: String,
    },
    HO_address: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    role: {
        type: String,
        require: true
    },
    password: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    vendor_logo: {
        type: String
    },
    _airlineId: {
        type: Schema.Types.ObjectId,
        ref: "airline",
        require: true
    }
}, { timestamps: true })


module.exports = mongoose.model("vendor", vendorSchema);