const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send payment confirmation email
exports.sendPaymentConfirmation = async (email, payment) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Payment Confirmation - JNTUA Fee Management System',
            html: `
                <h1>Payment Confirmation</h1>
                <p>Dear ${payment.studentDetails.name},</p>
                <p>Your payment has been successfully processed.</p>
                <h2>Payment Details:</h2>
                <ul>
                    <li>Transaction ID: ${payment.transactionId}</li>
                    <li>Reference Number: ${payment.referenceNumber}</li>
                    <li>Amount: ₹${payment.amount}</li>
                    <li>Fee Type: ${payment.feeType}</li>
                    <li>Payment Date: ${payment.paymentDate}</li>
                    <li>Status: ${payment.status}</li>
                </ul>
                <p>Thank you for your payment.</p>
                <p>Best regards,<br>JNTUA Fee Management Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Payment confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        throw error;
    }
};

// Send payment reminder email
exports.sendPaymentReminder = async (email, studentName, dueAmount, dueDate) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Payment Reminder - JNTUA Fee Management System',
            html: `
                <h1>Payment Reminder</h1>
                <p>Dear ${studentName},</p>
                <p>This is a reminder that you have a pending payment:</p>
                <ul>
                    <li>Amount Due: ₹${dueAmount}</li>
                    <li>Due Date: ${dueDate}</li>
                </ul>
                <p>Please ensure timely payment to avoid any late fees.</p>
                <p>Best regards,<br>JNTUA Fee Management Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Payment reminder email sent successfully');
    } catch (error) {
        console.error('Error sending payment reminder email:', error);
        throw error;
    }
};