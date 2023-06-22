const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const adminSchema = new Schema({
    full_name: {
        type: String,
        require: [true, "Full Name Is Required"]
    },
    username: {
        type: String,
        require: [true, "Username Is Required"]
    },
    email: {
        type: String,
        require: [true, "Email ID Is Required"]
    },
    phone: {
        type: String,
        require: [true, "Phone Number Is Required"]
    },
    role: {
        type: String,
        require: [true, "User Role Is Required"]
    },
    status: {
        type: String,
        require: [true, "User Status Is Required"]
    },
    password: {
        type: String,
        // require: [true,"Password Is Required"]
    },
    profile_img: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    admin_type: {
        type: String,
        dafault: "admin"
    },
}, { timestamps: true })


module.exports = mongoose.model("admin", adminSchema);