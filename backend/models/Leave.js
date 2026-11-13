
// =======================================================
// DERMCARE - LEAVE MODEL
// FILE: models/Leave.js
// =======================================================

const mongoose = require("mongoose");

// =======================================================
// LEAVE SCHEMA
// =======================================================

const leaveSchema = new mongoose.Schema(
    {
        // =================================================
        // DOCTOR REFERENCE
        // =================================================

        DoctorID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        // =================================================
        // DOCTOR NAME
        // STORED WITH LEAVE
        // =================================================
        //
        // The doctor's name is stored separately so that
        // the leave record can continue showing the doctor's
        // name even if the Doctor document is deleted later.
        //
        // =================================================

        DoctorName: {
            type: String,
            default: "",
            trim: true
        },

        // =================================================
        // LEAVE DATE
        // =================================================

        LeaveDate: {
            type: Date,
            required: true
        },

        // =================================================
        // LEAVE REASON
        // =================================================

        Reason: {
            type: String,
            default: ""
        },

        // =================================================
        // WHO ADDED THE LEAVE
        // =================================================

        AddedBy: {
            type: String,
            enum: ["Receptionist", "Doctor"],
            required: true,
            default: "Doctor"
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
// PREVENT DUPLICATE LEAVE DATES FOR SAME DOCTOR
// =======================================================

leaveSchema.index(
    {
        DoctorID: 1,
        LeaveDate: 1
    },
    {
        unique: true
    }
);

// =======================================================
// EXPORT MODEL
// =======================================================

module.exports = mongoose.model("Leave", leaveSchema);

