require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for port 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
    const { name, email, message, package: packageType, phone, company } = req.body;

    // Validate required fields
    if (!name || !email || !message || !packageType) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    // Email to admin
    const adminMailOptions = {
        from: 'Rocky Mountain Web Services <noreply@rockymountainwebservices.com>',
        to: 'dmercill@protonmail.com',
        subject: `New Contact Form Submission - ${packageType}`,
        html: `
            <html>
            <head>
                <title>New Contact Form Submission</title>
            </head>
            <body>
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Company:</strong> ${company || 'Not provided'}</p>
                <p><strong>Package:</strong> ${packageType}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            </body>
            </html>
        `
    };

    // Auto-reply to client
    const clientMailOptions = {
        from: 'Rocky Mountain Web Services <noreply@rockymountainwebservices.com>',
        to: email,
        subject: 'Thank you for contacting Rocky Mountain Web Services',
        html: `
            <html>
            <head>
                <title>Thank you for contacting Rocky Mountain Web Services</title>
            </head>
            <body>
                <h2>Thank you for reaching out!</h2>
                <p>Dear ${name},</p>
                <p>We've received your inquiry about our ${packageType} package. Our team will review your request and get back to you within 24 hours.</p>
                <p>Here's a summary of your submission:</p>
                <ul>
                    <li>Package: ${packageType}</li>
                    <li>Message: ${message}</li>
                </ul>
                <p>Best regards,<br>Rocky Mountain Web Services Team</p>
            </body>
            </html>
        `
    };

    try {
        // Send emails
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(clientMailOptions)
        ]);

        res.json({
            success: true,
            message: "Your message has been sent. We'll be in touch soon!"
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});