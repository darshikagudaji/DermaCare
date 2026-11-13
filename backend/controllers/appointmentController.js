// =======================================================
// DERMCARE - APPOINTMENT CONTROLLER
// FILE: controllers/appointmentController.js
// =======================================================


// =======================================================
// IMPORT MONGOOSE
// =======================================================

const mongoose = require("mongoose");


// =======================================================
// IMPORT APPOINTMENT MODEL
// =======================================================

const Appointment = require("../models/Appointment");


// =======================================================
// IMPORT DOCTOR MODEL
// =======================================================

const Doctor = require("../models/Doctor");


// =======================================================
// IMPORT LEAVE MODEL
// =======================================================

const Leave = require("../models/Leave");


// =======================================================
// IMPORT DOCTOR SCHEDULE MODEL
// =======================================================

const DoctorSchedule = require("../models/DoctorSchedule");


// =======================================================
// IMPORT PATIENT MODEL
// =======================================================

const Patient = require("../models/Patient");


// =======================================================
// IMPORT EMAIL SERVICE
// =======================================================

const {
    sendEmail
} = require("../config/email");


// =======================================================
// IMPORT NOTIFICATION CREATION FUNCTION
// =======================================================

const {
    createNotification
} = require("./notificationController");


// =======================================================
// CONSTANTS
// =======================================================

const SLOT_DURATION = 20;

const ACTIVE_STATUSES = ["Booked", "Arrived"];

const APPOINTMENT_TYPES = ["Online", "Walk-in"];

const WEEK_DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];


// =======================================================
// HELPER: SEND REAL-TIME APPOINTMENT UPDATE
// =======================================================

const emitAppointmentUpdate = (req, action, appointment) => {

    try {

        const io = req.app.get("io");

        if (!io || !appointment) {
            return;
        }

        io.emit("appointmentUpdated", {

            action,

            appointmentId: appointment._id.toString(),

            timestamp: new Date().toISOString()

        });

        console.log(
            "Real-time appointment event sent:",
            action
        );

    } catch (error) {

        // SOCKET FAILURE MUST NOT AFFECT APPOINTMENT OPERATIONS

        console.error(
            "Real-time appointment event failed:",
            error.message
        );

    }

};


// =======================================================
// PATIENT LOGIN URL
// =======================================================

const PATIENT_LOGIN_URL =
    "http://127.0.0.1:5500/frontend/login.html";


// =======================================================
// HELPER: CREATE UTC DAY RANGE
// =======================================================

const getDateRange = (date) => {

    const startOfDay = new Date(`${date}T00:00:00.000Z`);

    const endOfDay = new Date(`${date}T00:00:00.000Z`);

    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    return {
        startOfDay,
        endOfDay
    };
};


// =======================================================
// HELPER: VALIDATE YYYY-MM-DD
// =======================================================

const isValidDateOnly = (date) => {

    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
    );
};


// =======================================================
// HELPER: VALIDATE HH:mm
// =======================================================

const isValidTime = (time) => {

    return (
        typeof time === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    );
};


// =======================================================
// HELPER: CONVERT HH:mm TO MINUTES
// =======================================================

const timeToMinutes = (time) => {

    if (!isValidTime(time)) {
        return null;
    }

    const [hours, minutes] = time.split(":").map(Number);

    return (hours * 60) + minutes;
};


// =======================================================
// HELPER: CONVERT MINUTES TO HH:mm
// =======================================================

const minutesToTime = (minutes) => {

    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(remainingMinutes).padStart(2, "0")
    );
};


// =======================================================
// HELPER: GET UTC DAY RANGE
// =======================================================

const getDateRangeForDate = (date) => {

    return getDateRange(date);
};


// =======================================================
// HELPER: GENERATE ACTIVE SLOT KEY
// =======================================================

const generateActiveSlotKey = (doctorId, date, time) => {

    const doctor = doctorId.toString();

    const dateOnly = date instanceof Date
        ? date.toISOString().slice(0, 10)
        : date;

    return `${doctor}_${dateOnly}_${time}`;
};


// =======================================================
// HELPER: CHECK DUPLICATE KEY ERROR
// =======================================================

const isDuplicateSlotError = (error) => {

    return error && error.code === 11000;
};


// =======================================================
// HELPER: CHECK DOCTOR LEAVE DATE
// =======================================================

const isDoctorOnLeave = async (doctorId, date) => {

    const { startOfDay, endOfDay } = getDateRange(date);

    const leave = await Leave.findOne({

        DoctorID: doctorId,

        LeaveDate: {
            $gte: startOfDay,
            $lt: endOfDay
        }

    });

    return Boolean(leave);
};


// =======================================================
// HELPER: GET DOCTOR WORKING SCHEDULE FOR DATE
// =======================================================

const getDoctorWorkingSchedule = async (doctorId, date) => {

    const schedule = await DoctorSchedule.findOne({
        DoctorID: doctorId
    });

    if (!schedule) {
        return null;
    }

    const selectedDate = new Date(`${date}T00:00:00.000Z`);

    const dayName = WEEK_DAYS[selectedDate.getUTCDay()];

    const daySchedule = schedule.WeeklySchedule
        ? schedule.WeeklySchedule[dayName]
        : null;

    if (
        !daySchedule ||
        !daySchedule.StartTime ||
        !daySchedule.EndTime
    ) {
        return null;
    }

    if (
        !isValidTime(daySchedule.StartTime) ||
        !isValidTime(daySchedule.EndTime)
    ) {
        return null;
    }

    const startMinutes = timeToMinutes(daySchedule.StartTime);

    const endMinutes = timeToMinutes(daySchedule.EndTime);

    if (endMinutes <= startMinutes) {
        return null;
    }

    const slotDuration = Number(schedule.SlotDuration) || SLOT_DURATION;

    if (slotDuration !== SLOT_DURATION) {
        return null;
    }

    const totalMinutes = endMinutes - startMinutes;

    const totalSlots = Math.floor(totalMinutes / slotDuration);

    if (totalSlots < 2) {
        return null;
    }

    const onlineSlotCount = Math.floor(totalSlots / 2);

    const onlineEndMinutes =
        startMinutes + (onlineSlotCount * slotDuration);

    return {
        dayName,
        startMinutes,
        endMinutes,
        onlineEndMinutes,
        slotDuration
    };
};


// =======================================================
// HELPER: GENERATE ONLINE AND WALK-IN SLOTS
// =======================================================

const generateDoctorSlots = (workingSchedule) => {

    if (!workingSchedule) {
        return {
            onlineSlots: [],
            walkInSlots: []
        };
    }

    const {
        startMinutes,
        onlineEndMinutes,
        endMinutes,
        slotDuration
    } = workingSchedule;

    const onlineSlots = [];

    const walkInSlots = [];

    // FIRST HALF: ONLINE APPOINTMENTS

    for (
        let time = startMinutes;
        time + slotDuration <= onlineEndMinutes;
        time += slotDuration
    ) {
        onlineSlots.push(minutesToTime(time));
    }

    // SECOND HALF: WALK-IN APPOINTMENTS

    for (
        let time = onlineEndMinutes;
        time + slotDuration <= endMinutes;
        time += slotDuration
    ) {
        walkInSlots.push(minutesToTime(time));
    }

    return {
        onlineSlots,
        walkInSlots
    };
};


// =======================================================
// HELPER: GET AVAILABLE SLOTS FOR A DOCTOR AND DATE
// =======================================================

const getAvailabilityForDate = async (doctorId, date) => {

    const doctorOnLeave = await isDoctorOnLeave(doctorId, date);

    if (doctorOnLeave) {
        return {
            success: true,
            date,
            isLeaveDate: true,
            onlineSlots: [],
            walkInSlots: [],
            availableOnlineSlots: [],
            availableWalkInSlots: [],
            onlineDateAvailable: false,
            walkInDateAvailable: false
        };
    }

    const workingSchedule = await getDoctorWorkingSchedule(
        doctorId,
        date
    );

    if (!workingSchedule) {
        return {
            success: true,
            date,
            isLeaveDate: false,
            onlineSlots: [],
            walkInSlots: [],
            availableOnlineSlots: [],
            availableWalkInSlots: [],
            onlineDateAvailable: false,
            walkInDateAvailable: false
        };
    }

    const { onlineSlots, walkInSlots } =
        generateDoctorSlots(workingSchedule);

    const { startOfDay, endOfDay } = getDateRange(date);

    const appointments = await Appointment.find({

        DoctorID: doctorId,

        AppointmentDate: {
            $gte: startOfDay,
            $lt: endOfDay
        },

        Status: {
            $in: ACTIVE_STATUSES
        }

    }).select("AppointmentTime AppointmentType Status");

    const bookedOnlineTimes = appointments
        .filter(appointment =>
            appointment.AppointmentType === "Online"
        )
        .map(appointment => appointment.AppointmentTime);

    const bookedWalkInTimes = appointments
        .filter(appointment =>
            appointment.AppointmentType === "Walk-in"
        )
        .map(appointment => appointment.AppointmentTime);

    const availableOnlineSlots = onlineSlots.filter(
        time => !bookedOnlineTimes.includes(time)
    );

    const availableWalkInSlots = walkInSlots.filter(
        time => !bookedWalkInTimes.includes(time)
    );

    return {
        success: true,
        date,
        isLeaveDate: false,
        onlineSlots,
        walkInSlots,
        availableOnlineSlots,
        availableWalkInSlots,
        onlineDateAvailable: availableOnlineSlots.length > 0,
        walkInDateAvailable: availableWalkInSlots.length > 0
    };
};


// =======================================================
// GET AVAILABLE SLOTS
// =======================================================

const getAvailableSlots = async (req, res) => {

    try {

        const { doctorId, date } = req.params;

        const { type } = req.query;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Doctor ID."
            });
        }

        if (!isValidDateOnly(date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date."
            });
        }

        if (type && !APPOINTMENT_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment type."
            });
        }

        const availability = await getAvailabilityForDate(
            doctorId,
            date
        );

        if (type === "Online") {
            return res.status(200).json({
                success: true,
                date,
                isLeaveDate: availability.isLeaveDate,
                availableSlots: availability.availableOnlineSlots,
                dateAvailable: availability.onlineDateAvailable
            });
        }

        if (type === "Walk-in") {
            return res.status(200).json({
                success: true,
                date,
                isLeaveDate: availability.isLeaveDate,
                availableSlots: availability.availableWalkInSlots,
                dateAvailable: availability.walkInDateAvailable
            });
        }

        return res.status(200).json(availability);

    } catch (error) {

        console.error("Error getting available slots:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting available slots."
        });

    }
};


// =======================================================
// GET AVAILABLE DATES FOR A DOCTOR
// =======================================================

const getAvailableDates = async (req, res) => {

    try {

        const { doctorId } = req.params;

        const { startDate, endDate, type } = req.query;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Doctor ID."
            });
        }

        if (
            !isValidDateOnly(startDate) ||
            !isValidDateOnly(endDate)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid startDate and endDate are required."
            });
        }

        if (endDate < startDate) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date."
            });
        }

        if (!APPOINTMENT_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Appointment type must be Online or Walk-in."
            });
        }

        const dates = [];

        const currentDate = new Date(`${startDate}T00:00:00.000Z`);

        const lastDate = new Date(`${endDate}T00:00:00.000Z`);

        while (currentDate <= lastDate) {

            const date = currentDate.toISOString().slice(0, 10);

            const availability = await getAvailabilityForDate(
                doctorId,
                date
            );

            const availableSlots = type === "Online"
                ? availability.availableOnlineSlots
                : availability.availableWalkInSlots;

            if (availableSlots.length > 0) {
                dates.push({
                    date,
                    availableSlots,
                    dateAvailable: true
                });
            }

            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        return res.status(200).json({
            success: true,
            appointmentType: type,
            dates
        });

    } catch (error) {

        console.error("Error getting available dates:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting available dates."
        });

    }
};


// =======================================================
// CREATE APPOINTMENT
// =======================================================

const createAppointment = async (req, res) => {

    try {

        const {
            PatientID,
            DoctorID,
            AppointmentDate,
            AppointmentTime,
            AppointmentType,
            ReasonForVisit,
            Symptoms,
            Allergies,
            AllergyDetails
        } = req.body;

        if (
            !PatientID ||
            !mongoose.Types.ObjectId.isValid(PatientID)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Patient ID."
            });
        }

        if (
            !DoctorID ||
            !mongoose.Types.ObjectId.isValid(DoctorID)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Doctor ID."
            });
        }

        // GET DOCTOR INFORMATION

        const doctor = await Doctor.findById(DoctorID)
            .select("FullName");

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        const DoctorName = doctor.FullName;

        if (!isValidDateOnly(AppointmentDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date."
            });
        }

        if (!isValidTime(AppointmentTime)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment time."
            });
        }

        if (!APPOINTMENT_TYPES.includes(AppointmentType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment type."
            });
        }

        const workingSchedule = await getDoctorWorkingSchedule(
            DoctorID,
            AppointmentDate
        );

        if (!workingSchedule) {
            return res.status(409).json({
                success: false,
                message: "Doctor is not available on the selected date or the working schedule is invalid."
            });
        }

        const { onlineSlots, walkInSlots } =
            generateDoctorSlots(workingSchedule);

        const validSlots = AppointmentType === "Online"
            ? onlineSlots
            : walkInSlots;

        if (!validSlots.includes(AppointmentTime)) {
            return res.status(409).json({
                success: false,
                message: `This time is not a valid ${AppointmentType} appointment slot.`
            });
        }

        const doctorOnLeave = await isDoctorOnLeave(
            DoctorID,
            AppointmentDate
        );

        if (doctorOnLeave) {
            return res.status(409).json({
                success: false,
                message: "This doctor is on leave on the selected date."
            });
        }

        const { startOfDay, endOfDay } = getDateRange(
            AppointmentDate
        );

        const existingAppointment = await Appointment.findOne({

            DoctorID,

            AppointmentDate: {
                $gte: startOfDay,
                $lt: endOfDay
            },

            AppointmentTime,

            Status: {
                $in: ACTIVE_STATUSES
            }

        });

        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: "This appointment slot has already been booked."
            });
        }

        const ActiveSlotKey = generateActiveSlotKey(
            DoctorID,
            AppointmentDate,
            AppointmentTime
        );

        const appointment = await Appointment.create({

            PatientID,

            DoctorID,

            DoctorName,

            ReasonForVisit:
                typeof ReasonForVisit === "string"
                    ? ReasonForVisit.trim()
                    : "",

            Symptoms:
                typeof Symptoms === "string"
                    ? Symptoms.trim()
                    : "",

            Allergies:
                typeof Allergies === "string" && Allergies.trim()
                    ? Allergies.trim()
                    : "No known allergies",

            AllergyDetails:
                typeof AllergyDetails === "string"
                    ? AllergyDetails.trim()
                    : "",

            AppointmentDate: new Date(
                `${AppointmentDate}T00:00:00.000Z`
            ),

            AppointmentTime,

            AppointmentType,

            Status: "Booked",

            ActiveSlotKey

        });

        // SEND REAL-TIME UPDATE
        emitAppointmentUpdate(req, "created", appointment);

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully.",
            appointment
        });

    } catch (error) {

        console.error("Error creating appointment:", error);

        if (isDuplicateSlotError(error)) {
            return res.status(409).json({
                success: false,
                message: "This appointment slot has already been booked. Please select another time."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while booking appointment."
        });

    }
};


// =======================================================
// GET ALL APPOINTMENTS
// =======================================================

const getAllAppointments = async (req, res) => {

    try {

        const appointments = await Appointment.find()

            .populate({
                path: "PatientID",
                select: {
                    FullName: 1,
                    Email: 1,
                    "Mobile No": 1
                }
            })

            .populate(
                "DoctorID",
                "FullName Qualification Specialization DoctorImage"
            )

            .sort({
                createdAt: -1,
                AppointmentDate: -1,
                AppointmentTime: -1
            });

        return res.status(200).json({
            success: true,
            appointments
        });

    } catch (error) {

        console.error("Error getting all appointments:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting appointments."
        });

    }
};


// =======================================================
// GET ALL APPOINTMENTS FOR ONE DOCTOR
// =======================================================

const getDoctorAppointments = async (req, res) => {

    try {

        const { doctorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Doctor ID."
            });
        }

        const doctor = await Doctor.findById(doctorId)
            .select("FullName");

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        const appointments = await Appointment.find({

            DoctorID: doctorId,

            Status: {
                $in: [
                    "Booked",
                    "Arrived",
                    "Completed"
                ]
            }

        })

            .populate({
                path: "PatientID",
                select: {
                    FullName: 1,
                    Email: 1,
                    "Mobile No": 1,
                    DateOfBirth: 1,
                    Gender: 1,
                    "Blood Group": 1
                }
            })

            .populate(
                "DoctorID",
                "FullName Qualification Specialization DoctorImage"
            )

            .sort({
                AppointmentDate: 1,
                AppointmentTime: 1
            });

        return res.status(200).json({

            success: true,

            doctor: {
                _id: doctor._id,
                FullName: doctor.FullName
            },

            appointments

        });

    } catch (error) {

        console.error(
            "Error getting doctor appointments:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while getting doctor appointments."
        });

    }
};


// =======================================================
// GET DOCTOR APPOINTMENTS BY DATE
// =======================================================

const getDoctorAppointmentsByDate = async (req, res) => {

    try {

        const { doctorId, date } = req.params;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Doctor ID."
            });
        }

        if (!isValidDateOnly(date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date."
            });
        }

        const { startOfDay, endOfDay } = getDateRange(date);

        const appointments = await Appointment.find({

            DoctorID: doctorId,

            AppointmentDate: {
                $gte: startOfDay,
                $lt: endOfDay
            },

            Status: {
                $in: ACTIVE_STATUSES
            }

        }).select("AppointmentTime AppointmentType");

        const bookedTimes = appointments
            .filter(appointment =>
                appointment.AppointmentType === "Online"
            )
            .map(appointment => appointment.AppointmentTime);

        const bookedWalkInTimes = appointments
            .filter(appointment =>
                appointment.AppointmentType === "Walk-in"
            )
            .map(appointment => appointment.AppointmentTime);

        return res.status(200).json({
            success: true,
            appointments,
            bookedTimes,
            bookedWalkInTimes
        });

    } catch (error) {

        console.error(
            "Error getting doctor appointments by date:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while getting doctor appointments."
        });

    }
};


// =======================================================
// GET PATIENT APPOINTMENT HISTORY
// =======================================================

const getPatientAppointments = async (req, res) => {

    try {

        const { patientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Patient ID."
            });
        }

        const appointments = await Appointment.find({
            PatientID: patientId
        })

            .populate(
                "DoctorID",
                "FullName Qualification Specialization DoctorImage"
            )

            .sort({
                AppointmentDate: -1,
                AppointmentTime: -1
            });

        const formattedAppointments =
            appointments.map(appointment => {

                const appointmentObject =
                    appointment.toObject();

                if (appointmentObject.DoctorID) {
                    return appointmentObject;
                }

                if (appointmentObject.DoctorName) {

                    appointmentObject.DoctorID = {

                        _id: appointmentObject.DoctorID ||
                            appointmentObject.DoctorID,

                        FullName: appointmentObject.DoctorName,

                        Qualification: "",

                        Specialization: "",

                        DoctorImage: null

                    };

                }

                return appointmentObject;

            });

        return res.status(200).json({
            success: true,
            appointments: formattedAppointments
        });

    } catch (error) {

        console.error("Error getting patient appointments:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting appointments."
        });

    }
};


// =======================================================
// MARK APPOINTMENT AS ARRIVED
// =======================================================

const markAppointmentArrived = async (req, res) => {

    try {

        const { appointmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID."
            });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        if (appointment.Status === "Arrived") {
            return res.status(400).json({
                success: false,
                message: "Patient has already arrived."
            });
        }

        if (["Cancelled", "Completed"].includes(appointment.Status)) {
            return res.status(400).json({
                success: false,
                message: "This appointment cannot be marked as arrived."
            });
        }

        appointment.Status = "Arrived";

        await appointment.save();

        // SEND REAL-TIME UPDATE
        emitAppointmentUpdate(req, "arrived", appointment);

        return res.status(200).json({
            success: true,
            message: "Patient marked as arrived successfully.",
            appointment
        });

    } catch (error) {

        console.error("Error marking appointment as arrived:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while marking patient as arrived."
        });

    }
};


// =======================================================
// MARK APPOINTMENT AS COMPLETED
// =======================================================

const markAppointmentCompleted = async (req, res) => {

    try {

        const { appointmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID."
            });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        if (appointment.Status === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Appointment is already completed."
            });
        }

        if (appointment.Status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled appointments cannot be completed."
            });
        }

        appointment.Status = "Completed";

        appointment.ActiveSlotKey = null;

        await appointment.save();

        // SEND REAL-TIME UPDATE
        emitAppointmentUpdate(req, "completed", appointment);

        return res.status(200).json({
            success: true,
            message: "Appointment marked as completed successfully.",
            appointment
        });

    } catch (error) {

        console.error("Error completing appointment:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while completing appointment."
        });

    }
};


// =======================================================
// CANCEL APPOINTMENT
// =======================================================

const cancelAppointment = async (req, res) => {

    try {

        const { appointmentId } = req.params;

        const {
            PatientID,
            CancellationReason,
            CancelledBy
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID."
            });
        }

        const isReceptionist = CancelledBy === "Receptionist";

        if (isReceptionist) {

            if (
                typeof CancellationReason !== "string" ||
                !CancellationReason.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Cancellation reason is required for receptionist cancellation."
                });
            }

        }

        let appointment;

        if (isReceptionist) {

            appointment = await Appointment.findById(appointmentId);

        } else {

            if (
                !PatientID ||
                !mongoose.Types.ObjectId.isValid(PatientID)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Patient ID."
                });
            }

            appointment = await Appointment.findOne({
                _id: appointmentId,
                PatientID
            });

        }

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        if (appointment.Status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "This appointment is already cancelled."
            });
        }

        if (appointment.Status === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Completed appointments cannot be cancelled."
            });
        }

        appointment.Status = "Cancelled";

        appointment.ActiveSlotKey = null;

        appointment.CancelledAt = new Date();

        appointment.CancelledBy = isReceptionist
            ? "Receptionist"
            : "Patient";

        appointment.CancellationReason =
            typeof CancellationReason === "string"
                ? CancellationReason.trim()
                : "";

        // SAVE CANCELLATION FIRST

        await appointment.save();

        // SEND REAL-TIME UPDATE
        emitAppointmentUpdate(req, "cancelled", appointment);


        // ===================================================
        // GET PATIENT DETAILS
        // ===================================================

        let patient = null;

        try {

            patient = await Patient.findById(
                appointment.PatientID
            ).select("FullName Email");

        } catch (patientError) {

            console.error(
                "Could not retrieve patient details after cancellation:",
                patientError.message
            );

        }


        // ===================================================
        // CREATE CANCELLATION DASHBOARD NOTIFICATION
        // ===================================================

        try {

            const doctorName =
                appointment.DoctorName || "your doctor";

            const appointmentDate =
                appointment.AppointmentDate
                    .toISOString()
                    .slice(0, 10);

            const notificationTitle = isReceptionist
                ? "Appointment Cancelled by Clinic"
                : "Appointment Cancelled Successfully";

            const notificationMessage = isReceptionist

                ? `Your appointment with ${doctorName} scheduled for ${appointmentDate} at ${appointment.AppointmentTime} has been cancelled by the clinic receptionist. Reason: ${appointment.CancellationReason}`

                : `Your appointment with ${doctorName} scheduled for ${appointmentDate} at ${appointment.AppointmentTime} has been cancelled successfully.`;

            await createNotification({

                PatientID: appointment.PatientID,

                Title: notificationTitle,

                Message: notificationMessage,

                Type: "Cancelled",

                AppointmentID: appointment._id

            });

            console.log(
                "Cancellation notification created for patient:",
                appointment.PatientID
            );

        } catch (notificationError) {

            // NOTIFICATION FAILURE MUST NOT UNDO CANCELLATION

            console.error(
                "Appointment cancelled, but notification creation failed:",
                notificationError.message
            );

        }


        // ===================================================
        // SEND CANCELLATION EMAIL TO PATIENT
        // ===================================================

        try {

            if (patient && patient.Email) {

                const doctorName =
                    appointment.DoctorName || "your doctor";

                const formattedDate =
                    appointment.AppointmentDate.toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            timeZone: "Asia/Kolkata"
                        }
                    );

                const cancellationReason =
                    appointment.CancellationReason ||
                    "No additional reason provided.";

                await sendEmail({

                    to: patient.Email,

                    subject: "DermCare - Appointment Cancelled",

                    // PLAIN TEXT EMAIL

                    text:
                        `Hello ${patient.FullName},\n\n` +

                        `Your appointment with ${doctorName} has been cancelled.\n\n` +

                        `Appointment Details:\n` +
                        `Date: ${formattedDate}\n` +
                        `Time: ${appointment.AppointmentTime}\n` +
                        `Appointment Type: ${appointment.AppointmentType}\n\n` +

                        `Cancellation Reason: ${cancellationReason}\n\n` +

                        `To view your appointments, log in to DermCare:\n` +
                        `${PATIENT_LOGIN_URL}\n\n` +

                        `Regards,\nDermCare Clinic`,

                    // HTML EMAIL WITH CLICKABLE LOGIN BUTTON

                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: auto;
                            padding: 25px;
                            color: #333;
                            border: 1px solid #e5e5e5;
                            border-radius: 10px;
                            line-height: 1.6;
                        ">

                            <h2 style="color: #2563eb;">
                                DermCare Clinic
                            </h2>

                            <p>Hello ${patient.FullName},</p>

                            <p>
                                Your appointment has been
                                <strong>cancelled</strong>.
                            </p>

                            <h3>Appointment Details</h3>

                            <p>
                                <strong>Doctor:</strong>
                                ${doctorName}<br>

                                <strong>Date:</strong>
                                ${formattedDate}<br>

                                <strong>Time:</strong>
                                ${appointment.AppointmentTime}<br>

                                <strong>Appointment Type:</strong>
                                ${appointment.AppointmentType}
                            </p>

                            <p>
                                <strong>Cancellation Reason:</strong><br>
                                ${cancellationReason}
                            </p>

                            <p>
                                You can log in to DermCare to view
                                your updated appointment history.
                            </p>

                            <a href="${PATIENT_LOGIN_URL}"
                               style="
                                   display: inline-block;
                                   padding: 12px 24px;
                                   background-color: #2563eb;
                                   color: white;
                                   text-decoration: none;
                                   border-radius: 6px;
                                   font-weight: bold;
                               ">
                                Login to DermCare
                            </a>

                            <p style="
                                margin-top: 25px;
                                color: #666;
                            ">
                                Regards,<br>
                                <strong>DermCare Clinic</strong>
                            </p>

                        </div>
                    `

                });

                console.log(
                    "Cancellation email sent to:",
                    patient.Email
                );

            } else {

                console.log(
                    "Patient email not found. Cancellation email skipped."
                );

            }

        } catch (emailError) {

            // EMAIL FAILURE MUST NOT UNDO CANCELLATION

            console.error(
                "Appointment cancelled, but cancellation email failed:",
                emailError.message
            );

        }


        // ===================================================
        // SEND RESPONSE
        // ===================================================

        return res.status(200).json({

            success: true,

            message: "Appointment cancelled successfully.",

            appointment

        });

    } catch (error) {

        console.error("Error cancelling appointment:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while cancelling appointment."
        });

    }
};


// =======================================================
// RESCHEDULE APPOINTMENT
// =======================================================

const rescheduleAppointment = async (req, res) => {

    try {

        const { appointmentId } = req.params;

        const {
            PatientID,
            AppointmentDate,
            AppointmentTime,
            AppointmentType,
            Reason,
            RescheduledBy
        } = req.body;

        // VALIDATE APPOINTMENT ID

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID."
            });
        }

        // CHECK WHETHER REQUEST IS FROM RECEPTIONIST

        const isReceptionist = RescheduledBy === "Receptionist";

        // VALIDATE PATIENT ID FOR PATIENT RESCHEDULING

        if (!isReceptionist) {

            if (
                !PatientID ||
                !mongoose.Types.ObjectId.isValid(PatientID)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Patient ID."
                });
            }

        }

        // VALIDATE NEW APPOINTMENT DATE

        if (!isValidDateOnly(AppointmentDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid new appointment date."
            });
        }

        // VALIDATE NEW APPOINTMENT TIME

        if (!isValidTime(AppointmentTime)) {
            return res.status(400).json({
                success: false,
                message: "Invalid new appointment time."
            });
        }

        // FIND APPOINTMENT

        let appointment;

        if (isReceptionist) {

            appointment = await Appointment.findById(appointmentId);

        } else {

            appointment = await Appointment.findOne({
                _id: appointmentId,
                PatientID
            });

        }

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        // CHECK APPOINTMENT STATUS

        if (["Cancelled", "Completed"].includes(appointment.Status)) {
            return res.status(400).json({
                success: false,
                message: "This appointment cannot be rescheduled."
            });
        }

        // SAVE PREVIOUS APPOINTMENT DETAILS

        const previousDate =
            appointment.AppointmentDate.toISOString().slice(0, 10);

        const previousTime =
            appointment.AppointmentTime;

        // DETERMINE APPOINTMENT TYPE

        let newAppointmentType = appointment.AppointmentType;

        if (isReceptionist && AppointmentType !== undefined) {

            if (!APPOINTMENT_TYPES.includes(AppointmentType)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid appointment type."
                });
            }

            newAppointmentType = AppointmentType;

        }

        // CHECK DOCTOR LEAVE ON NEW DATE

        const doctorOnLeave = await isDoctorOnLeave(
            appointment.DoctorID,
            AppointmentDate
        );

        if (doctorOnLeave) {
            return res.status(409).json({
                success: false,
                message: "This doctor is on leave on the selected date."
            });
        }

        // CHECK DOCTOR WORKING SCHEDULE

        const workingSchedule = await getDoctorWorkingSchedule(
            appointment.DoctorID,
            AppointmentDate
        );

        if (!workingSchedule) {
            return res.status(409).json({
                success: false,
                message: "Doctor is not available on the selected date or the working schedule is invalid."
            });
        }

        // VALIDATE SLOT AGAINST APPOINTMENT TYPE

        const { onlineSlots, walkInSlots } =
            generateDoctorSlots(workingSchedule);

        const validSlots = newAppointmentType === "Online"
            ? onlineSlots
            : walkInSlots;

        if (!validSlots.includes(AppointmentTime)) {
            return res.status(409).json({
                success: false,
                message: `This time is not a valid ${newAppointmentType} appointment slot.`
            });
        }

        const newAppointmentDate = new Date(
            `${AppointmentDate}T00:00:00.000Z`
        );

        const { startOfDay, endOfDay } = getDateRange(
            AppointmentDate
        );

        // CHECK TARGET SLOT AVAILABILITY

        const existingAppointment = await Appointment.findOne({

            _id: {
                $ne: appointment._id
            },

            DoctorID: appointment.DoctorID,

            AppointmentDate: {
                $gte: startOfDay,
                $lt: endOfDay
            },

            AppointmentTime,

            Status: {
                $in: ACTIVE_STATUSES
            }

        });

        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: "The selected appointment slot is already booked. Please select another time."
            });
        }

        // SAVE RESCHEDULE HISTORY

        appointment.RescheduleHistory.push({

            PreviousDate: appointment.AppointmentDate,

            PreviousTime: appointment.AppointmentTime,

            NewDate: newAppointmentDate,

            NewTime: AppointmentTime,

            Reason:
                typeof Reason === "string"
                    ? Reason.trim()
                    : "",

            RescheduledBy:
                typeof RescheduledBy === "string"
                    ? RescheduledBy
                    : "",

            RescheduledAt: new Date()

        });

        // UPDATE APPOINTMENT AND UNIQUE SLOT KEY

        appointment.AppointmentDate = newAppointmentDate;

        appointment.AppointmentTime = AppointmentTime;

        if (isReceptionist && AppointmentType !== undefined) {
            appointment.AppointmentType = newAppointmentType;
        }

        appointment.Status = "Booked";

        appointment.ActiveSlotKey = generateActiveSlotKey(
            appointment.DoctorID,
            newAppointmentDate,
            AppointmentTime
        );


        // ===================================================
        // RESET REMINDER TRACKING AFTER RESCHEDULING
        // ===================================================

        appointment.ReminderEmailSentForDate = "";

        appointment.ReminderNotificationSentForDate = "";


        await appointment.save();

        // SEND REAL-TIME UPDATE
        emitAppointmentUpdate(req, "rescheduled", appointment);


        // ===================================================
        // CREATE PATIENT RESCHEDULE NOTIFICATION
        // ===================================================

        try {

            const doctorName =
                appointment.DoctorName || "your doctor";

            const newDate =
                newAppointmentDate.toISOString().slice(0, 10);

            const notificationTitle = isReceptionist
                ? "Appointment Rescheduled by Clinic"
                : "Appointment Rescheduled Successfully";

            const notificationMessage = isReceptionist

                ? `Your appointment with ${doctorName} has been rescheduled by the clinic receptionist. Previous appointment: ${previousDate} at ${previousTime}. New appointment: ${newDate} at ${AppointmentTime}.`

                : `You have successfully rescheduled your appointment with ${doctorName}. Previous appointment: ${previousDate} at ${previousTime}. New appointment: ${newDate} at ${AppointmentTime}.`;

            await createNotification({

                PatientID: appointment.PatientID,

                Title: notificationTitle,

                Message: notificationMessage,

                Type: "Rescheduled",

                AppointmentID: appointment._id

            });

            console.log(
                "Reschedule notification created for patient:",
                appointment.PatientID
            );

        } catch (notificationError) {

            console.error(
                "Appointment rescheduled, but notification creation failed:",
                notificationError
            );

        }


        // ===================================================
        // SEND APPOINTMENT RESCHEDULING EMAIL
        // ===================================================

        try {

            // GET PATIENT EMAIL DETAILS

            const patient = await Patient.findById(
                appointment.PatientID
            ).select("FullName Email");

            if (patient && patient.Email) {

                const doctorName =
                    appointment.DoctorName || "your doctor";

                const formattedPreviousDate =
                    new Date(
                        `${previousDate}T00:00:00.000Z`
                    ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        timeZone: "Asia/Kolkata"
                    });

                const formattedNewDate =
                    new Date(
                        `${AppointmentDate}T00:00:00.000Z`
                    ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        timeZone: "Asia/Kolkata"
                    });

                await sendEmail({

                    to: patient.Email,

                    subject: "DermCare - Appointment Rescheduled",

                    // PLAIN TEXT EMAIL

                    text:
                        `Hello ${patient.FullName},\n\n` +

                        `Your appointment with ${doctorName} has been rescheduled.\n\n` +

                        `Previous Appointment:\n` +
                        `Date: ${formattedPreviousDate}\n` +
                        `Time: ${previousTime}\n\n` +

                        `Updated Appointment:\n` +
                        `Date: ${formattedNewDate}\n` +
                        `Time: ${AppointmentTime}\n\n` +

                        `To view your updated appointment, log in to DermCare:\n` +
                        `${PATIENT_LOGIN_URL}\n\n` +

                        `Regards,\nDermCare Clinic`,

                    // HTML EMAIL WITH CLICKABLE LOGIN BUTTON

                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: auto;
                            padding: 25px;
                            color: #333;
                            border: 1px solid #e5e5e5;
                            border-radius: 10px;
                        ">

                            <h2 style="color: #2563eb;">
                                DermCare Clinic
                            </h2>

                            <p>Hello ${patient.FullName},</p>

                            <p>
                                Your appointment with
                                <strong>${doctorName}</strong>
                                has been rescheduled successfully.
                            </p>

                            <h3>Previous Appointment</h3>

                            <p>
                                <strong>Date:</strong>
                                ${formattedPreviousDate}<br>

                                <strong>Time:</strong>
                                ${previousTime}
                            </p>

                            <h3>Updated Appointment</h3>

                            <p>
                                <strong>Date:</strong>
                                ${formattedNewDate}<br>

                                <strong>Time:</strong>
                                ${AppointmentTime}
                            </p>

                            <p>
                                Please log in to DermCare to view
                                your updated appointment details.
                            </p>

                            <a href="${PATIENT_LOGIN_URL}"
                               style="
                                   display: inline-block;
                                   padding: 12px 24px;
                                   background-color: #2563eb;
                                   color: white;
                                   text-decoration: none;
                                   border-radius: 6px;
                                   font-weight: bold;
                               ">
                                Login to DermCare
                            </a>

                            <p style="
                                margin-top: 25px;
                                color: #666;
                            ">
                                Regards,<br>
                                <strong>DermCare Clinic</strong>
                            </p>

                        </div>
                    `

                });

                console.log(
                    "Rescheduling email sent to:",
                    patient.Email
                );

            } else {

                console.log(
                    "Patient email not found. Email skipped."
                );

            }

        } catch (emailError) {

            // EMAIL FAILURE MUST NOT AFFECT RESCHEDULING

            console.error(
                "Appointment rescheduled, but email sending failed:",
                emailError.message
            );

        }


        // ===================================================
        // SEND RESPONSE
        // ===================================================

        return res.status(200).json({

            success: true,

            message: "Appointment rescheduled successfully.",

            appointment

        });

    } catch (error) {

        console.error("Error rescheduling appointment:", error);

        if (isDuplicateSlotError(error)) {
            return res.status(409).json({
                success: false,
                message: "The selected appointment slot is already booked. Please select another time."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while rescheduling appointment."
        });

    }

};


// =======================================================
// EXPORT FUNCTIONS
// =======================================================

module.exports = {

    createAppointment,

    getAllAppointments,

    getDoctorAppointments,

    getDoctorAppointmentsByDate,

    getPatientAppointments,

    markAppointmentArrived,

    markAppointmentCompleted,

    cancelAppointment,

    rescheduleAppointment,

    getAvailableSlots,

    getAvailableDates

};