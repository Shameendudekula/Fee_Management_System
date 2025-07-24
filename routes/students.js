const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');

// Validation middleware
const validateStudent = (req, res, next) => {
    const { name, rollNumber, email, contactNumber } = req.body;
    
    if (!name || !rollNumber || !email || !contactNumber) {
        return res.status(400).json({ message: 'Required fields missing' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Contact number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(contactNumber)) {
        return res.status(400).json({ message: 'Invalid contact number' });
    }

    next();
};

// Get all students with pagination
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const students = await Student.find()
            .skip(skip)
            .limit(limit)
            .sort({ admissionDate: -1 });

        const total = await Student.countDocuments();

        res.json({
            students,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalStudents: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single student with payment history
router.get('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Get payment history
        const payments = await Payment.find({ studentId: req.params.id })
            .sort({ paymentDate: -1 });

        res.json({
            student,
            payments
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }
        res.status(500).json({ message: error.message });
    }
});

// Create new student
router.post('/', [auth, validateStudent], async (req, res) => {
    try {
        // Check for duplicate roll number
        const existingStudent = await Student.findOne({ rollNumber: req.body.rollNumber });
        if (existingStudent) {
            return res.status(400).json({ message: 'Roll number already exists' });
        }

        const student = new Student(req.body);
        const newStudent = await student.save();
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update student
router.patch('/:id', [auth, validateStudent], async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if roll number is being changed and is unique
        if (req.body.rollNumber && req.body.rollNumber !== student.rollNumber) {
            const existingStudent = await Student.findOne({ rollNumber: req.body.rollNumber });
            if (existingStudent) {
                return res.status(400).json({ message: 'Roll number already exists' });
            }
        }

        Object.keys(req.body).forEach(key => {
            if (req.body[key] != null) {
                student[key] = req.body[key];
            }
        });

        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }
        res.status(400).json({ message: error.message });
    }
});

// Delete student
router.delete('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student has any payments before deletion
        const payments = await Payment.countDocuments({ studentId: req.params.id });
        if (payments > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete student with existing payments' 
            });
        }

        await student.deleteOne();
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;