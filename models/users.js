const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: 'pending' },
    role: { type: String, default: 'user' },
    verificationCode: { type: String },
    verificationAttempts: { type: Number, default: 3 },
    persona: {
        name: { type: String, default: '' },
        surname: { type: String, default: '' },
        nif: { type: String, default: '' },
    },
    isAutonomous: { type: Boolean, default: false },
    company: {
        companyName: { type: String, default: '' },
        cif: { type: String, default: '' },
        address: { type: String, default: '' },
        number: { type: Number, default: '' },
        postal: { type: Number, default: '' },
        city: { type: String, default: '' },
        province: { type: String, default: '' }
    }
    
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
