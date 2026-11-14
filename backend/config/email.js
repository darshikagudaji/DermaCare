
 // =======================================================
 // DERMCARE EMAIL SERVICE
 // FILE: backend/config/email.js
 // EMAIL PROVIDER: GOOGLE APPS SCRIPT
 // =======================================================


// =======================================================
// SEND EMAIL USING GOOGLE APPS SCRIPT
// =======================================================

const sendEmail = async ({ to, subject, text, html }) => {

    try {

        const scriptURL = process.env.APPS_SCRIPT_URL;
        const secret = process.env.APPS_SCRIPT_SECRET;

        // Check environment variables
        if (!scriptURL || !secret) {
            throw new Error("Google Apps Script email settings are missing.");
        }

        // Send email request to Google Apps Script
        const response = await fetch(scriptURL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                token: secret,
                to,
                subject,
                text,
                html
            })

        });

        // Read response
        const responseText = await response.text();

        let result;

        try {
            result = JSON.parse(responseText);
        } catch (error) {
            throw new Error("Invalid response from Google Apps Script.");
        }

        // Check whether email was sent
        if (!response.ok || !result.success) {

            throw new Error(
                result.message || "Google Apps Script could not send the email."
            );

        }

        console.log("Email sent successfully through Google Apps Script.");

        return result;

    } catch (error) {

        console.error("Email sending failed:", error.message);

        throw error;

    }

};


// =======================================================
// VERIFY EMAIL SERVICE CONFIGURATION
// =======================================================

const verifyEmailConnection = async () => {

    try {

        const scriptURL = process.env.APPS_SCRIPT_URL;
        const secret = process.env.APPS_SCRIPT_SECRET;

        if (!scriptURL || !secret) {

            throw new Error("Google Apps Script settings are missing.");

        }

        console.log("DermCare Google Apps Script email settings are configured.");

        return true;

    } catch (error) {

        console.error(
            "DermCare email configuration failed:",
            error.message
        );

        return false;

    }

};


// =======================================================
// EXPORT FUNCTIONS
// =======================================================

module.exports = {
    sendEmail,
    verifyEmailConnection
};
