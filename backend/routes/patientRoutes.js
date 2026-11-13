
// =======================================================
// PATIENT ROUTES
// =======================================================

const express =
    require("express");


const router =
    express.Router();


// =======================================================
// IMPORT PATIENT CONTROLLERS
// =======================================================

const {

    registerPatient,

    registerWalkInPatient,

    loginPatient,

    getPatientProfile,

    updatePatientProfile,

    changePatientPassword,

    getAllPatients,

    forgotPatientPassword

} =
    require(
        "../controllers/patientController"
    );



// =======================================================
// PATIENT REGISTRATION
// =======================================================

router.post(

    "/register",

    registerPatient

);



// =======================================================
// WALK-IN PATIENT REGISTRATION
// =======================================================
//
// POST:
//
// /api/patients/walk-in-register
//
// This route is used by the Receptionist Walk-in page
// to register a new patient without requiring a password.
//
// =======================================================

router.post(

    "/walk-in-register",

    registerWalkInPatient

);



// =======================================================
// PATIENT LOGIN
// =======================================================

router.post(

    "/login",

    loginPatient

);



// =======================================================
// GET ALL PATIENTS
// =======================================================
//
// GET:
//
// /api/patients
//
// This route is used by the Receptionist Dashboard
// to get all registered patients.
//
// =======================================================

router.get(

    "/",

    getAllPatients

);



// =======================================================
// GET PATIENT PROFILE
// =======================================================

router.get(

    "/profile/:id",

    getPatientProfile

);



// =======================================================
// UPDATE PATIENT PROFILE
// =======================================================

router.put(

    "/profile/:id",

    updatePatientProfile

);



// =======================================================
// CHANGE PATIENT PASSWORD
// =======================================================

router.put(

    "/profile/:id/password",

    changePatientPassword

);



// =======================================================
// FORGOT PATIENT PASSWORD
// =======================================================
//
// POST:
//
// /api/patients/forgot-password
//
// Used by the Forgot Password page.
// =======================================================

router.post(

    "/forgot-password",

    forgotPatientPassword

);



// =======================================================
// EXPORT ROUTER
// =======================================================

module.exports =
    router;
