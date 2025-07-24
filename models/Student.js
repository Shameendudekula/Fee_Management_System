const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    class: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    parentName: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        required: true
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    totalFees: {
        type: Number,
        required: true
    },
    pendingDues: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
});

module.exports = mongoose.model('Student', studentSchema); 