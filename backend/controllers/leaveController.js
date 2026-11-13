// =======================================================
// DERMCARE - LEAVE CONTROLLER
// FILE: controllers/leaveController.js
// =======================================================


// =======================================================
// IMPORT MODELS
// =======================================================

const Leave = require("../models/Leave");
const Doctor = require("../models/Doctor");


// =======================================================
// HELPER - CONVERT DATE TO YYYY-MM-DD
// =======================================================

function formatDateOnly(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "";
    }

    const year = date.getUTCFullYear();

    const month = String(
        date.getUTCMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getUTCDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// =======================================================
// HELPER - CREATE UTC NOON DATE
// =======================================================

function createUTCNoonDate(dateString) {

    const parts = dateString
        .split("-")
        .map(Number);

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    return new Date(
        Date.UTC(
            year,
            month - 1,
            day,
            12,
            0,
            0,
            0
        )
    );

}


// =======================================================
// ADD LEAVE
// =======================================================
// POST /api/leaves/add
//
// Required:
// - doctorId
// - leaveDate
//
// Optional:
// - reason
// - AddedBy ("Receptionist" or "Doctor")
// =======================================================

const addLeave = async (req, res) => {

    try {

        console.log("Add leave request received");

        console.log("Received data:", req.body);


        // ===================================================
        // GET DATA FROM FRONTEND
        // ===================================================

        const {
            doctorId,
            leaveDate,
            reason,
            AddedBy
        } = req.body;


        // ===================================================
        // CHECK REQUIRED FIELDS
        // ===================================================

        if (!doctorId || !leaveDate) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide doctor and leave date."

            });

        }


        // ===================================================
        // CHECK DOCTOR ID
        // ===================================================

        if (!doctorId) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor ID is required."

            });

        }


        // ===================================================
        // CHECK WHETHER DOCTOR EXISTS
        // ===================================================

        const doctor = await Doctor.findById(doctorId);


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        // ===================================================
        // GET DOCTOR NAME
        // ===================================================
        //
        // Store the doctor's name permanently with the leave
        // record so it remains available even if the doctor
        // is deleted later.
        //
        // ===================================================

        const DoctorName =
            typeof doctor.FullName === "string"
                ? doctor.FullName.trim()
                : "";


        // ===================================================
        // VALIDATE DATE FORMAT
        // ===================================================

        if (
            typeof leaveDate !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(leaveDate)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid leave date in YYYY-MM-DD format."

            });

        }


        // ===================================================
        // SPLIT DATE
        // ===================================================

        const [
            year,
            month,
            day
        ] = leaveDate
            .split("-")
            .map(Number);


        // ===================================================
        // CREATE DATE
        // ===================================================

        const selectedDate = createUTCNoonDate(leaveDate);


        // ===================================================
        // CHECK VALID DATE
        // ===================================================

        if (isNaN(selectedDate.getTime())) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid leave date."

            });

        }


        // ===================================================
        // VERIFY CALENDAR DATE
        // ===================================================

        if (
            selectedDate.getUTCFullYear() !== year ||
            selectedDate.getUTCMonth() !== month - 1 ||
            selectedDate.getUTCDate() !== day
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid calendar date."

            });

        }


        // ===================================================
        // CHECK DUPLICATE LEAVE
        // ===================================================

        const existingLeave = await Leave.findOne({

            DoctorID: doctorId,

            LeaveDate: selectedDate

        });


        if (existingLeave) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave is already added for this doctor on this date."

            });

        }


        // ===================================================
        // CLEAN REASON
        // ===================================================

        const cleanReason =
            typeof reason === "string"
                ? reason.trim()
                : "";


        // ===================================================
        // GET WHO ADDED THE LEAVE
        // ===================================================
        // Receptionist frontend should send:
        // AddedBy: "Receptionist"
        //
        // Doctor frontend should send:
        // AddedBy: "Doctor"
        // ===================================================

        const addedBy =
            AddedBy === "Receptionist"
                ? "Receptionist"
                : "Doctor";


        // ===================================================
        // CREATE LEAVE
        // ===================================================

        const newLeave = new Leave({

            DoctorID: doctorId,

            // Store doctor's name permanently.
            DoctorName,

            LeaveDate: selectedDate,

            Reason: cleanReason,

            AddedBy: addedBy

        });


        // ===================================================
        // SAVE LEAVE
        // ===================================================

        const savedLeave = await newLeave.save();


        // ===================================================
        // LOG SAVED DATA
        // ===================================================

        console.log(
            "Leave added successfully:",
            savedLeave._id
        );

        console.log(
            "Saved Doctor Name:",
            savedLeave.DoctorName
        );

        console.log(
            "Saved Leave Date:",
            savedLeave.LeaveDate
        );

        console.log(
            "Saved Leave Date Only:",
            formatDateOnly(savedLeave.LeaveDate)
        );

        console.log(
            "Leave Added By:",
            savedLeave.AddedBy
        );


        // ===================================================
        // SEND SUCCESS RESPONSE
        // ===================================================

        return res.status(201).json({

            success: true,

            message:
                "Doctor leave added successfully.",

            leave: {

                id: savedLeave._id,

                doctorId: savedLeave.DoctorID,

                doctorName:
                    savedLeave.DoctorName,

                leaveDate: formatDateOnly(
                    savedLeave.LeaveDate
                ),

                reason: savedLeave.Reason,

                addedBy: savedLeave.AddedBy

            }

        });

    }


    // ===================================================
    // ADD LEAVE ERROR
    // ===================================================

    catch (error) {

        console.error("Add leave error:", error);

        return res.status(500).json({

            success: false,

            message:
                "Server error while adding doctor leave."

        });

    }

};



// =======================================================
// GET DOCTOR LEAVES
// =======================================================
// GET /api/leaves/doctor/DOCTOR_ID
// =======================================================

const getDoctorLeaves = async (req, res) => {

    try {

        console.log("Get doctor leaves request received");


        // ===================================================
        // GET DOCTOR ID
        // ===================================================

        const doctorId = req.params.doctorId;


        // ===================================================
        // CHECK DOCTOR ID
        // ===================================================

        if (!doctorId) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor ID is required."

            });

        }


        // ===================================================
        // CHECK DOCTOR
        // ===================================================

        const doctor = await Doctor.findById(doctorId);


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        // ===================================================
        // GET LEAVES
        // ===================================================

        const leaves = await Leave.find({

            DoctorID: doctorId

        }).sort({

            LeaveDate: 1

        });


        // ===================================================
        // FORMAT LEAVES
        // ===================================================

        const formattedLeaves = leaves.map(
            function (leave) {

                return {

                    id: leave._id,

                    doctorId: leave.DoctorID,

                    doctorName:
                        leave.DoctorName || doctor.FullName,

                    leaveDate: formatDateOnly(
                        leave.LeaveDate
                    ),

                    reason: leave.Reason || "",

                    addedBy: leave.AddedBy || "Doctor",

                    createdAt: leave.createdAt,

                    updatedAt: leave.updatedAt

                };

            }
        );


        // ===================================================
        // SEND RESPONSE
        // ===================================================

        return res.status(200).json({

            success: true,

            doctor: {

                id: doctor._id,

                fullName: doctor.FullName

            },

            count: formattedLeaves.length,

            leaves: formattedLeaves

        });

    }


    // ===================================================
    // GET LEAVES ERROR
    // ===================================================

    catch (error) {

        console.error("Get doctor leaves error:", error);

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching doctor leaves."

        });

    }

};



// =======================================================
// GET ALL LEAVES
// =======================================================
// GET /api/leaves
// Used by Receptionist module.
// =======================================================

const getAllLeaves = async (req, res) => {

    try {

        console.log("Get all leaves request received");


        // ===================================================
        // GET ALL LEAVES
        // ===================================================

        const leaves = await Leave.find()

            .populate(
                "DoctorID",
                "FullName Specialization"
            )

            .sort({

                LeaveDate: 1

            });


        // ===================================================
        // FORMAT LEAVES
        // =======================================================

        const formattedLeaves = leaves.map(
            function (leave) {

                // =================================================
                // GET STORED DOCTOR NAME FIRST
                // =================================================
                //
                // DoctorName is permanently stored inside the
                // Leave document.
                //
                // This is important because the Doctor document
                // may be deleted later.
                //
                // =================================================

                const storedDoctorName =
                    typeof leave.DoctorName === "string"
                        ? leave.DoctorName.trim()
                        : "";


                // =================================================
                // GET CURRENT DOCTOR NAME
                // =================================================

                const currentDoctorName =
                    leave.DoctorID &&
                    typeof leave.DoctorID.FullName === "string"
                        ? leave.DoctorID.FullName.trim()
                        : "";


                // =================================================
                // RESOLVE DOCTOR NAME
                // =================================================
                //
                // Priority:
                //
                // 1. Stored DoctorName
                // 2. Current DoctorID.FullName
                // 3. Unknown Doctor
                //
                // =================================================

                let resolvedDoctorName =
                    "Unknown Doctor";


                if (storedDoctorName) {

                    resolvedDoctorName =
                        storedDoctorName;

                } else if (currentDoctorName) {

                    resolvedDoctorName =
                        currentDoctorName;

                }


                // =================================================
                // RETURN FORMATTED LEAVE
                // =================================================

                return {

                    id: leave._id,

                    doctorId: leave.DoctorID
                        ? leave.DoctorID._id
                        : leave.DoctorID,

                    doctorName:
                        resolvedDoctorName,

                    specialization: leave.DoctorID
                        ? leave.DoctorID.Specialization
                        : "",

                    leaveDate: formatDateOnly(
                        leave.LeaveDate
                    ),

                    reason: leave.Reason || "",

                    addedBy: leave.AddedBy || "Doctor",

                    createdAt: leave.createdAt,

                    updatedAt: leave.updatedAt

                };

            }
        );


        // ===================================================
        // SEND RESPONSE
        // ===================================================

        return res.status(200).json({

            success: true,

            count: formattedLeaves.length,

            leaves: formattedLeaves

        });

    }


    // ===================================================
    // GET LEAVES ERROR
    // ===================================================

    catch (error) {

        console.error("Get all leaves error:", error);

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching leaves."

        });

    }

};



// =======================================================
// DELETE LEAVE
// =======================================================
// DELETE /api/leaves/LEAVE_ID
// =======================================================

const deleteLeave = async (req, res) => {

    try {

        console.log("Delete leave request received");


        // ===================================================
        // GET LEAVE ID
        // ===================================================

        const leaveId = req.params.id;


        // ===================================================
        // CHECK LEAVE ID
        // ===================================================

        if (!leaveId) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave ID is required."

            });

        }


        // ===================================================
        // FIND LEAVE
        // ===================================================

        const leave = await Leave.findById(leaveId);


        // ===================================================
        // CHECK LEAVE
        // ===================================================

        if (!leave) {

            return res.status(404).json({

                success: false,

                message:
                    "Leave not found."

            });

        }


        // ===================================================
        // DELETE LEAVE
        // ===================================================

        await Leave.findByIdAndDelete(leaveId);


        // ===================================================
        // LOG
        // ===================================================

        console.log(
            "Leave deleted successfully:",
            leaveId
        );


        // ===================================================
        // SEND SUCCESS RESPONSE
        // ===================================================

        return res.status(200).json({

            success: true,

            message:
                "Doctor leave deleted successfully."

        });

    }


    // ===================================================
    // DELETE LEAVE ERROR
    // ===================================================

    catch (error) {

        console.error("Delete leave error:", error);

        return res.status(500).json({

            success: false,

            message:
                "Server error while deleting doctor leave."

        });

    }

};



// =======================================================
// EXPORT CONTROLLERS
// =======================================================

module.exports = {

    addLeave,

    getDoctorLeaves,

    getAllLeaves,

    deleteLeave

};