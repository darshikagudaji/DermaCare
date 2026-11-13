// =======================================================
// DOCTOR ROUTES
// DERMCARE
// FILE: routes/doctorRoutes.js
// =======================================================

const express = require("express");

const router = express.Router();


// =======================================================
// IMPORT DOCTOR CONTROLLERS
// =======================================================

const {

    addDoctor,

    getAllDoctors,

    getDoctorById,

    updateDoctorProfile,

    updateDoctorWorkingHours,

    loginDoctor,

    changeDoctorPassword,

    deleteDoctor

} = require("../controllers/doctorController");


// =======================================================
// IMPORT MULTER CONFIGURATION
// =======================================================

const uploadDoctorImage =
    require("../config/multer");


// =======================================================
// GET ALL DOCTORS
// =======================================================

router.get(

    "/",

    getAllDoctors

);


// =======================================================
// ADD DOCTOR
// =======================================================
//
// IMPORTANT:
// DO NOT CHANGE THIS.
//
// Your Add Doctor page already works and uses
// the image field name "doctorImage".
// =======================================================

router.post(

    "/add",

    uploadDoctorImage.single("doctorImage"),

    addDoctor

);


// =======================================================
// DOCTOR LOGIN
// =======================================================

router.post(

    "/login",

    loginDoctor

);


// =======================================================
// CHANGE DOCTOR PASSWORD
// =======================================================
//
// URL:
//
// PUT /api/doctors/:id/change-password
// =======================================================

router.put(

    "/:id/change-password",

    changeDoctorPassword

);


// =======================================================
// UPDATE DOCTOR WORKING HOURS
// =======================================================
//
// URL:
//
// PUT /api/doctors/working-hours/:id
// =======================================================

router.put(

    "/working-hours/:id",

    updateDoctorWorkingHours

);


// =======================================================
// UPDATE DOCTOR PROFILE
// =======================================================
//
// IMPORTANT:
//
// Edit Doctor page sends the image using:
//
// "DoctorImage"
//
// So Multer must receive:
//
// "DoctorImage"
//
// This does NOT affect the Add Doctor route.
// =======================================================

router.put(

    "/:id",

    uploadDoctorImage.single("DoctorImage"),

    updateDoctorProfile

);


// =======================================================
// DELETE DOCTOR
// =======================================================
//
// URL:
//
// DELETE /api/doctors/:id
//
// IMPORTANT:
//
// Only the doctor document is deleted.
//
// Existing appointments and prescriptions
// are NOT deleted.
// =======================================================

router.delete(

    "/:id",

    deleteDoctor

);


// =======================================================
// GET SINGLE DOCTOR
// =======================================================
//
// GET /api/doctors/DOCTOR_ID
//
// This route stays after the specific routes.
// =======================================================

router.get(

    "/:id",

    getDoctorById

);


// =======================================================
// EXPORT ROUTER
// =======================================================

module.exports = router;