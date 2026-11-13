
// =======================================================
// DERMCARE EMAIL SERVICE
// FILE: backend/config/email.js
// =======================================================

const nodemailer = require("nodemailer");

// Create Gmail transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
});

// Function to send emails
const sendEmail = async ({ to, subject, text, html }) => {

    try {

        const mailOptions = {
            from: `"DermCare Clinic" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const result = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully:", result.messageId);

        return result;

    } catch (error) {

        console.error("Email sending failed:", error.message);

        throw error;
    }
};

// Verify Gmail connection
const verifyEmailConnection = async () => {

    try {

        await transporter.verify();

        console.log("DermCare email service connected successfully");

        return true;

    } catch (error) {

        console.error("DermCare email connection failed:", error.message);

        return false;
    }
};

module.exports = {
    sendEmail,
    verifyEmailConnection
};
