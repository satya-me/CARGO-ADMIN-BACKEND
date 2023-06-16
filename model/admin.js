const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const adminSchema = new Schema({
    full_name: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    role: {
        type: String,
        default: "Super Admin"
    },
    status: {
        type: String,
        default: true
    },
    password: {
        type: String,
        require: true
    },
}, { timestamps: true })


module.exports = mongoose.model("admin", adminSchema);