const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// Get all payments
router.get('/', auth, async (req, res) => {
    try {
        const payments = await Payment.find().populate('studentId');
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get payments for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ studentId: req.params.studentId });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new payment
router.post('/', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.body.studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const payment = new Payment({
            studentId: req.body.studentId,
            amount: req.body.amount,
            feeType: req.body.feeType,
            paymentMethod: req.body.paymentMethod,
            transactionId: req.body.transactionId,
            referenceNumber: req.body.referenceNumber,
            remarks: req.body.remarks
        });

        const newPayment = await payment.save();

        // Update student's pending dues
        student.pendingDues -= req.body.amount;
        await student.save();

        res.status(201).json(newPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get payment statistics (for admin dashboard)
router.get('/stats', auth, async (req, res) => {
    try {
        const totalPayments = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const paymentsByType = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: '$feeType', total: { $sum: '$amount' } } }
        ]);

        const recentPayments = await Payment.find()
            .sort({ paymentDate: -1 })
            .limit(5)
            .populate('studentId');

        res.json({
            totalCollected: totalPayments[0]?.total || 0,
            paymentsByType,
            recentPayments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get payment receipt
router.get('/:id/receipt', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('studentId');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;