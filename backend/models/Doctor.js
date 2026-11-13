const mongoose = require("mongoose");


// =======================================================
// DOCTOR SCHEMA
// =======================================================

const doctorSchema = new mongoose.Schema(
    {

        // =================================================
        // BASIC DOCTOR INFORMATION
        // =================================================

        FullName: {
            type: String,
            required: true,
            trim: true
        },


        Email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },


        Password: {
            type: String,
            required: true
        },


        "Mobile No": {
            type: String,
            required: true,
            trim: true
        },


        // =================================================
        // GENDER
        // =================================================

        gender: {
            type: String,
            required: true,
            enum: [
                "Male",
                "Female",
                "Other"
            ]
        },


        Specialization: {
            type: String,
            required: true,
            trim: true
        },


        Qualification: {
            type: String,
            required: true,
            trim: true
        },


        Experience: {
            type: Number,
            required: true
        },


        // =================================================
        // RECEPTIONIST MANAGED INFORMATION
        // =================================================

        ConsultationFee: {
            type: Number,
            required: true
        },


        // =================================================
        // WORKING DAYS
        // =================================================

        WorkingDays: {
            type: [String],
            required: true,
            default: []
        },


        // =================================================
        // DOCTOR AVAILABILITY
        // =================================================

        Availability: {
            type: String,

            enum: [
                "Available",
                "Not Available"
            ],

            default: "Available"
        },


        // =================================================
        // DOCTOR IMAGE
        // =================================================

        DoctorImage: {
            type: String,
            default: null
        },


        // =================================================
        // ABOUT DOCTOR
        // =================================================

        AboutDoctor: {
            type: String,
            default: "",
            trim: true
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
        "Doctor",
        doctorSchema
    );