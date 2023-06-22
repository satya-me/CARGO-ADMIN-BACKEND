const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        require: true
    },
    token: {
        type: String,
        require: true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: {
            expires: 86400000 // 24 Hrs.
        }
    }
})

module.exports = mongoose.model("token", tokenSchema);
