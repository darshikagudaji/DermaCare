// =======================================================
// DOCTOR CONTROLLER
// DERMCARE
// FILE: controllers/doctorController.js
// =======================================================

const Doctor = require("../models/Doctor");

const Leave = require("../models/Leave");

const bcrypt = require("bcrypt");


// =======================================================
// HELPER - FORMAT DOCTOR DATA
// =======================================================

function formatDoctor(doctor) {

    if (!doctor) {

        return null;

    }


    return {

        // ===================================================
        // DOCTOR ID
        // ===================================================

        _id:
            doctor._id,

        id:
            doctor._id,


        // ===================================================
        // BASIC INFORMATION
        // ===================================================

        fullName:
            doctor.FullName || "",

        email:
            doctor.Email || "",

        mobileNo:
            doctor["Mobile No"] || "",


        // ===================================================
        // GENDER
        // ===================================================

        gender:
            doctor.gender || "",


        specialization:
            doctor.Specialization || "",

        qualification:
            doctor.Qualification || "",

        experience:
            doctor.Experience ?? "",


        // ===================================================
        // CONSULTATION INFORMATION
        // ===================================================

        consultationFee:
            doctor.ConsultationFee ?? "",


        // ===================================================
        // WORKING INFORMATION
        // ===================================================

        workingDays:
            doctor.WorkingDays || [],

        workingHours:
            doctor.WorkingHours || {},

        availability:
            doctor.Availability || "Available",


        // ===================================================
        // DOCTOR IMAGE
        // ===================================================

        doctorImage:
            doctor.DoctorImage || null,


        // ===================================================
        // ABOUT DOCTOR
        // ===================================================

        aboutDoctor:
            doctor.AboutDoctor || ""

    };

}



// =======================================================
// ADD DOCTOR
// =======================================================

const addDoctor = async (req, res) => {

    try {

        console.log(
            "Add doctor request received"
        );

        console.log(
            "Received data:",
            req.body
        );

        console.log(
            "Uploaded image:",
            req.file
        );


        // ===================================================
        // GET DATA FROM FRONTEND
        // ===================================================

        const {

            fullName,
            email,
            password,
            mobileNo,
            gender,
            specialization,
            qualification,
            experience,
            consultationFee,
            workingDays,
            aboutDoctor

        } = req.body;


        // ===================================================
        // CHECK REQUIRED FIELDS
        // ===================================================

        if (

            !fullName ||
            !email ||
            !password ||
            !mobileNo ||
            !gender ||
            !specialization ||
            !qualification ||
            experience === undefined ||
            experience === null ||
            experience === "" ||
            consultationFee === undefined ||
            consultationFee === null ||
            consultationFee === "" ||
            !workingDays

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill all required doctor fields."

            });

        }


        // ===================================================
        // VALIDATE GENDER
        // ===================================================

        const validGenders = [

            "Male",

            "Female",

            "Other"

        ];


        const genderValue =
            String(gender).trim();


        if (
            !validGenders.includes(
                genderValue
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please select a valid gender."

            });

        }


        // ===================================================
        // CHECK DOCTOR IMAGE
        // ===================================================

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload a doctor image."

            });

        }


        // ===================================================
        // CONVERT WORKING DAYS INTO ARRAY
        // ===================================================

        let parsedWorkingDays =
            workingDays;


        if (
            typeof workingDays === "string"
        ) {

            try {

                parsedWorkingDays =
                    JSON.parse(workingDays);

            }

            catch (error) {

                parsedWorkingDays =
                    workingDays
                        .split(",")
                        .map(
                            day => day.trim()
                        )
                        .filter(
                            day => day !== ""
                        );

            }

        }


        // ===================================================
        // CHECK WORKING DAYS
        // ===================================================

        if (

            !Array.isArray(parsedWorkingDays) ||
            parsedWorkingDays.length === 0

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please select at least one working day."

            });

        }


        // ===================================================
        // VALIDATE EXPERIENCE
        // ===================================================

        const experienceNumber =
            Number(experience);


        if (

            Number.isNaN(experienceNumber) ||
            experienceNumber < 0 ||
            experienceNumber > 80

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter experience between 0 and 80 years."

            });

        }


        // ===================================================
        // VALIDATE CONSULTATION FEE
        // ===================================================

        const consultationFeeNumber =
            Number(consultationFee);


        if (

            Number.isNaN(consultationFeeNumber) ||
            consultationFeeNumber <= 0

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid consultation fee."

            });

        }


        // ===================================================
        // CHECK EXISTING EMAIL
        // ===================================================

        const normalizedEmail =
            email
                .toLowerCase()
                .trim();


        const existingDoctor =
            await Doctor.findOne({

                Email:
                    normalizedEmail

            });


        if (existingDoctor) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor email is already registered."

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
        // CREATE IMAGE PATH
        // ===================================================

        const doctorImage = req.file.path;


        // ===================================================
        // CREATE DOCTOR
        // ===================================================

        const newDoctor =
            new Doctor({

                FullName:
                    fullName.trim(),

                Email:
                    normalizedEmail,

                Password:
                    hashedPassword,

                "Mobile No":
                    mobileNo.trim(),

                // =============================================
                // GENDER
                // =============================================

                gender:
                    genderValue,

                Specialization:
                    specialization.trim(),

                Qualification:
                    qualification.trim(),

                Experience:
                    experienceNumber,

                ConsultationFee:
                    consultationFeeNumber,

                WorkingDays:
                    parsedWorkingDays,

                DoctorImage:
                    doctorImage,

                // =============================================
                // ABOUT DOCTOR
                // =============================================

                AboutDoctor:
                    aboutDoctor
                        ? String(aboutDoctor).trim()
                        : "",

                // =============================================
                // AVAILABILITY
                // =============================================
                //
                // New doctors are Available by default.
                //
                // =============================================

                Availability:
                    "Available"

            });


        // ===================================================
        // SAVE DOCTOR
        // ===================================================

        const savedDoctor =
            await newDoctor.save();


        console.log(
            "Doctor added successfully:",
            savedDoctor._id
        );


        // ===================================================
        // SEND RESPONSE
        // ===================================================

        return res.status(201).json({

            success: true,

            message:
                "Doctor added successfully.",

            doctor:
                formatDoctor(savedDoctor)

        });

    }

    catch (error) {

        console.error(
            "Add doctor error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while adding doctor."

        });

    }

};



// =======================================================
// GET ALL DOCTORS
// =======================================================

const getAllDoctors = async (req, res) => {

    try {

        console.log(
            "Get all doctors request received"
        );


        const doctors =
            await Doctor.find()

                .select("-Password")

                .sort({

                    createdAt: -1

                });


        const formattedDoctors =
            doctors.map(
                doctor =>
                    formatDoctor(doctor)
            );


        return res.status(200).json({

            success: true,

            count:
                formattedDoctors.length,

            doctors:
                formattedDoctors

        });

    }

    catch (error) {

        console.error(
            "Get doctors error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching doctors."

        });

    }

};



// =======================================================
// GET SINGLE DOCTOR
// =======================================================

const getDoctorById = async (req, res) => {

    try {

        console.log(
            "Get doctor by ID request received"
        );


        const doctorId =
            req.params.id;


        // ===================================================
        // FIND DOCTOR
        // ===================================================

        const doctor =
            await Doctor.findById(
                doctorId
            )

                .select("-Password");


        // ===================================================
        // CHECK DOCTOR
        // ===================================================

        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        // ===================================================
        // SEND DOCTOR
        // ===================================================

        return res.status(200).json({

            success: true,

            doctor:
                formatDoctor(doctor)

        });

    }

    catch (error) {

        console.error(
            "Get doctor by ID error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching doctor."

        });

    }

};



// =======================================================
// UPDATE DOCTOR PROFILE
// =======================================================

const updateDoctorProfile = async (req, res) => {

    try {

        console.log(
            "======================================="
        );

        console.log(
            "UPDATE DOCTOR PROFILE REQUEST"
        );

        console.log(
            "Doctor ID:",
            req.params.id
        );

        console.log(
            "Received body:",
            req.body
        );

        console.log(
            "Uploaded file:",
            req.file
        );

        console.log(
            "======================================="
        );


        // ===================================================
        // GET DOCTOR ID
        // ===================================================

        const doctorId =
            req.params.id;


        if (!doctorId) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor ID is required."

            });

        }


        // ===================================================
        // FIND DOCTOR
        // ===================================================

        const doctor =
            await Doctor.findById(
                doctorId
            );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        // ===================================================
        // GET PROFILE DATA
        // ===================================================

        const {

            fullName,
            email,
            mobileNo,
            gender,
            qualification,
            specialization,
            experience,
            consultationFee,
            workingDays,
            availability,
            aboutDoctor

        } = req.body;


        // ===================================================
        // FULL NAME
        // ===================================================

        if (
            fullName !== undefined
        ) {

            const value =
                String(fullName).trim();


            if (value === "") {

                return res.status(400).json({

                    success: false,

                    message:
                        "Full name cannot be empty."

                });

            }


            if (value.length < 3) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Full name must contain at least 3 characters."

                });

            }


            doctor.FullName =
                value;

        }


        // ===================================================
        // EMAIL
        // ===================================================

        if (
            email !== undefined
        ) {

            const newEmail =
                String(email)
                    .toLowerCase()
                    .trim();


            if (newEmail === "") {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email cannot be empty."

                });

            }


            if (
                newEmail !== doctor.Email
            ) {

                const existingDoctor =
                    await Doctor.findOne({

                        Email:
                            newEmail,

                        _id: {

                            $ne:
                                doctorId

                        }

                    });


                if (existingDoctor) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Doctor email is already registered."

                    });

                }

            }


            doctor.Email =
                newEmail;

        }


        // ===================================================
        // MOBILE NUMBER
        // ===================================================

        if (
            mobileNo !== undefined
        ) {

            const value =
                String(mobileNo).trim();


            if (value === "") {

                return res.status(400).json({

                    success: false,

                    message:
                        "Mobile number cannot be empty."

                });

            }


            if (
                !/^[6-9][0-9]{9}$/.test(value)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid 10-digit mobile number."

                });

            }


            doctor["Mobile No"] =
                value;

        }


        // ===================================================
        // GENDER
        // ===================================================

        if (
            gender !== undefined
        ) {

            const genderValue =
                String(gender).trim();


            const validGenders = [

                "Male",

                "Female",

                "Other"

            ];


            if (
                !validGenders.includes(
                    genderValue
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select a valid gender."

                });

            }


            doctor.gender =
                genderValue;

        }


        // ===================================================
        // QUALIFICATION
        // ===================================================

        if (
            qualification !== undefined
        ) {

            const value =
                String(qualification).trim();


            if (value === "") {

                return res.status(400).json({

                    success: false,

                    message:
                        "Qualification cannot be empty."

                });

            }


            doctor.Qualification =
                value;

        }


        // ===================================================
        // SPECIALIZATION
        // =======================================================

        if (
            specialization !== undefined
        ) {

            const value =
                String(specialization).trim();


            if (value === "") {

                return res.status(400).json({

                    success: false,

                    message:
                        "Specialization cannot be empty."

                });

            }


            doctor.Specialization =
                value;

        }


        // ===================================================
        // EXPERIENCE
        // ===================================================

        if (
            experience !== undefined
        ) {

            const experienceNumber =
                Number(experience);


            if (

                Number.isNaN(experienceNumber) ||
                experienceNumber < 0 ||
                experienceNumber > 80

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter experience between 0 and 80 years."

                });

            }


            doctor.Experience =
                experienceNumber;

        }


        // ===================================================
        // CONSULTATION FEE
        // ===================================================

        if (
            consultationFee !== undefined
        ) {

            const consultationFeeNumber =
                Number(consultationFee);


            if (

                Number.isNaN(
                    consultationFeeNumber
                ) ||

                consultationFeeNumber <= 0

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid consultation fee."

                });

            }


            doctor.ConsultationFee =
                consultationFeeNumber;

        }


        // ===================================================
        // WORKING DAYS
        // ===================================================

        if (
            workingDays !== undefined
        ) {

            let parsedWorkingDays =
                workingDays;


            // ===============================================
            // CONVERT STRING INTO ARRAY
            // ===============================================

            if (
                typeof workingDays === "string"
            ) {

                try {

                    parsedWorkingDays =
                        JSON.parse(workingDays);

                }

                catch (error) {

                    parsedWorkingDays =
                        workingDays
                            .split(",")
                            .map(
                                day => day.trim()
                            )
                            .filter(
                                day => day !== ""
                            );

                }

            }


            // ===============================================
            // VALIDATE WORKING DAYS
            // ===============================================

            if (
                !Array.isArray(parsedWorkingDays) ||
                parsedWorkingDays.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select at least one working day."

                });

            }


            // ===============================================
            // VALID DAYS
            // ===============================================

            const validWorkingDays = [

                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"

            ];


            // ===============================================
            // CLEAN WORKING DAYS
            // ===============================================

            parsedWorkingDays =
                parsedWorkingDays
                    .map(
                        day =>
                            String(day).trim()
                    )
                    .filter(
                        day =>
                            day !== ""
                    );


            // ===============================================
            // CHECK VALID DAY NAMES
            // ===============================================

            const invalidWorkingDay =
                parsedWorkingDays.find(
                    day =>
                        !validWorkingDays.includes(day)
                );


            if (
                invalidWorkingDay
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select valid working days."

                });

            }


            // ===============================================
            // REMOVE DUPLICATE DAYS
            // ===============================================

            parsedWorkingDays =
                [...new Set(parsedWorkingDays)];


            // ===============================================
            // CHECK AFTER CLEANING
            // ===============================================

            if (
                parsedWorkingDays.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select at least one working day."

                });

            }


            // ===============================================
            // SAVE WORKING DAYS IN MONGODB
            // ===============================================

            doctor.WorkingDays =
                parsedWorkingDays;

        }


        // ===================================================
        // AVAILABILITY
        // ===================================================
        //
        // IMPORTANT:
        // Accept both the database values and common HTML
        // select values.
        //
        // Available
        // available
        //
        // Not Available
        // not-available
        // not available
        //
        // Everything is converted to the exact values used
        // by the Doctor schema.
        //
        // ===================================================

        if (
            availability !== undefined
        ) {

            const rawAvailability =
                String(availability)
                    .trim();


            const normalizedAvailability =
                rawAvailability
                    .toLowerCase()
                    .replace(/_/g, " ")
                    .replace(/-/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();


            let availabilityValue;


            // =================================================
            // AVAILABLE
            // =================================================

            if (
                normalizedAvailability === "available"
            ) {

                availabilityValue =
                    "Available";

            }


            // =================================================
            // NOT AVAILABLE
            // =================================================

            else if (
                normalizedAvailability === "not available"
            ) {

                availabilityValue =
                    "Not Available";

            }


            // =================================================
            // INVALID AVAILABILITY
            // =================================================

            else {

                console.log(
                    "Invalid availability received:",
                    availability
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "Please select a valid availability status."

                });

            }


            // =================================================
            // SAVE AVAILABILITY IN MONGODB
            // =================================================

            doctor.Availability =
                availabilityValue;


            console.log(
                "Availability updated to:",
                doctor.Availability
            );

        }


        // ===================================================
        // ABOUT DOCTOR
        // ===================================================

        if (
            aboutDoctor !== undefined
        ) {

            const value =
                String(aboutDoctor).trim();


            if (value === "") {

                return res.status(400).json({

                    success: false,

                    message:
                        "About Doctor cannot be empty."

                });

            }


            if (value.length < 20) {

                return res.status(400).json({

                    success: false,

                    message:
                        "About Doctor should contain at least 20 characters."

                });

            }


            // ===============================================
            // SAVE IN MONGODB FIELD
            // ===============================================

            doctor.AboutDoctor =
                value;

        }


        // ===================================================
        // PROFILE IMAGE
        // ===================================================

        if (req.file) {
            
            doctor.DoctorImage = req.file.path;

        }


        // ===================================================
        // SAVE UPDATED DOCTOR
        // ===================================================

        const updatedDoctor =
            await doctor.save();


        console.log(
            "Doctor profile updated successfully:",
            updatedDoctor._id
        );

        console.log(
            "Saved availability:",
            updatedDoctor.Availability
        );


        // ===================================================
        // SEND UPDATED DOCTOR
        // ===================================================

        return res.status(200).json({

            success: true,

            message:
                "Doctor profile updated successfully.",

            doctor:
                formatDoctor(updatedDoctor)

        });

    }

    catch (error) {

        console.error(
            "Update doctor profile error:",
            error
        );


        if (
            error.name ===
            "ValidationError"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please check the doctor profile information."

            });

        }


        if (
            error.code ===
            11000
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor email is already registered."

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Server error while updating doctor profile."

        });

    }

};



// =======================================================
// UPDATE DOCTOR WORKING HOURS
// =======================================================

const updateDoctorWorkingHours = async (req, res) => {

    try {

        console.log(
            "Update doctor working hours request received"
        );


        const doctorId =
            req.params.id;


        const {

            workingHours

        } = req.body;


        // ===================================================
        // CHECK WORKING HOURS
        // ===================================================

        if (

            !workingHours ||

            typeof workingHours !== "object" ||

            Array.isArray(workingHours)

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide valid working hours."

            });

        }


        // ===================================================
        // FIND DOCTOR
        // ===================================================

        const doctor =
            await Doctor.findById(
                doctorId
            );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        // ===================================================
        // VALID DAYS
        // ===================================================

        const allDays = [

            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"

        ];


        // ===================================================
        // CREATE CLEAN WORKING HOURS
        // ===================================================

        const updatedWorkingHours = {};


        allDays.forEach(day => {

            updatedWorkingHours[day] = {

                startTime:
                    null,

                endTime:
                    null

            };

        });


        // ===================================================
        // VALIDATE WORKING DAYS
        // ===================================================

        for (
            const day of doctor.WorkingDays
        ) {

            const dayHours =
                workingHours[day];


            if (!dayHours) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Please provide working hours for ${day}.`

                });

            }


            const startTime =
                String(
                    dayHours.startTime || ""
                ).trim();


            const endTime =
                String(
                    dayHours.endTime || ""
                ).trim();


            if (
                !startTime ||
                !endTime
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Please provide both start and end time for ${day}.`

                });

            }


            if (
                startTime >= endTime
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `End time must be after start time for ${day}.`

                });

            }


            updatedWorkingHours[day] = {

                startTime:
                    startTime,

                endTime:
                    endTime

            };

        }


        // ===================================================
        // UPDATE WORKING HOURS
        // ===================================================

        doctor.WorkingHours =
            updatedWorkingHours;


        await doctor.save();


        console.log(
            "Doctor working hours updated:",
            doctor._id
        );


        return res.status(200).json({

            success: true,

            message:
                "Working hours updated successfully.",

            workingHours:
                doctor.WorkingHours

        });

    }

    catch (error) {

        console.error(
            "Update working hours error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while updating working hours."

        });

    }

};



// =======================================================
// DOCTOR LOGIN
// =======================================================

const loginDoctor = async (req, res) => {

    try {

        console.log(
            "Doctor login request received"
        );


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

                success: false,

                message:
                    "Please enter your email and password."

            });

        }


        // ===================================================
        // FIND DOCTOR
        // ===================================================

        const doctor =
            await Doctor.findOne({

                Email:
                    email
                        .toLowerCase()
                        .trim()

            });


        // ===================================================
        // EMAIL NOT FOUND
        // ===================================================

        if (!doctor) {

            return res.status(401).json({

                success: false,

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

                doctor.Password

            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

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

            success: true,

            message:
                "Doctor login successful.",

            doctor:
                formatDoctor(doctor)

        });

    }

    catch (error) {

        console.error(
            "Doctor login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during doctor login."

        });

    }

};



// =======================================================
// CHANGE DOCTOR PASSWORD
// =======================================================

const changeDoctorPassword = async (req, res) => {

    try {

        console.log(
            "Doctor change password request received"
        );


        const doctorId =
            req.params.id;


        const {

            currentPassword,
            newPassword

        } = req.body;


        // ===================================================
        // CHECK REQUIRED FIELDS
        // ===================================================

        if (
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter current and new password."

            });

        }


        // ===================================================
        // CHECK NEW PASSWORD LENGTH
        // ===================================================

        if (
            newPassword.length < 6
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must contain at least 6 characters."

            });

        }


        // ===================================================
        // CHECK SAME PASSWORD
        // ===================================================

        if (
            currentPassword === newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must be different from your current password."

            });

        }


        // ===================================================
        // FIND DOCTOR
        // ===================================================

        const doctor =
            await Doctor.findById(
                doctorId
            );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        // ===================================================
        // CHECK CURRENT PASSWORD
        // ===================================================

        const passwordMatch =
            await bcrypt.compare(

                currentPassword,

                doctor.Password

            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Current password is incorrect."

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

        doctor.Password =
            hashedPassword;


        await doctor.save();


        // ===================================================
        // SUCCESS
        // ===================================================

        return res.status(200).json({

            success: true,

            message:
                "Password changed successfully."

        });

    }

    catch (error) {

        console.error(
            "Doctor change password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while changing password."

        });

    }

};



// =======================================================
// DELETE DOCTOR
// =======================================================
// IMPORTANT:
//
// This deletes ONLY the doctor document.
//
// Existing appointments and prescriptions are NOT deleted.
// They remain in MongoDB for historical/future records.
//
// Existing LEAVE records are also NOT deleted.
//
// Before deleting the doctor, the doctor's name is permanently
// stored inside every related Leave record.
//
// This means that even after the doctor is deleted,
// the Leave page can still display the doctor's name.
//
// =======================================================

const deleteDoctor = async (req, res) => {

    try {

        console.log(
            "Delete doctor request received"
        );


        // ===================================================
        // GET DOCTOR ID
        // ===================================================

        const doctorId =
            req.params.id;


        if (!doctorId) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor ID is required."

            });

        }


        // ===================================================
        // FIND DOCTOR
        // ===================================================

        const doctor =
            await Doctor.findById(
                doctorId
            );


        // ===================================================
        // CHECK DOCTOR
        // ===================================================

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
        // We save the doctor's current name into the Leave
        // records BEFORE deleting the Doctor document.
        //
        // Example:
        //
        // Doctor:
        //     Dr. Priya
        //
        // Leave:
        //     DoctorID: 123456
        //     DoctorName: Dr. Priya
        //
        // After Doctor is deleted:
        //
        // Leave:
        //     DoctorID: null after populate
        //     DoctorName: Dr. Priya
        //
        // Therefore the Leave page can still display:
        //     Dr. Priya
        //
        // ===================================================

        const doctorName =
            typeof doctor.FullName === "string"
                ? doctor.FullName.trim()
                : "";


        // ===================================================
        // PRESERVE DOCTOR NAME IN LEAVE RECORDS
        // ===================================================
        //
        // IMPORTANT:
        //
        // Do NOT delete the Leave records.
        //
        // Only permanently save the doctor's name in
        // DoctorName before the doctor document is deleted.
        //
        // This protects old leave history even after the
        // doctor is removed from the clinic.
        //
        // ===================================================

        if (doctorName !== "") {

            const leaveUpdateResult =
                await Leave.updateMany(

                    {
                        DoctorID:
                            doctorId
                    },

                    {
                        $set: {
                            DoctorName:
                                doctorName
                        }

                    }

                );


            console.log(
                "Leave records updated before doctor deletion:",
                leaveUpdateResult.modifiedCount
            );

        }


        // ===================================================
        // DELETE DOCTOR
        // ===================================================

        const deletedDoctor =
            await Doctor.findByIdAndDelete(
                doctorId
            );


        // ===================================================
        // CHECK DELETE RESULT
        // ===================================================

        if (!deletedDoctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        // ===================================================
        // SUCCESS LOG
        // ===================================================

        console.log(
            "Doctor deleted successfully:",
            deletedDoctor._id
        );

        console.log(
            "Preserved doctor name in leave records:",
            doctorName
        );


        // ===================================================
        // SUCCESS RESPONSE
        // ===================================================

        return res.status(200).json({

            success: true,

            message:
                "Doctor deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "Delete doctor error:",
            error
        );


        // ===================================================
        // INVALID MONGODB OBJECT ID
        // ===================================================

        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid doctor ID."

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Server error while deleting doctor."

        });

    }

};



// =======================================================
// EXPORT CONTROLLERS
// =======================================================

module.exports = {

    addDoctor,

    getAllDoctors,

    getDoctorById,

    updateDoctorProfile,

    updateDoctorWorkingHours,

    loginDoctor,

    changeDoctorPassword,

    deleteDoctor

};