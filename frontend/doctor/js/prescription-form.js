/* =======================================================
   DERMCARE - DOCTOR PRESCRIPTION FORM JAVASCRIPT

   Features:
   - Mobile sidebar
   - Selected appointment and patient details
   - Improved patient mobile number loading
   - Dynamic medicine fields with instructions
   - Patient profile loading
   - Save prescription to MongoDB
   - Print saved prescription including medicine instructions
   - Left-aligned follow-up date in print
   - Toast notifications
   - Cancel, Back and Logout
======================================================= */

if (window.dermCarePrescriptionFormInitialized) {
    console.warn("DermCare Prescription Form JavaScript is already initialized.");
} else {
    window.dermCarePrescriptionFormInitialized = true;

    document.addEventListener("DOMContentLoaded", function () {

        /* =======================================================
           CONFIGURATION
        ======================================================= */

        const API_BASE_URL = "https://dermacare-eeca.onrender.com/api";

        /* =======================================================
           ELEMENTS
        ======================================================= */

        const form = document.getElementById("prescriptionForm");

        const patientNameInput = document.getElementById("patientName");
        const patientEmailInput = document.getElementById("patientEmail");
        const patientMobileInput = document.getElementById("patientMobile");

        const appointmentDateInput = document.getElementById("appointmentDate");
        const appointmentTimeInput = document.getElementById("appointmentTime");

        const diagnosisInput = document.getElementById("diagnosis");
        const clinicalNotesInput = document.getElementById("clinicalNotes");
        const adviceInput = document.getElementById("advice");
        const followUpDateInput = document.getElementById("followUpDate");

        const medicinesContainer = document.getElementById("medicinesContainer");
        const addMedicineBtn = document.getElementById("addMedicineBtn");

        const cancelBtn = document.getElementById("cancelBtn");
        const savePrescriptionBtn = document.getElementById("savePrescriptionBtn");
        const printPrescriptionBtn = document.getElementById("printPrescriptionBtn");

        const messageBox = document.getElementById("messageBox");

        const backBtn = document.getElementById("backBtn");
        const logoutLink = document.getElementById("logoutLink");

        /* =======================================================
           STATE
        ======================================================= */

        let medicineCounter = 0;
        let savedPrescriptionForPrint = null;
        let isSavingPrescription = false;
        let toastTimeout = null;

        /* =======================================================
           GENERAL HELPERS
        ======================================================= */

        function getStoredJSON(key) {
            const storageTypes = [sessionStorage, localStorage];

            for (const storage of storageTypes) {
                try {
                    const value = storage.getItem(key);

                    if (value) {
                        return JSON.parse(value);
                    }
                } catch (error) {
                    console.warn("Unable to read stored data:", key, error);
                }
            }

            return null;
        }

        function getStoredValue(key) {
            try {
                return sessionStorage.getItem(key) ||
                    localStorage.getItem(key) ||
                    "";
            } catch (error) {
                return "";
            }
        }

        function getId(value) {
            if (!value) {
                return "";
            }

            if (typeof value === "string" || typeof value === "number") {
                return String(value).trim();
            }

            if (typeof value === "object") {
                return (
                    value._id ||
                    value.id ||
                    value.PatientID ||
                    value.DoctorID ||
                    value.AppointmentID ||
                    value.patientId ||
                    value.doctorId ||
                    value.appointmentId ||
                    ""
                ).toString();
            }

            return "";
        }

        function firstAvailable(...values) {
            for (const value of values) {
                if (
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ""
                ) {
                    return value;
                }
            }

            return "";
        }

        function getInputValue(element) {
            return element ? element.value.trim() : "";
        }

        function setInputValue(element, value) {
            if (element && value !== undefined && value !== null) {
                element.value = String(value);
            }
        }

        /*
         * Handles common mobile-number field names.
         * The correct field name must also exist in the API response.
         */
        function getPatientMobile(patient, appointment = {}) {
            return firstAvailable(
                appointment.PatientMobile,
                appointment.patientMobile,
                appointment.PatientMobileNo,
                appointment.patientMobileNo,
                appointment.PatientMobileNumber,
                appointment.patientMobileNumber,
                appointment.MobileNo,
                appointment.MobileNumber,
                appointment.Mobile,
                appointment.mobile,
                appointment.Phone,
                appointment.phone,
                appointment.PhoneNumber,
                appointment.phoneNumber,
                appointment.ContactNumber,
                appointment.contactNumber,
                appointment.Contact,
                appointment.contact,
                patient.MobileNo,
                patient.MobileNumber,
                patient.Mobile,
                patient.mobile,
                patient.mobileNo,
                patient.mobileNumber,
                patient.Phone,
                patient.phone,
                patient.PhoneNumber,
                patient.phoneNumber,
                patient.ContactNumber,
                patient.contactNumber,
                patient.Contact,
                patient.contact
            );
        }

        function formatDate(value) {
            if (!value) {
                return "Not specified";
            }

            const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));

            if (dateOnly) {
                const date = new Date(
                    Number(dateOnly[1]),
                    Number(dateOnly[2]) - 1,
                    Number(dateOnly[3])
                );

                return date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });
            }

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return String(value);
            }

            return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        }

        function escapeHTML(value) {
            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        /* =======================================================
           TOAST NOTIFICATIONS
        ======================================================= */

        function hideMessage() {
            if (toastTimeout) {
                clearTimeout(toastTimeout);
                toastTimeout = null;
            }

            if (messageBox) {
                messageBox.classList.remove("toast-visible");
                messageBox.style.display = "none";
            }
        }

        function showMessage(message, type = "success") {
            if (!messageBox) {
                alert(message);
                return;
            }

            hideMessage();

            messageBox.className = "";
            messageBox.innerHTML = "";

            const icon = document.createElement("i");
            icon.className = type === "success"
                ? "bi bi-check-circle-fill"
                : "bi bi-exclamation-circle-fill";

            const text = document.createElement("span");
            text.textContent = message;

            const closeButton = document.createElement("button");
            closeButton.type = "button";
            closeButton.className = "toast-close";
            closeButton.setAttribute("aria-label", "Close notification");
            closeButton.textContent = "×";
            closeButton.addEventListener("click", hideMessage);

            const progress = document.createElement("div");
            progress.className = "toast-progress";

            messageBox.appendChild(icon);
            messageBox.appendChild(text);
            messageBox.appendChild(closeButton);
            messageBox.appendChild(progress);

            messageBox.dataset.type = type;
            messageBox.style.display = "flex";
            messageBox.classList.add("toast-visible");

            toastTimeout = setTimeout(hideMessage, 4000);
        }

        /* =======================================================
           MOBILE SIDEBAR
        ======================================================= */

        function initializeMobileSidebar() {
            const sidebar = document.querySelector(".sidebar");

            const mobileToggle =
                document.getElementById("menuToggle") ||
                document.querySelector("#mobileMenuToggle, .mobile-menu-toggle");

            const overlay = document.getElementById("overlay");

            if (!sidebar || !mobileToggle) {
                return;
            }

            function openSidebar() {
                sidebar.classList.add("active");

                if (overlay) {
                    overlay.classList.add("active");
                }

                mobileToggle.setAttribute("aria-expanded", "true");
            }

            function closeSidebar() {
                sidebar.classList.remove("active");

                if (overlay) {
                    overlay.classList.remove("active");
                }

                if (mobileToggle.type === "checkbox") {
                    mobileToggle.checked = false;
                }

                mobileToggle.setAttribute("aria-expanded", "false");
            }

            if (mobileToggle.type === "checkbox") {
                mobileToggle.addEventListener("change", function () {
                    if (mobileToggle.checked) {
                        openSidebar();
                    } else {
                        closeSidebar();
                    }
                });
            } else {
                mobileToggle.addEventListener("click", function () {
                    if (sidebar.classList.contains("active")) {
                        closeSidebar();
                    } else {
                        openSidebar();
                    }
                });
            }

            if (overlay) {
                overlay.addEventListener("click", closeSidebar);
            }

            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape") {
                    closeSidebar();
                }
            });

            document.addEventListener("click", function (event) {
                if (window.innerWidth > 768) {
                    return;
                }

                const target = event.target;

                if (!target || typeof target.closest !== "function") {
                    return;
                }

                const clickedToggle = target.closest(
                    "#menuToggle, label[for='mobileMenuToggle'], .mobile-menu-button"
                );

                if (
                    sidebar.classList.contains("active") &&
                    !sidebar.contains(target) &&
                    !clickedToggle
                ) {
                    closeSidebar();
                }
            });
        }

        initializeMobileSidebar();

        /* =======================================================
           APPOINTMENT AND DOCTOR CONTEXT
        ======================================================= */

        function getAppointmentContext() {
            const appointment =
                getStoredJSON("selectedDoctorAppointment") ||
                getStoredJSON("selectedAppointment") ||
                getStoredJSON("doctorSelectedAppointment") ||
                {};

            const doctor =
                getStoredJSON("loggedInDoctor") ||
                getStoredJSON("doctorData") ||
                getStoredJSON("doctor") ||
                getStoredJSON("currentDoctor") ||
                {};

            const params = new URLSearchParams(window.location.search);

            const patientObject =
                appointment.patientDetails ||
                appointment.patientInfo ||
                appointment.patientData ||
                (typeof appointment.patient === "object"
                    ? appointment.patient
                    : {});

            const patientId = getId(firstAvailable(
                appointment.PatientID,
                appointment.patientId,
                appointment.patientID,
                appointment.patient,
                appointment.patientDetails,
                appointment.patientInfo,
                params.get("patientId"),
                params.get("patientID"),
                patientNameInput?.dataset.patientId
            ));

            const doctorId = getId(firstAvailable(
                appointment.DoctorID,
                appointment.doctorId,
                appointment.doctorID,
                appointment.doctor,
                doctor._id,
                doctor.id,
                doctor.DoctorID,
                getStoredValue("doctorId"),
                getStoredValue("doctorID"),
                getStoredValue("loggedInDoctorId"),
                params.get("doctorId"),
                params.get("doctorID")
            ));

            const appointmentId = getId(firstAvailable(
                appointment._id,
                appointment.id,
                appointment.AppointmentID,
                appointment.appointmentId,
                appointment.appointmentID,
                params.get("appointmentId"),
                params.get("appointmentID"),
                form?.dataset.appointmentId
            ));

            return {
                appointment,
                patientObject,
                doctor,
                patientId,
                doctorId,
                appointmentId
            };
        }

        let appointmentContext = getAppointmentContext();

        /* =======================================================
           LOAD APPOINTMENT AND PATIENT DETAILS
        ======================================================= */

        function getPatientObject(appointment) {
            if (!appointment || typeof appointment !== "object") {
                return {};
            }

            const patient =
                appointment.patientDetails ||
                appointment.patientInfo ||
                appointment.patientData ||
                appointment.patient;

            return patient && typeof patient === "object"
                ? patient
                : {};
        }

        function populateAppointmentDetails() {
            const appointment = appointmentContext.appointment;
            const patient = getPatientObject(appointment);

            const patientName = firstAvailable(
                appointment.PatientName,
                appointment.patientName,
                appointment.FullName,
                appointment.fullName,
                patient.FullName,
                patient.fullName,
                patient.name,
                typeof appointment.patient === "string"
                    ? appointment.patient
                    : ""
            );

            const patientEmail = firstAvailable(
                appointment.PatientEmail,
                appointment.patientEmail,
                appointment.Email,
                appointment.email,
                patient.Email,
                patient.email
            );

            const patientMobile = getPatientMobile(patient, appointment);

            const appointmentDate = firstAvailable(
                appointment.AppointmentDate,
                appointment.appointmentDate,
                appointment.Date,
                appointment.date
            );

            const appointmentTime = firstAvailable(
                appointment.AppointmentTime,
                appointment.appointmentTime,
                appointment.Time,
                appointment.time,
                appointment.SlotTime,
                appointment.slotTime
            );

            setInputValue(patientNameInput, patientName);
            setInputValue(patientEmailInput, patientEmail);
            setInputValue(patientMobileInput, patientMobile);

            setInputValue(
                appointmentDateInput,
                appointmentDate ? String(appointmentDate).slice(0, 10) : ""
            );

            setInputValue(appointmentTimeInput, appointmentTime);

            if (form) {
                form.dataset.patientId = appointmentContext.patientId;
                form.dataset.doctorId = appointmentContext.doctorId;
                form.dataset.appointmentId = appointmentContext.appointmentId;
            }
        }

        async function loadPatientProfile() {
            populateAppointmentDetails();

            const patientId = appointmentContext.patientId;

            if (!patientId) {
                console.warn(
                    "Patient ID was not found in the selected appointment context."
                );
                return;
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/patients/profile/${encodeURIComponent(patientId)}`
                );

                const result = await response.json().catch(() => ({}));

                if (!response.ok) {
                    console.warn(
                        "Could not load patient profile:",
                        result.message || response.statusText
                    );
                    return;
                }

                const patient =
                    result.patient ||
                    result.data ||
                    result.profile ||
                    result;

                if (!patient || typeof patient !== "object") {
                    return;
                }

                if (patientNameInput && !getInputValue(patientNameInput)) {
                    setInputValue(
                        patientNameInput,
                        firstAvailable(
                            patient.FullName,
                            patient.fullName,
                            patient.name
                        )
                    );
                }

                if (patientEmailInput && !getInputValue(patientEmailInput)) {
                    setInputValue(
                        patientEmailInput,
                        firstAvailable(patient.Email, patient.email)
                    );
                }

                /*
                 * Fill the mobile field if it was not available
                 * in the selected appointment data.
                 */
                if (patientMobileInput && !getInputValue(patientMobileInput)) {
                    setInputValue(
                        patientMobileInput,
                        getPatientMobile(patient)
                    );
                }

                /*
                 * Keep the returned patient data available for
                 * other supported field-name variations.
                 */
                appointmentContext.patientObject = patient;

            } catch (error) {
                console.error("Patient profile loading error:", error);
            }
        }

        populateAppointmentDetails();
        loadPatientProfile();

        /* =======================================================
           PRINT STATE
        ======================================================= */

        function invalidateSavedPrescription() {
            savedPrescriptionForPrint = null;

            if (printPrescriptionBtn) {
                printPrescriptionBtn.disabled = true;
                printPrescriptionBtn.title =
                    "Save the prescription before printing.";
            }
        }

        if (printPrescriptionBtn) {
            printPrescriptionBtn.disabled = true;
            printPrescriptionBtn.title =
                "Save the prescription before printing.";
        }

        if (form) {
            form.addEventListener("input", function (event) {
                if (
                    event.target &&
                    event.target.id !== "savePrescriptionBtn" &&
                    event.target.id !== "printPrescriptionBtn"
                ) {
                    invalidateSavedPrescription();
                }
            });

            form.addEventListener("change", function () {
                invalidateSavedPrescription();
            });
        }

        /* =======================================================
           MEDICINE CARD CREATION
        ======================================================= */

        function createMedicineCard() {
            if (!medicinesContainer) {
                showMessage("Medicine section was not found.", "error");
                return;
            }

            medicineCounter++;

            const card = document.createElement("div");
            card.className = "medicine-card";
            card.dataset.medicineCard = String(medicineCounter);

            card.innerHTML = `
                <div class="medicine-card-header">
                    <h3>
                        <i class="bi bi-capsule"></i>
                        Medicine ${medicineCounter}
                    </h3>

                    <button
                        type="button"
                        class="remove-medicine-btn"
                        aria-label="Remove medicine ${medicineCounter}"
                        title="Remove medicine"
                    >
                        <i class="bi bi-trash"></i>
                        Remove
                    </button>
                </div>

                <div class="medicine-fields">
                    <div class="form-group">
                        <label for="medicineName${medicineCounter}">
                            Medicine Name <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="medicineName${medicineCounter}"
                            class="medicine-name"
                            placeholder="Enter medicine name"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="dosage${medicineCounter}">
                            Dosage <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="dosage${medicineCounter}"
                            class="medicine-dosage"
                            placeholder="e.g. 10 mg"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="frequency${medicineCounter}">
                            Frequency <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="frequency${medicineCounter}"
                            class="medicine-frequency"
                            placeholder="e.g. Once daily"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="duration${medicineCounter}">
                            Duration <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="duration${medicineCounter}"
                            class="medicine-duration"
                            placeholder="e.g. 7 days"
                            required
                        >
                    </div>

                    <div class="form-group medicine-instructions-group">
                        <label for="medicineInstructions${medicineCounter}">
                            Medicine Instructions
                        </label>

                        <textarea
                            id="medicineInstructions${medicineCounter}"
                            class="medicine-instructions"
                            rows="3"
                            placeholder="e.g. Apply a thin layer at night, or take after meals"
                        ></textarea>
                    </div>
                </div>
            `;

            medicinesContainer.appendChild(card);

            const removeButton = card.querySelector(".remove-medicine-btn");

            removeButton.addEventListener("click", function () {
                card.remove();
                invalidateSavedPrescription();
                renumberMedicineCards();
            });
        }

        function renumberMedicineCards() {
            if (!medicinesContainer) {
                return;
            }

            const cards = medicinesContainer.querySelectorAll(".medicine-card");

            cards.forEach(function (card, index) {
                const heading = card.querySelector(".medicine-card-header h3");

                if (heading) {
                    heading.innerHTML = `
                        <i class="bi bi-capsule"></i>
                        Medicine ${index + 1}
                    `;
                }
            });
        }

        function getMedicinesFromForm() {
            if (!medicinesContainer) {
                return [];
            }

            const cards = medicinesContainer.querySelectorAll(".medicine-card");

            return Array.from(cards).map(function (card) {
                return {
                    medicineName: getInputValue(
                        card.querySelector(".medicine-name")
                    ),
                    dosage: getInputValue(
                        card.querySelector(".medicine-dosage")
                    ),
                    frequency: getInputValue(
                        card.querySelector(".medicine-frequency")
                    ),
                    duration: getInputValue(
                        card.querySelector(".medicine-duration")
                    ),
                    instructions: getInputValue(
                        card.querySelector(".medicine-instructions")
                    )
                };
            });
        }

        if (addMedicineBtn) {
            addMedicineBtn.addEventListener("click", function () {
                invalidateSavedPrescription();
                createMedicineCard();
            });
        }

        if (
            medicinesContainer &&
            medicinesContainer.querySelectorAll(".medicine-card").length === 0
        ) {
            createMedicineCard();
        }

        /* =======================================================
           VALIDATION
        ======================================================= */

        function validatePrescription(medicines) {
            if (!getInputValue(patientNameInput)) {
                showMessage("Patient name is required.", "error");
                patientNameInput?.focus();
                return false;
            }

            if (!getInputValue(diagnosisInput)) {
                showMessage("Please enter the diagnosis.", "error");
                diagnosisInput?.focus();
                return false;
            }

            if (!appointmentContext.patientId) {
                showMessage(
                    "Patient ID is missing. Please open the prescription from the selected appointment.",
                    "error"
                );
                return false;
            }

            if (!appointmentContext.doctorId) {
                showMessage(
                    "Doctor ID is missing. Please log in again and reopen the appointment.",
                    "error"
                );
                return false;
            }

            if (!appointmentContext.appointmentId) {
                showMessage(
                    "Appointment ID is missing. Please open the prescription from the selected appointment.",
                    "error"
                );
                return false;
            }

            if (!medicines.length) {
                showMessage("Please add at least one medicine.", "error");
                return false;
            }

            for (let index = 0; index < medicines.length; index++) {
                const medicine = medicines[index];

                if (
                    !medicine.medicineName ||
                    !medicine.dosage ||
                    !medicine.frequency ||
                    !medicine.duration
                ) {
                    showMessage(
                        `Please complete the required fields for Medicine ${index + 1}.`,
                        "error"
                    );
                    return false;
                }
            }

            return true;
        }

        /* =======================================================
           SAVE PRESCRIPTION
        ======================================================= */

        async function savePrescription(event) {
            if (event) {
                event.preventDefault();
            }

            if (isSavingPrescription) {
                return;
            }

            const medicines = getMedicinesFromForm();

            if (!validatePrescription(medicines)) {
                return;
            }

            const payload = {
                patientId: appointmentContext.patientId,
                doctorId: appointmentContext.doctorId,
                appointmentId: appointmentContext.appointmentId,
                diagnosis: getInputValue(diagnosisInput),
                clinicalNotes: getInputValue(clinicalNotesInput),
                advice: getInputValue(adviceInput),
                instructions: getInputValue(adviceInput),
                followUpDate: getInputValue(followUpDateInput) || null,
                medicines: medicines
            };

            isSavingPrescription = true;

            if (savePrescriptionBtn) {
                savePrescriptionBtn.disabled = true;
                savePrescriptionBtn.innerHTML = `
                    <i class="bi bi-hourglass-split"></i>
                    Saving...
                `;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/prescriptions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json().catch(() => ({}));

                if (!response.ok || result.success !== true) {
                    throw new Error(
                        result.message ||
                        "Unable to save prescription. Please try again."
                    );
                }

                const savedRecord = result.prescription || result.data || {};

                savedPrescriptionForPrint = {
                    id: firstAvailable(
                        savedRecord.PrescriptionID,
                        savedRecord.PrescriptionId,
                        savedRecord.prescriptionId,
                        savedRecord.id,
                        savedRecord._id
                    ),

                    patient: {
                        name: getInputValue(patientNameInput),
                        email: getInputValue(patientEmailInput),
                        mobile: getInputValue(patientMobileInput)
                    },

                    doctor: {
                        name: firstAvailable(
                            appointmentContext.doctor.FullName,
                            appointmentContext.doctor.fullName,
                            appointmentContext.doctor.name,
                            appointmentContext.doctor.Name,
                            "DermCare Doctor"
                        )
                    },

                    appointment: {
                        date: getInputValue(appointmentDateInput),
                        time: getInputValue(appointmentTimeInput)
                    },

                    diagnosis: payload.diagnosis,
                    clinicalNotes: payload.clinicalNotes,
                    advice: payload.advice,
                    followUpDate: payload.followUpDate,

                    medicines: payload.medicines.map(function (medicine) {
                        return {
                            medicineName: medicine.medicineName,
                            dosage: medicine.dosage,
                            frequency: medicine.frequency,
                            duration: medicine.duration,
                            instructions: medicine.instructions
                        };
                    }),

                    savedAt: firstAvailable(
                        savedRecord.createdAt,
                        savedRecord.CreatedAt,
                        new Date().toISOString()
                    )
                };

                if (printPrescriptionBtn) {
                    printPrescriptionBtn.disabled = false;
                    printPrescriptionBtn.title = "Print the saved prescription.";
                }

                showMessage(
                    result.message || "Prescription saved successfully!",
                    "success"
                );

            } catch (error) {
                console.error("Save prescription error:", error);

                invalidateSavedPrescription();

                showMessage(
                    error.message ||
                    "An error occurred while saving the prescription.",
                    "error"
                );

            } finally {
                isSavingPrescription = false;

                if (savePrescriptionBtn) {
                    savePrescriptionBtn.disabled = false;
                    savePrescriptionBtn.innerHTML = `
                        <i class="bi bi-check-circle"></i>
                        Save Prescription
                    `;
                }
            }
        }

        if (form) {
            form.addEventListener("submit", savePrescription);
        } else if (savePrescriptionBtn) {
            savePrescriptionBtn.addEventListener("click", savePrescription);
        }

        /* =======================================================
           PRINT SAVED PRESCRIPTION
           - Includes medicine instructions.
           - Follow-up date is aligned to the left.
           - Does not print patient, doctor or appointment IDs.
        ======================================================= */

        function buildPrintHTML(prescription) {
            const prescriptionNumber = prescription.id
                ? escapeHTML(prescription.id)
                : "Saved prescription";

            const medicineRows = prescription.medicines.map(function (medicine, index) {
                return `
                    <tr>
                        <td>${index + 1}</td>

                        <td>
                            ${escapeHTML(medicine.medicineName || "Not specified")}
                        </td>

                        <td>${escapeHTML(medicine.dosage || "Not specified")}</td>

                        <td>${escapeHTML(medicine.frequency || "Not specified")}</td>

                        <td>${escapeHTML(medicine.duration || "Not specified")}</td>

                        <td class="medicine-instruction-print">
                            ${escapeHTML(medicine.instructions || "—")}
                        </td>
                    </tr>
                `;
            }).join("");

            return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">

                    <title>DermCare Prescription</title>

                    <style>
                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            padding: 30px;
                            font-family: Arial, Helvetica, sans-serif;
                            color: #000;
                            background: #fff;
                            font-size: 13px;
                            line-height: 1.5;
                        }

                        .prescription {
                            width: 100%;
                            max-width: 850px;
                            margin: 0 auto;
                        }

                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            gap: 20px;
                            padding-bottom: 20px;
                            border-bottom: 3px solid #0B6FB8;
                        }

                        .clinic-name {
                            margin: 0;
                            color: #0B6FB8;
                            font-size: 28px;
                            font-weight: 700;
                        }

                        .clinic-subtitle {
                            margin-top: 4px;
                            font-size: 13px;
                        }

                        .prescription-label {
                            margin: 0;
                            font-size: 20px;
                            text-align: right;
                        }

                        .record-id {
                            margin-top: 6px;
                            font-size: 12px;
                            text-align: right;
                            overflow-wrap: anywhere;
                        }

                        .section {
                            margin-top: 22px;
                        }

                        .section h2 {
                            margin: 0 0 12px;
                            padding-bottom: 7px;
                            border-bottom: 1px solid #dbe3ec;
                            font-size: 15px;
                        }

                        .details-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 12px 24px;
                        }

                        .detail-label {
                            display: block;
                            margin-bottom: 3px;
                            font-size: 11px;
                            font-weight: 700;
                        }

                        .detail-value {
                            display: block;
                            font-size: 13px;
                            overflow-wrap: anywhere;
                        }

                        .diagnosis {
                            padding: 12px;
                            background: #f8fafc;
                            border-left: 4px solid #0B6FB8;
                            border-radius: 4px;
                            white-space: pre-wrap;
                            overflow-wrap: anywhere;
                        }

                        .text-content {
                            display: block;
                            width: 100%;
                            margin: 0;
                            padding: 0;
                            color: #000;
                            text-align: left;
                            white-space: pre-wrap;
                            overflow-wrap: anywhere;
                        }

                        table {
                            width: 100%;
                            margin-top: 8px;
                            border-collapse: collapse;
                            table-layout: fixed;
                        }

                        th,
                        td {
                            padding: 9px 7px;
                            border: 1px solid #cbd5e1;
                            color: #000;
                            text-align: left;
                            vertical-align: top;
                            overflow-wrap: anywhere;
                            word-break: normal;
                        }

                        th {
                            background: #f1f5f9;
                            font-size: 11px;
                        }

                        td {
                            font-size: 12px;
                        }

                        .medicine-instruction-print {
                            text-align: left;
                            white-space: pre-wrap;
                            overflow-wrap: anywhere;
                        }

                        .follow-up-content {
                            display: block;
                            width: 100%;
                            margin: 0;
                            padding: 0;
                            color: #000;
                            text-align: left !important;
                        }

                        .follow-up-content strong {
                            display: inline;
                            margin: 0;
                            text-align: left !important;
                        }

                        .signature {
                            display: flex;
                            justify-content: flex-end;
                            margin-top: 45px;
                        }

                        .signature-line {
                            width: 210px;
                            padding-top: 8px;
                            border-top: 1px solid #000;
                            text-align: center;
                            font-size: 12px;
                        }

                        .footer {
                            margin-top: 30px;
                            padding-top: 12px;
                            border-top: 1px solid #cbd5e1;
                            font-size: 10px;
                            text-align: center;
                        }

                        .print-controls {
                            margin-bottom: 20px;
                            text-align: center;
                        }

                        .print-controls button {
                            padding: 10px 18px;
                            border: none;
                            border-radius: 6px;
                            background: #0B6FB8;
                            color: #fff;
                            font-size: 13px;
                            cursor: pointer;
                        }

                        @media (max-width: 600px) {
                            body {
                                padding: 15px;
                            }

                            .header {
                                flex-direction: column;
                            }

                            .prescription-label,
                            .record-id {
                                text-align: left;
                            }

                            .details-grid {
                                grid-template-columns: 1fr;
                            }

                            th,
                            td {
                                padding: 5px 3px;
                                font-size: 9px;
                            }
                        }

                        @media print {
                            @page {
                                size: A4;
                                margin: 15mm;
                            }

                            body {
                                padding: 0;
                                color: #000;
                                print-color-adjust: exact;
                                -webkit-print-color-adjust: exact;
                            }

                            .print-controls {
                                display: none !important;
                            }

                            .section,
                            table,
                            tr,
                            .diagnosis {
                                break-inside: avoid;
                            }

                            .follow-up-content {
                                text-align: left !important;
                            }
                        }
                    </style>
                </head>

                <body>
                    <div class="prescription">

                        <div class="print-controls">
                            <button type="button" onclick="window.print()">
                                Print Prescription
                            </button>
                        </div>

                        <header class="header">
                            <div>
                                <h1 class="clinic-name">DermCare</h1>
                                <div class="clinic-subtitle">Skin &amp; Hair Clinic</div>
                            </div>

                            <div>
                                <h2 class="prescription-label">PRESCRIPTION</h2>

                                <div class="record-id">
                                    Prescription ID: ${prescriptionNumber}
                                </div>

                                <div class="record-id">
                                    Saved: ${escapeHTML(formatDate(prescription.savedAt))}
                                </div>
                            </div>
                        </header>

                        <section class="section">
                            <h2>Patient Details</h2>

                            <div class="details-grid">
                                <div>
                                    <span class="detail-label">Patient Name</span>
                                    <span class="detail-value">
                                        ${escapeHTML(prescription.patient.name || "Not specified")}
                                    </span>
                                </div>

                                <div>
                                    <span class="detail-label">Email</span>
                                    <span class="detail-value">
                                        ${escapeHTML(prescription.patient.email || "Not specified")}
                                    </span>
                                </div>

                                <div>
                                    <span class="detail-label">Mobile</span>
                                    <span class="detail-value">
                                        ${escapeHTML(prescription.patient.mobile || "Not specified")}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section class="section">
                            <h2>Appointment Details</h2>

                            <div class="details-grid">
                                <div>
                                    <span class="detail-label">Appointment Date</span>
                                    <span class="detail-value">
                                        ${escapeHTML(formatDate(prescription.appointment.date))}
                                    </span>
                                </div>

                                <div>
                                    <span class="detail-label">Appointment Time</span>
                                    <span class="detail-value">
                                        ${escapeHTML(prescription.appointment.time || "Not specified")}
                                    </span>
                                </div>

                                <div>
                                    <span class="detail-label">Doctor</span>
                                    <span class="detail-value">
                                        ${escapeHTML(prescription.doctor.name)}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section class="section">
                            <h2>Diagnosis</h2>

                            <div class="diagnosis">${escapeHTML(
                                prescription.diagnosis || "Not specified"
                            )}</div>
                        </section>

                        ${
                            prescription.clinicalNotes
                                ? `
                                    <section class="section">
                                        <h2>Clinical Notes</h2>
                                        <div class="text-content">${escapeHTML(
                                            prescription.clinicalNotes
                                        )}</div>
                                    </section>
                                `
                                : ""
                        }

                        <section class="section">
                            <h2>Prescribed Medicines</h2>

                            <table>
                                <colgroup>
                                    <col style="width: 6%;">
                                    <col style="width: 22%;">
                                    <col style="width: 13%;">
                                    <col style="width: 17%;">
                                    <col style="width: 13%;">
                                    <col style="width: 29%;">
                                </colgroup>

                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>Medicine</th>
                                        <th>Dosage</th>
                                        <th>Frequency</th>
                                        <th>Duration</th>
                                        <th>Medicine Instructions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    ${medicineRows}
                                </tbody>
                            </table>
                        </section>

                        ${
                            prescription.advice
                                ? `
                                    <section class="section">
                                        <h2>Advice &amp; Instructions</h2>
                                        <div class="text-content">${escapeHTML(
                                            prescription.advice
                                        )}</div>
                                    </section>
                                `
                                : ""
                        }

                        ${
                            prescription.followUpDate
                                ? `
                                    <section class="section">
                                        <h2>Follow-up</h2>

                                        <div class="follow-up-content">
                                            <strong>Follow-up Date:</strong>
                                            ${escapeHTML(
                                                formatDate(prescription.followUpDate)
                                            )}
                                        </div>
                                    </section>
                                `
                                : ""
                        }

                        <div class="signature">
                            <div class="signature-line">Doctor's Signature</div>
                        </div>

                        <footer class="footer">
                            This prescription was generated from the DermCare
                            appointment management system.
                        </footer>

                    </div>
                </body>
                </html>
            `;
        }

        function printSavedPrescription() {
            if (!savedPrescriptionForPrint) {
                showMessage(
                    "Please save the prescription successfully before printing.",
                    "error"
                );
                return;
            }

            const printWindow = window.open(
                "",
                "_blank",
                "width=900,height=750"
            );

            if (!printWindow) {
                showMessage(
                    "The print window was blocked. Please allow pop-ups and try again.",
                    "error"
                );
                return;
            }

            try {
                printWindow.document.open();
                printWindow.document.write(
                    buildPrintHTML(savedPrescriptionForPrint)
                );
                printWindow.document.close();
                printWindow.focus();
            } catch (error) {
                console.error("Print prescription error:", error);
                printWindow.close();

                showMessage(
                    "Unable to prepare the prescription for printing.",
                    "error"
                );
            }
        }

        if (printPrescriptionBtn) {
            printPrescriptionBtn.disabled = true;

            printPrescriptionBtn.addEventListener("click", function (event) {
                event.preventDefault();
                printSavedPrescription();
            });
        }

        /* =======================================================
           CANCEL FORM
        ======================================================= */

        if (cancelBtn) {
            cancelBtn.addEventListener("click", function () {
                if (isSavingPrescription) {
                    return;
                }

                const confirmed = window.confirm(
                    "Are you sure you want to clear the prescription form?"
                );

                if (!confirmed) {
                    return;
                }

                hideMessage();

                if (form) {
                    form.reset();
                }

                if (medicinesContainer) {
                    medicinesContainer.innerHTML = "";
                    medicineCounter = 0;
                    createMedicineCard();
                }

                invalidateSavedPrescription();
                populateAppointmentDetails();
            });
        }

        /* =======================================================
           BACK BUTTON
        ======================================================= */

        if (backBtn) {
            backBtn.addEventListener("click", function (event) {
                event.preventDefault();

                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = "today-appointments.html";
                }
            });
        }

        /* =======================================================
           LOGOUT
        ======================================================= */

        if (logoutLink) {
            logoutLink.addEventListener("click", function (event) {
                event.preventDefault();

                const confirmed = window.confirm(
                    "Are you sure you want to log out?"
                );

                if (!confirmed) {
                    return;
                }

                const keysToRemove = [
                    "loggedInDoctor",
                    "doctorData",
                    "doctor",
                    "currentDoctor",
                    "doctorId",
                    "doctorID",
                    "loggedInDoctorId",
                    "selectedDoctorAppointment",
                    "selectedAppointment",
                    "doctorSelectedAppointment"
                ];

                keysToRemove.forEach(function (key) {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                });

                window.location.href = "login.html";
            });
        }

    });
}
