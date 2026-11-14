
// =======================================================
// DERMCARE - APPOINTMENT MODEL
// FILE: models/Appointment.js
// =======================================================


// =======================================================
// IMPORT MONGOOSE
// =======================================================

const mongoose =
    require("mongoose");


// =======================================================
// CREATE APPOINTMENT SCHEMA
// =======================================================

const appointmentSchema =
    new mongoose.Schema(
        {

            // ===================================================
            // PATIENT
            // ===================================================

            PatientID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Patient",
                required: true
            },


            // ===================================================
            // DOCTOR
            // ===================================================

            DoctorID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Doctor",
                required: true
            },


            // ===================================================
            // DOCTOR NAME
            // ===================================================

            DoctorName: {
                type: String,
                default: "",
                trim: true
            },


            // ===================================================
            // REASON FOR VISIT
            // ===================================================

            ReasonForVisit: {
                type: String,
                default: "",
                trim: true
            },


            // ===================================================
            // SYMPTOMS
            // ===================================================

            Symptoms: {
                type: String,
                default: "",
                trim: true
            },


            // ===================================================
            // ALLERGIES
            // ===================================================

            Allergies: {
                type: String,
                default: "No known allergies",
                trim: true
            },


            // ===================================================
            // ALLERGY DETAILS
            // ===================================================

            AllergyDetails: {
                type: String,
                default: "",
                trim: true
            },


            // ===================================================
            // APPOINTMENT DATE
            // ===================================================

            AppointmentDate: {
                type: Date,
                required: true
            },


            // ===================================================
            // APPOINTMENT TIME
            // ===================================================

            AppointmentTime: {
                type: String,
                required: true
            },


            // ===================================================
            // APPOINTMENT TYPE
            // ===================================================

            AppointmentType: {
                type: String,
                required: true,
                enum: [
                    "Online",
                    "Walk-in"
                ]
            },


            // ===================================================
            // APPOINTMENT STATUS
            // ===================================================

            Status: {
                type: String,
                required: true,
                enum: [
                    "Booked",
                    "Arrived",
                    "Completed",
                    "Cancelled"
                ],
                default: "Booked"
            },


            // ===================================================
            // ACTIVE SLOT KEY
            // ===================================================

            ActiveSlotKey: {
                type: String,
                default: null
            },


            // ===================================================
            // CANCELLATION DETAILS
            // ===================================================

            CancellationReason: {
                type: String,
                default: ""
            },

            CancelledBy: {
                type: String,
                default: ""
            },

            CancelledAt: {
                type: Date,
                default: null
            },


            // ===================================================
            // REMINDER TRACKING
            // ===================================================

            // Tracks the day-before reminder email (9 AM IST)
            ReminderEmailSentForDate: {
                type: String,
                default: ""
            },

            // Tracks the dashboard reminder notification
            ReminderNotificationSentForDate: {
                type: String,
                default: ""
            },

            // NEW: Tracks the appointment-day reminder email (7 AM IST)
            AppointmentDayReminderEmailSentForDate: {
                type: String,
                default: ""
            },


            // ===================================================
            // RESCHEDULE HISTORY
            // ===================================================

            RescheduleHistory: [

                {

                    PreviousDate: {
                        type: Date,
                        required: true
                    },

                    PreviousTime: {
                        type: String,
                        required: true
                    },

                    NewDate: {
                        type: Date,
                        required: true
                    },

                    NewTime: {
                        type: String,
                        required: true
                    },

                    Reason: {
                        type: String,
                        default: ""
                    },

                    RescheduledBy: {
                        type: String,
                        default: ""
                    },

                    RescheduledAt: {
                        type: Date,
                        default: Date.now
                    }

                }

            ]

        },


        // =======================================================
        // TIMESTAMPS
        // =======================================================

        {
            timestamps: {
                createdAt: "createdAt",
                updatedAt: "updatedAt"
            }
        }

    );


// =======================================================
// PREVENT SIMULTANEOUS DUPLICATE BOOKINGS
// =======================================================

appointmentSchema.index(
    {
        ActiveSlotKey: 1
    },
    {
        unique: true,
        name: "unique_active_appointment_slot",
        partialFilterExpression: {
            ActiveSlotKey: {
                $type: "string"
            }
        }
    }
);


// =======================================================
// EXPORT APPOINTMENT MODEL
// =======================================================

module.exports =
    mongoose.model(
        "Appointment",
        appointmentSchema
    );
