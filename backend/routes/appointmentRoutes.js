
/* =======================================================
   DERMCARE - APPOINTMENT ROUTES
   FILE: routes/appointmentRoutes.js
======================================================= */


// =======================================================
// IMPORT EXPRESS
// =======================================================

const express = require("express");


// =======================================================
// CREATE ROUTER
// =======================================================

const router = express.Router();


// =======================================================
// IMPORT APPOINTMENT CONTROLLER
// =======================================================

const {

    // CREATE APPOINTMENT
    createAppointment,

    // GET ALL APPOINTMENTS
    getAllAppointments,

    // GET ALL APPOINTMENTS FOR ONE DOCTOR
    getDoctorAppointments,

    // GET PATIENT APPOINTMENTS
    getPatientAppointments,

    // GET DOCTOR APPOINTMENTS BY DATE
    getDoctorAppointmentsByDate,

    // GET AVAILABLE SLOTS
    getAvailableSlots,

    // GET AVAILABLE DATES
    getAvailableDates,

    // CANCEL APPOINTMENT
    cancelAppointment,

    // RESCHEDULE APPOINTMENT
    rescheduleAppointment,

    // MARK APPOINTMENT AS ARRIVED
    markAppointmentArrived,

    // MARK APPOINTMENT AS COMPLETED
    markAppointmentCompleted

} = require("../controllers/appointmentController");


// =======================================================
// CREATE APPOINTMENT
// =======================================================
//
// POST:
// /api/appointments/book
//
// =======================================================

router.post(
    "/book",
    createAppointment
);


// =======================================================
// GET ALL APPOINTMENTS
// =======================================================
//
// GET:
// /api/appointments
//
// Used by:
// 1. Receptionist Dashboard
// 2. Today's Appointments page
// 3. Upcoming Appointments page
// 4. History page
//
// =======================================================

router.get(
    "/",
    getAllAppointments
);


// =======================================================
// GET ALL APPOINTMENTS FOR ONE DOCTOR
// =======================================================
//
// GET:
// /api/appointments/doctor/:doctorId
//
// Used by:
// 1. Doctor Dashboard
//
// IMPORTANT:
// Only appointments belonging to the requested doctor
// are returned.
//
// Cancelled appointments are excluded.
//
// =======================================================

router.get(
    "/doctor/:doctorId",
    getDoctorAppointments
);


// =======================================================
// GET AVAILABLE SLOTS FOR A DOCTOR ON A DATE
// =======================================================
//
// GET:
// /api/appointments/available-slots/:doctorId/:date
//
// Query:
// ?type=Online
// OR
// ?type=Walk-in
//
// Used by:
// 1. Patient appointment booking (Online)
// 2. Receptionist Walk-in booking (Walk-in)
//
// =======================================================

router.get(
    "/available-slots/:doctorId/:date",
    getAvailableSlots
);


// =======================================================
// GET AVAILABLE DATES FOR A DOCTOR
// =======================================================
//
// GET:
// /api/appointments/available-dates/:doctorId
//
// Query:
// ?type=Online&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
//
// OR:
// ?type=Walk-in&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
//
// Used by:
// 1. Patient booking - Online dates
// 2. Receptionist booking - Walk-in dates
//
// =======================================================

router.get(
    "/available-dates/:doctorId",
    getAvailableDates
);


// =======================================================
// GET DOCTOR APPOINTMENTS BY DATE
// =======================================================
//
// GET:
// /api/appointments/doctor/:doctorId/date/:date
//
// =======================================================

router.get(
    "/doctor/:doctorId/date/:date",
    getDoctorAppointmentsByDate
);


// =======================================================
// GET PATIENT APPOINTMENT HISTORY
// =======================================================
//
// GET:
// /api/appointments/patient/:patientId
//
// =======================================================

router.get(
    "/patient/:patientId",
    getPatientAppointments
);


// =======================================================
// MARK APPOINTMENT AS ARRIVED
// =======================================================
//
// PATCH:
// /api/appointments/:appointmentId/arrived
//
// Receptionist marks the patient as arrived.
//
// STATUS:
// Booked → Arrived
//
// =======================================================

router.patch(
    "/:appointmentId/arrived",
    markAppointmentArrived
);


// =======================================================
// MARK APPOINTMENT AS COMPLETED
// =======================================================
//
// PATCH:
// /api/appointments/:appointmentId/complete
//
// Doctor marks the appointment as completed.
//
// STATUS:
// Arrived → Completed
//
// =======================================================

router.patch(
    "/:appointmentId/complete",
    markAppointmentCompleted
);


// =======================================================
// CANCEL APPOINTMENT
// =======================================================
//
// PATCH:
// /api/appointments/:appointmentId/cancel
//
// Patient Request Body:
// {
//     "PatientID": "patient_id"
// }
//
// Receptionist cancellation must also provide:
// {
//     "CancelledBy": "Receptionist",
//     "CancellationReason": "Reason for cancellation"
// }
//
// =======================================================

router.patch(
    "/:appointmentId/cancel",
    cancelAppointment
);


// =======================================================
// RESCHEDULE APPOINTMENT
// =======================================================
//
// PATCH:
// /api/appointments/:appointmentId/reschedule
//
// Request Body:
// {
//     "PatientID": "patient_id",
//     "AppointmentDate": "2026-09-15",
//     "AppointmentTime": "10:20"
// }
//
// =======================================================

router.patch(
    "/:appointmentId/reschedule",
    rescheduleAppointment
);


// =======================================================
// EXPORT ROUTER
// =======================================================

module.exports = router;
