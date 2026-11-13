const mongoose = require("mongoose");


// =======================================================
// PASSWORD RESET SCHEMA
// =======================================================

const passwordResetSchema = new mongoose.Schema(
    {

        // =================================================
        // PATIENT REFERENCE
        // =================================================

        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },


        // =================================================
        // PATIENT NAME
        // =================================================

        Name: {
            type: String,
            required: true
        },


        // =================================================
        // PATIENT EMAIL
        // =================================================

        Email: {
            type: String,
            required: true
        },


        // =================================================
        // PASSWORD RESET EXPIRY
        // =================================================

        expiry: {
            type: Date,
            required: true
        }

    },


    // =====================================================
    // TIMESTAMPS
    // =====================================================

    {
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "updatedAt"
        }
    }
);


// =======================================================
// EXPORT MODEL
// =======================================================

module.exports =
    mongoose.model(
        "PasswordReset",
        passwordResetSchema
    );