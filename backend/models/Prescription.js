const mongoose = require("mongoose");


const prescriptionSchema = new mongoose.Schema(
    {

        PatientID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        DoctorID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        AppointmentID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true
        },

        Medicines: {
            type: String,
            required: true
        },

        Instructions: {
            type: String,
            required: true
        },

        FollowUpDate: {
            type: Date
        }

    },


    {
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "updatedAt"
        }
    }
);


module.exports =
    mongoose.model(
        "Prescription",
        prescriptionSchema
    );