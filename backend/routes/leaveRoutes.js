// =======================================================
// DERMCARE - LEAVE ROUTES
// FILE: routes/leaveRoutes.js
// =======================================================

const express = require("express");

const router = express.Router();


// =======================================================
// IMPORT LEAVE CONTROLLERS
// =======================================================

const {

    addLeave,

    getDoctorLeaves,

    getAllLeaves,

    deleteLeave

} = require("../controllers/leaveController");


// =======================================================
// ADD LEAVE
// =======================================================
// Receptionist adds a leave date for a doctor.
//
// Example:
//
// POST /api/leaves/add
//
// Request body:
//
// {
//     "doctorId": "DOCTOR_ID",
//     "leaveDate": "2026-09-01",
//     "reason": "Personal Leave"
// }
//
// =======================================================

router.post(

    "/add",

    addLeave

);


// =======================================================
// GET ALL LEAVES
// =======================================================
// Used by the Receptionist Leave page.
//
// Returns leave records for all doctors.
//
// Example:
//
// GET /api/leaves
//
// =======================================================

router.get(

    "/",

    getAllLeaves

);


// =======================================================
// GET LEAVES OF ONE DOCTOR
// =======================================================
// Used when we want to display leave dates for a
// particular doctor.
//
// Example:
//
// GET /api/leaves/doctor/DOCTOR_ID
//
// =======================================================

router.get(

    "/doctor/:doctorId",

    getDoctorLeaves

);


// =======================================================
// DELETE LEAVE
// =======================================================
// Used when the Receptionist wants to remove a leave.
//
// Example:
//
// DELETE /api/leaves/LEAVE_ID
//
// =======================================================

router.delete(

    "/:id",

    deleteLeave

);


// =======================================================
// EXPORT ROUTER
// =======================================================

module.exports = router;