const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: 'pending' },
    role: { type: String, default: 'user' },
    verificationCode: { type: String },
    verificationAttempts: { type: Number, default: 3 },
    name: { type: String },
    surname: { type: String },
    nif: { type: String },
    isAutonomous: { type: Boolean, default: false },
    companyName: { type: String },
    cif: { type: String },
    address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
