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
        require: true
    },
    status: {
        type: String,
        require: true
    },
    password: {
        type: String,
        // require: true
    },
    profile_img: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        dafault: "admin"
    }
}, { timestamps: true })


module.exports = mongoose.model("admin", adminSchema);