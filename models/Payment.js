const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    feeType: {
        type: String,
        required: true,
        enum: ['tuition', 'exam', 'transport', 'other']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'card', 'upi', 'netbanking']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    referenceNumber: String,
    remarks: String,
    paymentDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', paymentSchema); 