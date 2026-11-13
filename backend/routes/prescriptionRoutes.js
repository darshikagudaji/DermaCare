
/* =======================================================
   DERMCARE - PRESCRIPTION ROUTES
   FILE: routes/prescriptionRoutes.js
======================================================= */

const express = require("express");
const router = express.Router();

const {
    createPrescription,
    getPrescriptionsByAppointment,
    getDoctorPrescriptions,
    getPatientPrescriptions
} = require("../controllers/prescriptionController");


// =======================================================
// CREATE / SAVE PRESCRIPTION
// POST: /api/prescriptions
// =======================================================

router.post(
    "/",
    createPrescription
);


// =======================================================
// GET PRESCRIPTIONS FOR AN APPOINTMENT
// GET: /api/prescriptions/appointment/:appointmentId
// =======================================================

router.get(
    "/appointment/:appointmentId",
    getPrescriptionsByAppointment
);


// =======================================================
// GET PRESCRIPTIONS FOR A DOCTOR
// GET: /api/prescriptions/doctor/:doctorId
// =======================================================

router.get(
    "/doctor/:doctorId",
    getDoctorPrescriptions
);


// =======================================================
// GET PRESCRIPTIONS FOR A PATIENT
// GET: /api/prescriptions/patient/:patientId
// =======================================================

router.get(
    "/patient/:patientId",
    getPatientPrescriptions
);


// =======================================================
// EXPORT ROUTER
// =======================================================

module.exports = router;
