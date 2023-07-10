const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// The sub-schema for product details
const productSchema = new Schema({
    Length: {
        type: String,
        required: true
    },
    width: {
        type: String,
        required: true
    },
    height: {
        type: String,
        required: true
    },
    weight: {
        type: String,
        required: true
    },
    count: {
        type: String,
        required: true
    },
    isStockable: {
        type: Boolean,
        required: true
    },
    isTrunable: {
        type: Boolean,
        required: true
    },
    isBatteryIncluded: {
        type: Boolean,
        required: true
    }
});

// The main booking schema
const bookingSchema = new Schema({
    destination: {
        type: String,
        required: true
    },
    departure_dest: {
        type: String,
        required: true
    },
    flight: {
        type: String,
        required: true
    },
    shipment_date_time: {
        type: String,
        required: true
    },
    customer_name: {
        type: String,
        required: true
    },
    customer_phone: {
        type: String,
        required: true
    },
    customer_email: {
        type: String,
        required: true
    },
    customer_address: {
        type: String,
        required: true
    },
    booking_status: {
        type: Boolean,
        default: false
    },
    AWB_number: {
        type: String,
    },
    type: {
        type: String,
    },
    product_details: {
        type: [productSchema],
        required: true
    },
    _vendorId: {
        type: Schema.Types.ObjectId,
        ref: "vendor",
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    totalWeight: {
        type: Number,
    },
    chargeableWeight: {
        type: Number,
    },
    dimension: {
        type: Number,
    },
}, { timestamps: true });

module.exports = mongoose.model("booking", bookingSchema);
