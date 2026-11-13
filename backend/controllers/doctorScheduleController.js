// =======================================================
// DERMCARE - DOCTOR SCHEDULE CONTROLLER
// FILE: controllers/doctorScheduleController.js
// =======================================================


// =======================================================
// IMPORT MONGOOSE
// =======================================================

const mongoose =
    require("mongoose");


// =======================================================
// IMPORT DOCTOR SCHEDULE MODEL
// =======================================================

const DoctorSchedule =
    require("../models/DoctorSchedule");


// =======================================================
// SAVE OR UPDATE DOCTOR WEEKLY SCHEDULE
// =======================================================

const saveDoctorSchedule =
    async (req, res) => {

        try {

            // =============================================
            // GET DATA FROM REQUEST BODY
            // =============================================

            const {

                DoctorID,

                WeeklySchedule

            } =
                req.body;


            // =============================================
            // DEBUG
            // =============================================

            console.log(
                "Saving doctor schedule..."
            );

            console.log(
                "Doctor ID:",
                DoctorID
            );

            console.log(
                "Weekly Schedule:",
                WeeklySchedule
            );


            // =============================================
            // VALIDATE DOCTOR ID EXISTS
            // =============================================

            if (!DoctorID) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Doctor ID is required."

                });

            }


            // =============================================
            // VALIDATE MONGODB OBJECT ID
            // =============================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    DoctorID
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid Doctor ID."

                });

            }


            // =============================================
            // VALIDATE WEEKLY SCHEDULE
            // =============================================

            if (!WeeklySchedule) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Weekly schedule is required."

                });

            }


            // =============================================
            // CONVERT DOCTOR ID TO OBJECT ID
            // =============================================

            const doctorObjectId =
                new mongoose.Types.ObjectId(
                    DoctorID
                );


            // =============================================
            // SAVE OR UPDATE
            //
            // findOneAndUpdate prevents duplicate schedules.
            //
            // Each doctor has only one schedule.
            // =============================================

            const doctorSchedule =
                await DoctorSchedule.findOneAndUpdate(

                    {

                        DoctorID:
                            doctorObjectId

                    },

                    {

                        $set:
                            {

                                WeeklySchedule:
                                    WeeklySchedule,

                                SlotDuration:
                                    20

                            }

                    },

                    {

                        new:
                            true,

                        upsert:
                            true,

                        runValidators:
                            true

                    }

                );


            // =============================================
            // SUCCESS
            // =============================================

            console.log(
                "Doctor schedule saved successfully:"
            );

            console.log(
                doctorSchedule
            );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Working hours saved successfully.",

                doctorSchedule:
                    doctorSchedule

            });

        }


        catch (error) {

            // =============================================
            // SHOW FULL ERROR IN NODE TERMINAL
            // =============================================

            console.error(
                "Error saving doctor schedule:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Server error while saving working hours.",

                error:
                    error.message

            });

        }

    };


// =======================================================
// GET LOGGED-IN DOCTOR SCHEDULE
// =======================================================

const getDoctorSchedule =
    async (req, res) => {

        try {

            // =============================================
            // GET DOCTOR ID FROM URL
            // =============================================

            const {

                doctorId

            } =
                req.params;


            // =============================================
            // DEBUG
            // =============================================

            console.log(
                "Getting schedule for Doctor ID:",
                doctorId
            );


            // =============================================
            // VALIDATE DOCTOR ID
            // =============================================

            if (!doctorId) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Doctor ID is required."

                });

            }


            // =============================================
            // VALIDATE OBJECT ID
            // =============================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    doctorId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid Doctor ID."

                });

            }


            // =============================================
            // CONVERT TO OBJECT ID
            // =============================================

            const doctorObjectId =
                new mongoose.Types.ObjectId(
                    doctorId
                );


            // =============================================
            // FIND SCHEDULE
            //
            // Collection explicitly configured as:
            //
            // doctorSchedules
            // =============================================

            const doctorSchedule =
                await DoctorSchedule.findOne({

                    DoctorID:
                        doctorObjectId

                });


            // =============================================
            // NO SCHEDULE
            // =============================================

            if (!doctorSchedule) {

                console.log(
                    "No working schedule found."
                );


                return res.status(200).json({

                    success:
                        true,

                    message:
                        "No working hours found for this doctor.",

                    doctorSchedule:
                        null

                });

            }


            // =============================================
            // SCHEDULE FOUND
            // =============================================

            console.log(
                "Doctor schedule found:",
                doctorSchedule
            );


            return res.status(200).json({

                success:
                    true,

                doctorSchedule:
                    doctorSchedule

            });

        }


        catch (error) {

            // =============================================
            // SHOW FULL ERROR
            // =============================================

            console.error(
                "Error getting doctor schedule:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Server error while getting working hours.",

                error:
                    error.message

            });

        }

    };


// =======================================================
// EXPORT CONTROLLER FUNCTIONS
// =======================================================

module.exports =
    {

        saveDoctorSchedule,

        getDoctorSchedule

    };