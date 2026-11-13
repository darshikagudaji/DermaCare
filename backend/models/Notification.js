
// =======================================================
// DERMCARE - NOTIFICATION MODEL
// FILE: models/Notification.js
// =======================================================

const mongoose = require("mongoose");

// =======================================================
// CREATE NOTIFICATION SCHEMA
// =======================================================

const notificationSchema = new mongoose.Schema(
    {
        PatientID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        Title: {
            type: String,
            required: true
        },

        Message: {
            type: String,
            required: true
        },

        Type: {
            type: String,
            enum: [
                "Rescheduled",
                "Reminder",
                "Cancelled"
            ],
            required: true
        },

        IsRead: {
            type: Boolean,
            default: false
        },

        AppointmentID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: false
        },

        // Prevent duplicate reminder notifications
        ReminderForDate: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// =======================================================
// PREVENT DUPLICATE REMINDER NOTIFICATIONS
// Same appointment + same reminder date = one notification
// =======================================================

notificationSchema.index(
    {
        PatientID: 1,
        AppointmentID: 1,
        ReminderForDate: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            Type: "Reminder"
        }
    }
);

// =======================================================
// EXPORT NOTIFICATION MODEL
// =======================================================

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);
