
/* =======================================================
   DERMCARE - PRESCRIPTION CONTROLLER
   FILE: controllers/prescriptionController.js

   Uses the existing Prescription, Appointment,
   Patient and Doctor models.
======================================================= */

const mongoose = require("mongoose");

const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");


/* =======================================================
   CREATE PRESCRIPTION
   POST /api/prescriptions
======================================================= */

const createPrescription = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            appointmentId,
            diagnosis,
            clinicalNotes,
            advice,
            instructions,
            followUpDate,
            medicines
        } = req.body;

        // Validate required IDs.
        if (!patientId || !doctorId || !appointmentId) {
            return res.status(400).json({
                success: false,
                message: "Patient, doctor and appointment are required."
            });
        }

        // Validate MongoDB ObjectIds.
        const ids = [patientId, doctorId, appointmentId];

        if (!ids.every(id => mongoose.isValidObjectId(id))) {
            return res.status(400).json({
                success: false,
                message: "One or more supplied IDs are invalid."
            });
        }

        // Check the existing patient.
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        // Check the existing doctor.
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        // Confirm the appointment belongs to this patient and doctor.
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            PatientID: patientId,
            DoctorID: doctorId
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "The appointment does not match this patient and doctor."
            });
        }

        // Require at least one complete medicine.
        if (!Array.isArray(medicines) || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please add at least one medicine."
            });
        }

        const validMedicines = medicines.every(medicine =>
            medicine &&
            typeof medicine.medicineName === "string" &&
            medicine.medicineName.trim() &&
            typeof medicine.dosage === "string" &&
            medicine.dosage.trim() &&
            typeof medicine.frequency === "string" &&
            medicine.frequency.trim() &&
            typeof medicine.duration === "string" &&
            medicine.duration.trim()
        );

        if (!validMedicines) {
            return res.status(400).json({
                success: false,
                message: "Every medicine must include its name, dosage, frequency and duration."
            });
        }

        // Preserve the existing model's string fields.
        const medicineText = JSON.stringify(medicines);

        const instructionText = [
            diagnosis ? `Diagnosis: ${diagnosis.trim()}` : "",
            clinicalNotes ? `Clinical Notes: ${clinicalNotes.trim()}` : "",
            instructions ? `Instructions: ${instructions.trim()}` : "",
            advice ? `Advice: ${advice.trim()}` : "",
            ...medicines.map(medicine => {
                const details = medicine.instructions?.trim();

                return details
                    ? `${medicine.medicineName.trim()}: ${details}`
                    : "";
            })
        ].filter(Boolean).join("\n");

        if (!instructionText.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide prescription instructions or clinical details."
            });
        }

        // Validate the optional follow-up date.
        let parsedFollowUpDate;

        if (followUpDate) {
            parsedFollowUpDate = new Date(followUpDate);

            if (Number.isNaN(parsedFollowUpDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Follow-up date is invalid."
                });
            }
        }

        // Save using the existing Prescription schema.
        const prescription = new Prescription({
            PatientID: patient._id,
            DoctorID: doctor._id,
            AppointmentID: appointment._id,
            Medicines: medicineText,
            Instructions: instructionText,
            ...(parsedFollowUpDate && {
                FollowUpDate: parsedFollowUpDate
            })
        });

        const savedPrescription = await prescription.save();

        return res.status(201).json({
            success: true,
            message: "Prescription saved successfully.",
            prescription: {
                id: savedPrescription._id,
                PatientID: savedPrescription.PatientID,
                DoctorID: savedPrescription.DoctorID,
                AppointmentID: savedPrescription.AppointmentID,
                Medicines: savedPrescription.Medicines,
                Instructions: savedPrescription.Instructions,
                FollowUpDate: savedPrescription.FollowUpDate,
                createdAt: savedPrescription.createdAt
            }
        });

    } catch (error) {
        console.error("Create prescription error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while saving prescription."
        });
    }
};


/* =======================================================
   GET PRESCRIPTIONS FOR AN APPOINTMENT
   GET /api/prescriptions/appointment/:appointmentId
======================================================= */

const getPrescriptionsByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        if (!mongoose.isValidObjectId(appointmentId)) {
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

        const prescriptions = await Prescription.find({
            AppointmentID: appointmentId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            prescriptions
        });

    } catch (error) {
        console.error("Get appointment prescriptions error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching prescriptions."
        });
    }
};


/* =======================================================
   GET PRESCRIPTIONS BY DOCTOR
   GET /api/prescriptions/doctor/:doctorId

   Used by the Doctor History page.
======================================================= */

const getDoctorPrescriptions = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Validate doctor ID.
        if (!mongoose.isValidObjectId(doctorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid doctor ID."
            });
        }

        // Check that the doctor exists.
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        // Fetch only this doctor's saved prescriptions.
        const prescriptions = await Prescription.find({
            DoctorID: doctorId
        })
            .populate({
                path: "PatientID",
                select: {
                    FullName: 1,
                    Email: 1,
                    "Mobile No": 1
                }
            })
            .populate({
                path: "AppointmentID",
                select: "AppointmentDate AppointmentTime AppointmentType Status"
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            prescriptions
        });

    } catch (error) {
        console.error("Get doctor prescriptions error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching doctor prescriptions."
        });
    }
};


/* =======================================================
   GET PRESCRIPTIONS FOR A PATIENT
   GET /api/prescriptions/patient/:patientId

   Used by the Patient Prescriptions page.
======================================================= */

const getPatientPrescriptions = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Validate patient ID.
        if (!mongoose.isValidObjectId(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID."
            });
        }

        // Check that the patient exists.
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        // Fetch only prescriptions belonging to this patient.
        const prescriptions = await Prescription.find({
            PatientID: patientId
        })
            .populate({
                path: "DoctorID",
                select: "FullName Specialization Qualification"
            })
            .populate({
                path: "AppointmentID",
                select: "AppointmentDate AppointmentTime AppointmentType Status"
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            patient: {
                _id: patient._id,
                FullName: patient.FullName
            },
            prescriptions
        });

    } catch (error) {
        console.error("Get patient prescriptions error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching patient prescriptions."
        });
    }
};


/* =======================================================
   EXPORT CONTROLLERS
======================================================= */

module.exports = {
    createPrescription,
    getPrescriptionsByAppointment,
    getDoctorPrescriptions,
    getPatientPrescriptions
};
