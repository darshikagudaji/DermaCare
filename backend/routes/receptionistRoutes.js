
 // =======================================================
// RECEPTIONIST ROUTES
// DERMCARE
// FILE: routes/receptionistRoutes.js
// =======================================================

const express = require("express");

const router = express.Router();


// =======================================================
// IMPORT RECEPTIONIST CONTROLLER
// =======================================================

const {

    loginReceptionist

} = require("../controllers/receptionistController");


// =======================================================
// RECEPTIONIST LOGIN
// =======================================================
//
// POST /api/receptionists/login
//
// =======================================================

router.post(

    "/login",

    loginReceptionist

);


// =======================================================
// EXPORT ROUTER
// =======================================================

module.exports = router;
