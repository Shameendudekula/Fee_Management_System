const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const crypto = require('crypto');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Use App Password for Gmail
    }
});

// Function to send reset password email
const sendResetEmail = async (email, resetToken) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset. Please use the following code to reset your password:</p>
                <h3>${resetToken}</h3>
                <p>This code will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

// Validation middleware
const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    next();
};

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Send welcome email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Fee Management System',
            html: `
                <h2>Welcome ${username}!</h2>
                <p>Thank you for registering with our Fee Management System.</p>
                <p>You can now log in and start managing your payments.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send login notification email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'New Login Detected',
            html: `
                <h2>New Login Alert</h2>
                <p>A new login was detected on your account.</p>
                <p>Time: ${new Date().toLocaleString()}</p>
                <p>If this wasn't you, please reset your password immediately.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

// Request password reset
router.post('/reset-password-request', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();
        const hashedToken = await bcrypt.hash(resetToken, 10);

        // Save hashed token to user
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send reset email
        const emailSent = await sendResetEmail(email, resetToken);

        if (emailSent) {
            res.json({ message: 'Password reset instructions sent to email' });
        } else {
            res.status(500).json({ message: 'Error sending reset email' });
        }
    } catch (error) {
        console.error('Reset request error:', error);
        res.status(500).json({ message: 'Error processing reset request' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        // Verify reset code
        const isValidCode = await bcrypt.compare(code, user.resetPasswordToken);
        if (!isValidCode) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Send password change confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Changed Successfully',
            html: `
                <h2>Password Change Confirmation</h2>
                <p>Your password has been changed successfully.</p>
                <p>Time: ${new Date().toLocaleString()}</p>
                <p>If you didn't make this change, please contact support immediately.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Update account settings route
router.put('/update-account', async (req, res) => {
    try {
        const { userId } = req.user; // From auth middleware
        const { username, password } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (username) user.username = username;
        if (password) user.password = password;

        await user.save();

        res.json({
            success: true,
            message: 'Account updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating account',
            error: error.message
        });
    }
});

module.exports = router;