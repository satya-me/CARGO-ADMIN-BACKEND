const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const airlineSchema = new Schema({
    airline: {
        type: String,
        require: true
    },
    person_name: {
        type: String,
        require: true
    },
    person_designation: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        default: true
    },
    role: {
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
    aireline_logo: {
        type: String
    }
}, { timestamps: true })


module.exports = mongoose.model("airline", airlineSchema);