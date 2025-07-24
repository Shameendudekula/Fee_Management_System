const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path'); // Import path module

const app = express();
const PORT = 3001;
require('dotenv').config(); // Load environment variables from .env file


const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/dbname');


// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    admissionNumber: { type: String, required: true },
    purpose: { type: String, required: true },
    referralCode: { type: String }
});

// Models
const User = mongoose.model('User ', userSchema);
const Payment = mongoose.model('Payment', paymentSchema);

// Admin credentials
const adminCredentials = {
    username: "admin",
    password: "admin123"
};


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jntua.fees@gmail.com', 
        pass: 'jntuafees@123' 
    }
});



// User Registration
app.post('/api/signup', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser  = new User({ username, email, password: hashedPassword, verificationToken });

    try {
        await newUser.save();

        // Send verification email
        const verificationUrl = `http://localhost:${PORT}/api/verify/${verificationToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Email Verification',
            html: `<p>Please click the link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a></p>`
        });

        res.json({ success: true, message: 'Registration successful! Please check your email to verify your account.' });
    } catch (error) {
        res.status(500).json({ error: 'User  registration failed' });
    }
});

// Email Verification
app.get('/api/verify/:token', async (req, res) => {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
        return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.json({ success: true, message: 'Email verified successfully!' });
});

// User Login
app.post('/api/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: 'Email not verified' });
        }
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
});

// Add Payment Record
app.post('/api/payments', [
    body('username').notEmpty().withMessage('Username is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('status').notEmpty().withMessage('Status is required'),
    body('admissionNumber').notEmpty().withMessage('Admission Number is required'),
    body('purpose').notEmpty().withMessage('Purpose is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const payment = new Payment(req.body);
    try {
        await payment.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add payment record' });
    }
});

// Get Payment Records
app.get('/api/payments/:username', async (req, res) => {
    try {
        const payments = await Payment.find({ username: req.params.username });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve payment records' });
    }
});

// Delete Payment Record
app.delete('/api/payments/:id', async (req, res) => {
    try {
        await Payment.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete payment record' });
    }
});

// Forgot Password
app.post('/api/forgot-password', [
    body('email').isEmail().withMessage('Invalid email format')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'No account found with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:${PORT}/api/reset-password/${resetToken}`;

    try {
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset',
            html: `<p>Please click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`
        });
        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send password reset email' });
    }
});

// Reset Password
app.post('/api/reset-password/:token', [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined; // Clear the token
    user.resetPasswordExpires = undefined; // Clear the expiration
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
});

// Reset Password
app.post('/api/reset-password/:token', [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined; // Clear the token
    user.resetPasswordExpires = undefined; // Clear the expiration
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,"public",'FeeManagementSystem.html'));
    res.sendFile(path.join(__dirname,"public", 'servicespage.html'));
    res.sendFile(path.join(__dirname,"public", 'feedback&suggestionspage.html'));
    res.sendFile(path.join(__dirname,"public", 'contactpage.html'));
    res.sendFile(path.join(__dirname,"public", 'feestructurepage.html'));
    res.sendFile(path.join(__dirname, "public",'payment.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
require('dotenv').config(); // Load environment variables from .env file