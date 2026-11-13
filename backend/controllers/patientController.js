
 // =======================================================
// PATIENT CONTROLLER
// =======================================================

const Patient = require("../models/Patient");

const bcrypt = require("bcrypt");


// =======================================================
// PATIENT REGISTRATION
// =======================================================

const registerPatient = async (req, res) => {

    try {

        console.log("Registration request received");

        console.log("Received data:", req.body);


        // ===================================================
        // GET DATA FROM FRONTEND
        // ===================================================

        const {

            fullName,

            email,

            password,

            mobileNo,

            dateOfBirth,

            gender,

            bloodGroup,

            address

        } = req.body;


        // ===================================================
        // CHECK REQUIRED FIELDS
        // ===================================================

        if (

            !fullName ||

            !email ||

            !password ||

            !mobileNo ||

            !dateOfBirth ||

            !gender ||

            !bloodGroup ||

            !address

        ) {

            return res.status(400).json({

                message:
                    "Please fill all required fields."

            });

        }


        // ===================================================
        // CHECK EXISTING EMAIL
        // ===================================================

        const existingPatient =
            await Patient.findOne({

                Email:
                    email

            });


        if (existingPatient) {

            return res.status(400).json({

                message:
                    "Email already registered."

            });

        }


        // ===================================================
        // HASH PASSWORD
        // ===================================================

        const hashedPassword =
            await bcrypt.hash(

                password,

                10

            );


        // ===================================================
        // CREATE PATIENT
        // ===================================================

        const newPatient =
            new Patient({

                FullName:
                    fullName,

                Email:
                    email,

                Password:
                    hashedPassword,

                "Mobile No":
                    mobileNo,

                DateOfBirth:
                    dateOfBirth,

                Gender:
                    gender,

                "Blood Group":
                    bloodGroup,

                Address:
                    address

            });


        // ===================================================
        // SAVE TO MONGODB
        // ===================================================

        const savedPatient =
            await newPatient.save();


        console.log(

            "Patient registered successfully:",

            savedPatient._id

        );


        // ===================================================
        // SEND PATIENT DATA
        //
        // PASSWORD IS NOT SENT
        // ===================================================

        return res.status(201).json({

            message:
                "Patient registered successfully.",

            patient: {

                id:
                    savedPatient._id,

                fullName:
                    savedPatient.FullName,

                email:
                    savedPatient.Email,

                mobileNo:
                    savedPatient["Mobile No"],

                dateOfBirth:
                    savedPatient.DateOfBirth,

                gender:
                    savedPatient.Gender,

                bloodGroup:
                    savedPatient["Blood Group"],

                address:
                    savedPatient.Address

            }

        });

    }


    // ===================================================
    // REGISTRATION ERROR
    // ===================================================

    catch (error) {

        console.error(

            "Patient registration error:",

            error

        );


        return res.status(500).json({

            message:
                "Server error during patient registration.",

            error:
                error.message

        });

    }

};


// =======================================================
// WALK-IN PATIENT REGISTRATION
// =======================================================
//
// POST:
// /api/patients/walk-in-register
//
// Used by the receptionist to register a new walk-in
// patient without requiring a password.
//
// Existing patient registration remains unchanged.
//
// =======================================================

const registerWalkInPatient = async (req, res) => {

    try {

        console.log(
            "Walk-in patient registration request received"
        );

        console.log(
            "Walk-in patient data received"
        );


        // ===================================================
        // GET DATA FROM FRONTEND
        // ===================================================

        const {

            fullName,

            email,

            mobileNo,

            dateOfBirth,

            gender,

            bloodGroup,

            address

        } = req.body;


        // ===================================================
        // CHECK REQUIRED FIELDS
        // These match the existing Patient schema.
        // ===================================================

        if (

            !fullName ||

            !email ||

            !mobileNo ||

            !dateOfBirth ||

            !gender ||

            !bloodGroup ||

            !address

        ) {

            return res.status(400).json({

                message:
                    "Please fill all required patient fields."

            });

        }


        // ===================================================
        // NORMALIZE EMAIL
        // ===================================================

        const normalizedEmail =
            String(email).trim().toLowerCase();


        // ===================================================
        // CHECK EXISTING EMAIL
        // ===================================================

        const existingPatient =
            await Patient.findOne({

                Email:
                    normalizedEmail

            });


        if (existingPatient) {

            return res.status(409).json({

                message:
                    "This email is already registered. Please use the existing patient record."

            });

        }


        // ===================================================
        // CREATE WALK-IN PATIENT
        //
        // NO PASSWORD IS PROVIDED OR GENERATED.
        // ===================================================

        const newPatient =
            new Patient({

                FullName:
                    String(fullName).trim(),

                Email:
                    normalizedEmail,

                "Mobile No":
                    String(mobileNo).trim(),

                DateOfBirth:
                    dateOfBirth,

                Gender:
                    gender,

                "Blood Group":
                    bloodGroup,

                Address:
                    String(address).trim()

            });


        // ===================================================
        // SAVE WALK-IN PATIENT TO MONGODB
        // ===================================================

        const savedPatient =
            await newPatient.save();


        console.log(

            "Walk-in patient registered successfully:",

            savedPatient._id

        );


        // ===================================================
        // SEND PATIENT DATA
        //
        // PASSWORD IS NOT SENT.
        // ===================================================

        return res.status(201).json({

            success:
                true,

            message:
                "Walk-in patient registered successfully.",

            patient: {

                id:
                    savedPatient._id,

                fullName:
                    savedPatient.FullName,

                email:
                    savedPatient.Email,

                mobileNo:
                    savedPatient["Mobile No"],

                dateOfBirth:
                    savedPatient.DateOfBirth,

                gender:
                    savedPatient.Gender,

                bloodGroup:
                    savedPatient["Blood Group"],

                address:
                    savedPatient.Address

            }

        });

    }


    // ===================================================
    // WALK-IN REGISTRATION ERROR
    // ===================================================

    catch (error) {

        console.error(

            "Walk-in patient registration error:",

            error

        );


        // ===================================================
        // HANDLE DUPLICATE EMAIL
        // ===================================================

        if (error.code === 11000) {

            return res.status(409).json({

                message:
                    "This email is already registered."

            });

        }


        // ===================================================
        // HANDLE VALIDATION ERROR
        // ===================================================

        if (error.name === "ValidationError") {

            return res.status(400).json({

                message:
                    "Patient details are invalid.",

                error:
                    error.message

            });

        }


        // ===================================================
        // SERVER ERROR
        // ===================================================

        return res.status(500).json({

            message:
                "Server error during walk-in patient registration."

        });

    }

};


// =======================================================
// PATIENT LOGIN
// =======================================================

const loginPatient = async (req, res) => {

    try {

        console.log(
            "Patient login request received"
        );


        // ===================================================
        // GET LOGIN DATA
        // ===================================================

        const {

            email,

            password

        } = req.body;


        // ===================================================
        // CHECK EMPTY FIELDS
        // ===================================================

        if (

            !email ||

            !password

        ) {

            return res.status(400).json({

                message:
                    "Please enter your email and password."

            });

        }


        // ===================================================
        // FIND PATIENT BY EMAIL
        // ===================================================

        const patient =
            await Patient.findOne({

                Email:
                    email

            });


        // ===================================================
        // EMAIL NOT FOUND
        // ===================================================

        if (!patient) {

            return res.status(401).json({

                field:
                    "email",

                message:
                    "Email is not registered."

            });

        }


        // ===================================================
        // CHECK PASSWORD
        // ===================================================

        const passwordMatch =
            await bcrypt.compare(

                password,

                patient.Password

            );


        // ===================================================
        // PASSWORD INCORRECT
        // ===================================================

        if (!passwordMatch) {

            return res.status(401).json({

                field:
                    "password",

                message:
                    "Incorrect password."

            });

        }


        // ===================================================
        // LOGIN SUCCESSFUL
        // ===================================================

        return res.status(200).json({

            message:
                "Login successful.",

            patient: {

                id:
                    patient._id,

                fullName:
                    patient.FullName,

                email:
                    patient.Email,

                mobileNo:
                    patient["Mobile No"],

                dateOfBirth:
                    patient.DateOfBirth,

                gender:
                    patient.Gender,

                bloodGroup:
                    patient["Blood Group"],

                address:
                    patient.Address

            }

        });

    }


    // ===================================================
    // LOGIN ERROR
    // ===================================================

    catch (error) {

        console.error(

            "Patient login error:",

            error

        );


        return res.status(500).json({

            message:
                "Server error during patient login."

        });

    }

};


// =======================================================
// GET ALL PATIENTS
// =======================================================
//
// GET:
//
// /api/patients
//
// This function is used by the Receptionist Dashboard
// to get all registered patients.
//
// Password is not returned.
//
// =======================================================

const getAllPatients = async (req, res) => {

    try {

        // ===================================================
        // GET ALL PATIENTS
        //
        // PASSWORD IS EXCLUDED FOR SECURITY
        // ===================================================

        const patients =
            await Patient
                .find()
                .select("-Password");


        // ===================================================
        // SEND PATIENTS
        // ===================================================

        return res.status(200).json({

            success:
                true,

            patients:
                patients

        });

    }


    // ===================================================
    // GET PATIENTS ERROR
    // ===================================================

    catch (error) {

        console.error(

            "Error getting all patients:",

            error

        );


        return res.status(500).json({

            success:
                false,

            message:
                "Server error while getting patients."

        });

    }

};


// =======================================================
// GET PATIENT PROFILE
// =======================================================

const getPatientProfile = async (req, res) => {

    try {

        console.log(
            "Get patient profile request received"
        );


        // ===================================================
        // GET PATIENT ID FROM URL
        // ===================================================

        const patientId =
            req.params.id;


        // ===================================================
        // FIND PATIENT
        // ===================================================

        const patient =
            await Patient
                .findById(patientId)
                .select("-Password");


        // ===================================================
        // PATIENT NOT FOUND
        // ===================================================

        if (!patient) {

            return res.status(404).json({

                message:
                    "Patient not found."

            });

        }


        // ===================================================
        // SEND PATIENT DATA
        // ===================================================

        return res.status(200).json({

            patient: {

                id:
                    patient._id,

                fullName:
                    patient.FullName,

                email:
                    patient.Email,

                mobileNo:
                    patient["Mobile No"],

                dateOfBirth:
                    patient.DateOfBirth,

                gender:
                    patient.Gender,

                bloodGroup:
                    patient["Blood Group"],

                address:
                    patient.Address

            }

        });

    }


    // ===================================================
    // PROFILE ERROR
    // ===================================================

    catch (error) {

        console.error(

            "Get patient profile error:",

            error

        );


        return res.status(500).json({

            message:
                "Server error while fetching patient profile."

        });

    }

};


// =======================================================
// UPDATE PATIENT PROFILE
// =======================================================

const updatePatientProfile = async (req, res) => {

    try {

        console.log(
            "Update patient profile request received"
        );

        console.log(
            "Patient ID:",
            req.params.id
        );

        console.log(
            "Updated data:",
            req.body
        );


        // ===================================================
        // GET PATIENT ID
        // ===================================================

        const patientId =
            req.params.id;


        // ===================================================
        // GET UPDATED DATA
        // ===================================================

        const {

            fullName,

            email,

            mobileNo,

            dateOfBirth,

            gender,

            bloodGroup,

            address

        } = req.body;


        // ===================================================
        // CHECK REQUIRED FIELDS
        // ===================================================

        if (

            !fullName ||

            !email ||

            !mobileNo ||

            !dateOfBirth ||

            !gender ||

            !bloodGroup ||

            !address

        ) {

            return res.status(400).json({

                message:
                    "Please fill all required fields."

            });

        }


        // ===================================================
        // CHECK EMAIL USED BY ANOTHER PATIENT
        // ===================================================

        const existingPatient =
            await Patient.findOne({

                Email:
                    email,

                _id: {

                    $ne:
                        patientId

                }

            });


        if (existingPatient) {

            return res.status(400).json({

                message:
                    "This email is already registered with another patient."

            });

        }


        // ===================================================
        // UPDATE PATIENT
        // ===================================================

        const updatedPatient =
            await Patient.findByIdAndUpdate(

                patientId,

                {

                    FullName:
                        fullName,

                    Email:
                        email,

                    "Mobile No":
                        mobileNo,

                    DateOfBirth:
                        dateOfBirth,

                    Gender:
                        gender,

                    "Blood Group":
                        bloodGroup,

                    Address:
                        address

                },

                {

                    new:
                        true,

                    runValidators:
                        true

                }

            ).select("-Password");


        // ===================================================
        // PATIENT NOT FOUND
        // ===================================================

        if (!updatedPatient) {

            return res.status(404).json({

                message:
                    "Patient not found."

            });

        }


        // ===================================================
        // SEND UPDATED PATIENT
        // ===================================================

        return res.status(200).json({

            message:
                "Profile updated successfully.",

            patient: {

                id:
                    updatedPatient._id,

                fullName:
                    updatedPatient.FullName,

                email:
                    updatedPatient.Email,

                mobileNo:
                    updatedPatient["Mobile No"],

                dateOfBirth:
                    updatedPatient.DateOfBirth,

                gender:
                    updatedPatient.Gender,

                bloodGroup:
                    updatedPatient["Blood Group"],

                address:
                    updatedPatient.Address

            }

        });

    }


    // ===================================================
    // UPDATE PROFILE ERROR
    // ===================================================

    catch (error) {

        console.error(

            "Update patient profile error:",

            error

        );


        return res.status(500).json({

            message:
                "Server error while updating patient profile.",

            error:
                error.message

        });

    }

};


// =======================================================
// CHANGE PATIENT PASSWORD
// =======================================================

const changePatientPassword = async (req, res) => {

    try {

        console.log(
            "Change patient password request received"
        );

        console.log(
            "Patient ID:",
            req.params.id
        );


        // ===================================================
        // GET PATIENT ID
        // ===================================================

        const patientId =
            req.params.id;


        // ===================================================
        // GET PASSWORD DATA
        // ===================================================

        const {

            currentPassword,

            newPassword,

            confirmPassword

        } = req.body;


        // ===================================================
        // CHECK REQUIRED FIELDS
        // ===================================================

        if (

            !currentPassword ||

            !newPassword ||

            !confirmPassword

        ) {

            return res.status(400).json({

                message:
                    "Please fill all password fields."

            });

        }


        // ===================================================
        // CHECK CURRENT PASSWORD EMPTY
        // ===================================================

        if (!currentPassword.trim()) {

            return res.status(400).json({

                field:
                    "currentPassword",

                message:
                    "Current password is required."

            });

        }


        // ===================================================
        // CHECK NEW PASSWORD EMPTY
        // ===================================================

        if (!newPassword.trim()) {

            return res.status(400).json({

                field:
                    "newPassword",

                message:
                    "New password is required."

            });

        }


        // ===================================================
        // CHECK CONFIRM PASSWORD EMPTY
        // ===================================================

        if (!confirmPassword.trim()) {

            return res.status(400).json({

                field:
                    "confirmPassword",

                message:
                    "Please confirm your new password."

            });

        }


        // ===================================================
        // CHECK NEW PASSWORD AND CONFIRM PASSWORD
        // ===================================================

        if (
            newPassword !==
            confirmPassword
        ) {

            return res.status(400).json({

                field:
                    "confirmPassword",

                message:
                    "New password and confirm password do not match."

            });

        }


        // ===================================================
        // CHECK NEW PASSWORD LENGTH
        // ===================================================

        if (newPassword.length < 6) {

            return res.status(400).json({

                field:
                    "newPassword",

                message:
                    "New password must be at least 6 characters."

            });

        }


        // ===================================================
        // FIND PATIENT
        // ===================================================

        const patient =
            await Patient.findById(
                patientId
            );


        // ===================================================
        // PATIENT NOT FOUND
        // ===================================================

        if (!patient) {

            return res.status(404).json({

                message:
                    "Patient not found."

            });

        }


        // ===================================================
        // CHECK CURRENT PASSWORD
        // ===================================================

        console.log(
            "Checking current patient password..."
        );


        const passwordMatch =
            await bcrypt.compare(

                currentPassword,

                patient.Password

            );


        // ===================================================
        // WRONG CURRENT PASSWORD
        // ===================================================

        if (!passwordMatch) {

            console.log(
                "Current password is incorrect."
            );


            return res.status(401).json({

                field:
                    "currentPassword",

                message:
                    "Current password is incorrect."

            });

        }


        // ===================================================
        // CHECK IF NEW PASSWORD IS SAME
        // ===================================================

        const samePassword =
            await bcrypt.compare(

                newPassword,

                patient.Password

            );


        if (samePassword) {

            return res.status(400).json({

                field:
                    "newPassword",

                message:
                    "New password must be different from current password."

            });

        }


        // ===================================================
        // HASH NEW PASSWORD
        // ===================================================

        const hashedPassword =
            await bcrypt.hash(

                newPassword,

                10

            );


        // ===================================================
        // UPDATE PASSWORD
        // ===================================================

        patient.Password =
            hashedPassword;


        await patient.save();


        // ===================================================
        // PASSWORD UPDATED SUCCESSFULLY
        // ===================================================

        console.log(
            "Patient password changed successfully."
        );


        return res.status(200).json({

            message:
                "Password changed successfully."

        });

    }


    // ===================================================
    // CHANGE PASSWORD ERROR
    // ===================================================

    catch (error) {

        console.error(

            "Change patient password error:",

            error

        );


        return res.status(500).json({

            message:
                "Server error while changing password."

        });

    }

};


// =======================================================
// FORGOT PATIENT PASSWORD
// =======================================================
//
// Used by the Forgot Password page.
//
// NOTE:
// This basic implementation changes the password using
// the email address alone. Email ownership is not verified.
// Do not use this approach for a production application.
// =======================================================

const forgotPatientPassword = async (req, res) => {

    try {

        console.log(
            "Forgot patient password request received"
        );


        // ===================================================
        // GET DATA FROM FRONTEND
        // ===================================================

        const {

            email,

            newPassword,

            confirmPassword

        } = req.body;


        // ===================================================
        // CHECK REQUIRED FIELDS
        // ===================================================

        if (

            !email ||

            !newPassword ||

            !confirmPassword

        ) {

            return res.status(400).json({

                message:
                    "Please fill all required fields."

            });

        }


        // ===================================================
        // CHECK NEW PASSWORD LENGTH
        // ===================================================

        if (newPassword.length < 8) {

            return res.status(400).json({

                field:
                    "newPassword",

                message:
                    "Password must be at least 8 characters."

            });

        }


        // ===================================================
        // CHECK PASSWORD CONFIRMATION
        // ===================================================

        if (newPassword !== confirmPassword) {

            return res.status(400).json({

                field:
                    "confirmPassword",

                message:
                    "Passwords do not match."

            });

        }


        // ===================================================
        // NORMALIZE EMAIL
        // ===================================================

        const normalizedEmail =
            String(email).trim().toLowerCase();


        // ===================================================
        // FIND PATIENT BY EMAIL
        // ===================================================

        const patient =
            await Patient.findOne({

                Email:
                    normalizedEmail

            });


        // ===================================================
        // PATIENT NOT FOUND
        // ===================================================

        if (!patient) {

            return res.status(404).json({

                field:
                    "email",

                message:
                    "No patient account found with this email."

            });

        }


        // ===================================================
        // HASH NEW PASSWORD
        // ===================================================

        const hashedPassword =
            await bcrypt.hash(

                newPassword,

                10

            );


        // ===================================================
        // UPDATE PATIENT PASSWORD
        // ===================================================

        patient.Password =
            hashedPassword;


        await patient.save();


        // ===================================================
        // PASSWORD RESET SUCCESSFUL
        // ===================================================

        console.log(
            "Patient password reset successfully."
        );


        return res.status(200).json({

            success:
                true,

            message:
                "Password updated successfully. You can now log in."

        });

    }


    // ===================================================
    // FORGOT PASSWORD ERROR
    // ===================================================

    catch (error) {

        console.error(

            "Forgot patient password error:",

            error

        );


        return res.status(500).json({

            message:
                "Server error while resetting password."

        });

    }

};


// =======================================================
// EXPORT CONTROLLERS
// =======================================================

module.exports = {

    registerPatient,

    registerWalkInPatient,

    loginPatient,

    getAllPatients,

    getPatientProfile,

    updatePatientProfile,

    changePatientPassword,

    forgotPatientPassword

};
