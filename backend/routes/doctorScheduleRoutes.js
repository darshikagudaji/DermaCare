const express = require("express");


// =======================================================
// CREATE ROUTER
// =======================================================

const router =
    express.Router();


// =======================================================
// IMPORT DOCTOR SCHEDULE CONTROLLER
// =======================================================

const {

    saveDoctorSchedule,

    getDoctorSchedule

} = require(
    "../controllers/doctorScheduleController"
);


// =======================================================
// SAVE OR UPDATE DOCTOR WEEKLY SCHEDULE
// =======================================================
//
// POST:
// /api/doctor-schedule/save
//
// =======================================================

router.post(

    "/save",

    saveDoctorSchedule

);



// =======================================================
// GET DOCTOR SCHEDULE
// =======================================================
//
// GET:
// /api/doctor-schedule/:doctorId
//
// =======================================================

router.get(

    "/:doctorId",

    getDoctorSchedule

);



// =======================================================
// EXPORT ROUTER
// =======================================================

module.exports =
    router;