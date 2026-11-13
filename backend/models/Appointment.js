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

                type:
                    mongoose.Schema.Types.ObjectId,

                ref:
                    "Patient",

                required:
                    true

            },


            // ===================================================
            // DOCTOR
            // ===================================================

            DoctorID: {

                type:
                    mongoose.Schema.Types.ObjectId,

                ref:
                    "Doctor",

                required:
                    true

            },


            // ===================================================
            // DOCTOR NAME
            // STORED WITH APPOINTMENT
            // ===================================================
            //
            // The doctor's name is stored separately so that
            // historical appointments continue to show the
            // doctor's name even if the Doctor document is
            // deleted later.
            //
            // ===================================================

            DoctorName: {

                type:
                    String,

                default:
                    "",

                trim:
                    true

            },


            // ===================================================
            // REASON FOR VISIT
            // ADDED: Patient's reason for booking appointment
            // ===================================================

            ReasonForVisit: {

                type:
                    String,

                default:
                    "",

                trim:
                    true

            },


            // ===================================================
            // SYMPTOMS
            // ADDED: Symptoms described by the patient
            // ===================================================

            Symptoms: {

                type:
                    String,

                default:
                    "",

                trim:
                    true

            },


            // ===================================================
            // ALLERGIES
            // ADDED: Patient's allergy selection
            // ===================================================
            //
            // Example:
            // No known allergies
            // Medicine Allergy
            // Food Allergy
            // Skin/Product Allergy
            // Other
            //
            // ===================================================

            Allergies: {

                type:
                    String,

                default:
                    "No known allergies",

                trim:
                    true

            },


            // ===================================================
            // ALLERGY DETAILS
            // ADDED: Additional allergy information
            // ===================================================

            AllergyDetails: {

                type:
                    String,

                default:
                    "",

                trim:
                    true

            },


            // ===================================================
            // APPOINTMENT DATE
            // ===================================================

            AppointmentDate: {

                type:
                    Date,

                required:
                    true

            },


            // ===================================================
            // APPOINTMENT TIME
            // ===================================================

            AppointmentTime: {

                type:
                    String,

                required:
                    true

            },


            // ===================================================
            // APPOINTMENT TYPE
            // ===================================================
            //
            // Online
            // Walk-in
            //
            // ===================================================

            AppointmentType: {

                type:
                    String,

                required:
                    true,

                enum:
                    [
                        "Online",
                        "Walk-in"
                    ]

            },


            // ===================================================
            // APPOINTMENT STATUS
            // ===================================================

            Status: {

                type:
                    String,

                required:
                    true,

                enum:
                    [
                        "Booked",
                        "Arrived",
                        "Completed",
                        "Cancelled"
                    ],

                default:
                    "Booked"

            },


            // ===================================================
            // ACTIVE SLOT KEY
            // ADDED: Prevent simultaneous duplicate bookings
            // ===================================================
            //
            // A unique key is stored while the appointment
            // occupies a slot (Booked or Arrived).
            //
            // Cancelled and Completed appointments must set
            // this field to null to release the slot.
            //
            // ===================================================

            ActiveSlotKey: {

                type:
                    String,

                default:
                    null

            },


            // ===================================================
            // CANCELLATION DETAILS
            // ADDED: Store cancellation reason separately
            // ===================================================

            CancellationReason: {

                type:
                    String,

                default:
                    ""

            },


            CancelledBy: {

                type:
                    String,

                default:
                    ""

            },


            CancelledAt: {

                type:
                    Date,

                default:
                    null

            },


            // ==========================================
// REMINDER TRACKING
// ==========================================

ReminderEmailSentForDate: {
    type: String,
    default: ""
},

ReminderNotificationSentForDate: {
    type: String,
    default: ""
},

            // ===================================================
            // RESCHEDULE HISTORY
            // ADDED: Keep each reschedule action separately
            // ===================================================

            RescheduleHistory: [

                {

                    PreviousDate: {

                        type:
                            Date,

                        required:
                            true

                    },


                    PreviousTime: {

                        type:
                            String,

                        required:
                            true

                    },


                    NewDate: {

                        type:
                            Date,

                        required:
                            true

                    },


                    NewTime: {

                        type:
                            String,

                        required:
                            true

                    },


                    Reason: {

                        type:
                            String,

                        default:
                            ""

                    },


                    RescheduledBy: {

                        type:
                            String,

                        default:
                            ""

                    },


                    RescheduledAt: {

                        type:
                            Date,

                        default:
                            Date.now

                    }

                }

            ]

        },


        // =======================================================
        // TIMESTAMPS
        // =======================================================

        {

            timestamps: {

                createdAt:
                    "createdAt",

                updatedAt:
                    "updatedAt"

            }

        }

    );


// =======================================================
// IMPORTANT: PREVENT SIMULTANEOUS DUPLICATE BOOKINGS
// =======================================================
//
// MongoDB unique index ensures that only one appointment
// can occupy a doctor/date/time slot.
//
// ActiveSlotKey must be generated consistently by the
// backend using DoctorID + AppointmentDate + AppointmentTime.
//
// Booked and Arrived appointments keep the key.
// Cancelled and Completed appointments release the key
// by setting ActiveSlotKey to null.
//
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