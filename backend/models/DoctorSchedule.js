// =======================================================
// DERMCARE - DOCTOR SCHEDULE MODEL
// FILE: models/DoctorSchedule.js
// =======================================================

const mongoose = require("mongoose");


// =======================================================
// DOCTOR SCHEDULE SCHEMA
// =======================================================

const doctorScheduleSchema =
    new mongoose.Schema(

        {

            // =================================================
            // DOCTOR REFERENCE
            // =================================================

            DoctorID: {

                type:
                    mongoose.Schema.Types.ObjectId,

                ref:
                    "Doctor",

                required:
                    true,

                unique:
                    true

            },


            // =================================================
            // WEEKLY WORKING HOURS
            // =================================================
            //
            // Each doctor can have different working hours
            // for each day.
            //
            // If StartTime and EndTime are null,
            // the doctor does not work on that day.
            //
            // =================================================

            WeeklySchedule: {


                // =============================================
                // MONDAY
                // =============================================

                Monday: {

                    StartTime: {

                        type:
                            String,

                        default:
                            null

                    },


                    EndTime: {

                        type:
                            String,

                        default:
                            null

                    }

                },


                // =============================================
                // TUESDAY
                // =============================================

                Tuesday: {

                    StartTime: {

                        type:
                            String,

                        default:
                            null

                    },


                    EndTime: {

                        type:
                            String,

                        default:
                            null

                    }

                },


                // =============================================
                // WEDNESDAY
                // =============================================

                Wednesday: {

                    StartTime: {

                        type:
                            String,

                        default:
                            null

                    },


                    EndTime: {

                        type:
                            String,

                        default:
                            null

                    }

                },


                // =============================================
                // THURSDAY
                // =============================================

                Thursday: {

                    StartTime: {

                        type:
                            String,

                        default:
                            null

                    },


                    EndTime: {

                        type:
                            String,

                        default:
                            null

                    }

                },


                // =============================================
                // FRIDAY
                // =============================================

                Friday: {

                    StartTime: {

                        type:
                            String,

                        default:
                            null

                    },


                    EndTime: {

                        type:
                            String,

                        default:
                            null

                    }

                },


                // =============================================
                // SATURDAY
                // =============================================

                Saturday: {

                    StartTime: {

                        type:
                            String,

                        default:
                            null

                    },


                    EndTime: {

                        type:
                            String,

                        default:
                            null

                    }

                },


                // =============================================
                // SUNDAY
                // =============================================

                Sunday: {

                    StartTime: {

                        type:
                            String,

                        default:
                            null

                    },


                    EndTime: {

                        type:
                            String,

                        default:
                            null

                    }

                }

            },


            // =================================================
            // APPOINTMENT SLOT DURATION
            // =================================================
            //
            // Fixed for the DermCare project.
            //
            // Every appointment slot is 20 minutes.
            //
            // =================================================

            SlotDuration: {

                type:
                    Number,

                default:
                    20

            }

        },


        // =====================================================
        // SCHEMA OPTIONS
        // =====================================================

        {

            timestamps: {

                createdAt:
                    "createdAt",

                updatedAt:
                    "updatedAt"

            },


            // =================================================
            // IMPORTANT
            // =================================================
            //
            // Explicitly use the existing MongoDB collection:
            //
            // doctorSchedules
            //
            // This prevents Mongoose from automatically creating:
            //
            // doctorschedules
            //
            // =================================================

            collection:
                "doctorSchedules"

        }

    );


// =======================================================
// EXPORT MODEL
// =======================================================

module.exports =
    mongoose.model(

        "DoctorSchedule",

        doctorScheduleSchema

    );