// model/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'partner'],
        default: 'user'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpiry: Date
}, {
    timestamps: true
});

module.exports = mongoose.model("users", userSchema);
