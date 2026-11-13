
/* ======================================================
   DERMCARE - DOCTOR PATIENT DETAILS JAVASCRIPT
   File: doctor/js/patient-view.js

   FEATURES:
   1. Mobile sidebar and overlay
   2. Sidebar close icon
   3. Doctor logout
   4. Patient information fetched from backend when needed
   5. Appointment information
   6. Consultation information
   7. Navigation to prescription form
   8. Mark appointment as completed

   IMPORTANT:
   Existing project structure and database remain unchanged.
====================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ==================================================
       DOM ELEMENTS
    ================================================== */

    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const overlay = document.getElementById("overlay");
    const logoutLink = document.getElementById("logoutLink");

    const pageMessage = document.getElementById("pageMessage");
    const patientDetails = document.getElementById("patientDetails");

    const backButton = document.getElementById("backButton");
    const backToDashboard = document.getElementById("backToDashboard");
    const writePrescription = document.getElementById("writePrescription");

    // NEW: Mark Completed button
    const markCompletedButton = document.getElementById(
        "markAppointmentCompleted"
    );

    /* ==================================================
       LOAD SELECTED APPOINTMENT AND DOCTOR
    ================================================== */

    let appointment = null;
    let doctor = null;

    try {
        appointment = JSON.parse(
            sessionStorage.getItem("selectedDoctorAppointment") || "null"
        );

        doctor = JSON.parse(
            localStorage.getItem("doctor") || "null"
        );

    } catch (error) {
        console.error(
            "DermCare: Unable to load saved appointment or doctor.",
            error
        );
    }

    /* ==================================================
       MOBILE SIDEBAR
    ================================================== */

    function openSidebar() {

        if (!sidebar || !overlay || !menuToggle) {
            return;
        }

        sidebar.classList.add("active");
        overlay.classList.add("active");

        menuToggle.innerHTML = '<i class="bi bi-x-lg"></i>';
        menuToggle.setAttribute("aria-label", "Close menu");

        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {

        if (!sidebar || !overlay || !menuToggle) {
            return;
        }

        sidebar.classList.remove("active");
        overlay.classList.remove("active");

        menuToggle.innerHTML = '<i class="bi bi-list"></i>';
        menuToggle.setAttribute("aria-label", "Open menu");

        document.body.style.overflow = "";
    }

    if (menuToggle && sidebar && overlay) {

        menuToggle.addEventListener("click", function () {

            if (sidebar.classList.contains("active")) {
                closeSidebar();
            } else {
                openSidebar();
            }

        });

        overlay.addEventListener("click", closeSidebar);

        sidebar.querySelectorAll("nav a").forEach(function (link) {
            link.addEventListener("click", closeSidebar);
        });

        window.addEventListener("resize", function () {

            if (window.innerWidth > 900) {
                closeSidebar();
            }

        });

    }

    /* ==================================================
       LOGOUT
    ================================================== */

    if (logoutLink) {

        logoutLink.addEventListener("click", function (event) {

            event.preventDefault();

            const confirmed = window.confirm(
                "Are you sure you want to logout?"
            );

            if (!confirmed) {
                return;
            }

            localStorage.removeItem("doctor");
            sessionStorage.removeItem("selectedDoctorAppointment");

            window.location.href = "login.html";

        });

    }

    /* ==================================================
       MESSAGE HELPER
    ================================================== */

    function showMessage(message, isError = false) {

        if (!pageMessage) {
            return;
        }

        pageMessage.textContent = message;
        pageMessage.classList.toggle("error", isError);
        pageMessage.hidden = false;

        if (patientDetails) {
            patientDetails.hidden = true;
        }

    }

    /* ==================================================
       GET VALUE FROM OBJECT
    ================================================== */

    function getValue(object, keys) {

        if (!object || typeof object !== "object") {
            return "";
        }

        for (const key of keys) {

            const value = object[key];

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

    /* ==================================================
       DISPLAY VALUE SAFELY
    ================================================== */

    function setText(elementId, value, fallback = "Not provided") {

        const element = document.getElementById(elementId);

        if (!element) {
            return;
        }

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            element.textContent = String(value);
        } else {
            element.textContent = fallback;
        }

    }

    /* ==================================================
       GET ID FROM OBJECT OR VALUE
    ================================================== */

    function getId(value) {

        if (!value) {
            return "";
        }

        if (typeof value === "object") {

            return String(
                value._id ||
                value.id ||
                value.DoctorID ||
                value.doctorId ||
                value.PatientID ||
                value.patientId ||
                ""
            );

        }

        return String(value);

    }

    /* ==================================================
       FORMAT DATE
    ================================================== */

    function formatDate(value) {

        if (!value) {
            return "Not provided";
        }

        if (
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {

            const parts = value.split("-");

            return `${parts[2]}/${parts[1]}/${parts[0]}`;

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

    /* ==================================================
       FORMAT TIME
    ================================================== */

    function formatTime(value) {

        if (!value) {
            return "Not provided";
        }

        if (
            typeof value === "string" &&
            /^\d{1,2}:\d{2}(\s?(AM|PM))?$/i.test(value.trim())
        ) {
            return value;
        }

        const date = new Date(value);

        if (
            !Number.isNaN(date.getTime()) &&
            typeof value === "string" &&
            value.includes("T")
        ) {

            return date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });

        }

        return String(value);

    }

    /* ==================================================
       GET PATIENT OBJECT FROM APPOINTMENT
    ================================================== */

    function getAppointmentPatient() {

        if (!appointment) {
            return {};
        }

        const possiblePatient =
            appointment.PatientID ||
            appointment.patient ||
            appointment.Patient;

        // A populated patient reference is an object.
        // An unpopulated PatientID is usually an ID string.

        if (
            possiblePatient &&
            typeof possiblePatient === "object" &&
            !Array.isArray(possiblePatient)
        ) {
            return possiblePatient;
        }

        return {};
    }

    /* ==================================================
       CHECK WHETHER PATIENT DETAILS ARE COMPLETE
    ================================================== */

    function hasPatientDetails(patient) {

        if (!patient || typeof patient !== "object") {
            return false;
        }

        return Boolean(
            getValue(patient, ["FullName", "fullName", "Name", "name"]) ||
            getValue(patient, ["Email", "email"]) ||
            getValue(patient, [
                "Mobile No",
                "MobileNo",
                "MobileNumber",
                "mobile",
                "mobileNumber",
                "Phone",
                "phone"
            ]) ||
            getValue(patient, ["Gender", "gender"]) ||
            getValue(patient, [
                "DateOfBirth",
                "Date of Birth",
                "DOB",
                "dob"
            ]) ||
            getValue(patient, [
                "Blood Group",
                "BloodGroup",
                "bloodGroup"
            ])
        );

    }

    /* ==================================================
       FETCH LATEST PATIENT DETAILS FROM BACKEND
    ================================================== */

    async function fetchPatientDetails(patientId) {

        if (!patientId) {
            return null;
        }

        if (
            typeof patientId !== "string" ||
            !/^[a-fA-F0-9]{24}$/.test(patientId)
        ) {
            return null;
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/patients/profile/${encodeURIComponent(patientId)}`
            );

            if (!response.ok) {

                console.error(
                    "DermCare: Patient profile request failed.",
                    response.status
                );

                return null;

            }

            const result = await response.json();

            if (result.success === false) {
                console.error(
                    "DermCare: Backend could not return the patient profile.",
                    result.message || ""
                );

                return null;
            }

            // Support common response formats:
            // { success: true, patient: {...} }
            // { patient: {...} }
            // { data: {...} }
            // { ...patientFields }

            const fetchedPatient =
                result.patient ||
                result.data?.patient ||
                result.data ||
                result;

            if (
                fetchedPatient &&
                typeof fetchedPatient === "object" &&
                !Array.isArray(fetchedPatient)
            ) {
                return fetchedPatient;
            }

            return null;

        } catch (error) {

            console.error(
                "DermCare: Unable to fetch patient details from backend.",
                error
            );

            return null;

        }

    }

    /* ==================================================
       MARK APPOINTMENT AS COMPLETED
    ================================================== */

    async function markAppointmentCompleted() {

        // Check that an appointment has been selected.

        if (!appointment) {

            alert(
                "Appointment information is missing. Return to the Doctor Dashboard and select an appointment."
            );

            return;

        }

        // Find the appointment ID.

        const appointmentId = getId(
            appointment._id ||
            appointment.id ||
            appointment.AppointmentID ||
            appointment.appointmentId
        );

        if (
            !appointmentId ||
            !/^[a-fA-F0-9]{24}$/.test(appointmentId)
        ) {

            alert(
                "A valid appointment ID could not be found. Please return to the Doctor Dashboard and select the appointment again."
            );

            return;

        }

        // Verify the logged-in doctor.

        if (!doctor) {

            alert(
                "Doctor login information was not found. Please log in again."
            );

            return;

        }

        const loggedInDoctorId = getId(
            doctor._id ||
            doctor.id ||
            doctor.DoctorID ||
            doctor.doctorId
        );

        const appointmentDoctorId = getId(
            appointment.DoctorID ||
            appointment.doctorId ||
            appointment.doctor
        );

        if (
            loggedInDoctorId &&
            appointmentDoctorId &&
            loggedInDoctorId !== appointmentDoctorId
        ) {

            alert(
                "You cannot complete an appointment assigned to another doctor."
            );

            return;

        }

        // Prevent completing an appointment that is already completed.

        const currentStatus = String(
            appointment.Status || appointment.status || ""
        ).trim().toLowerCase();

        if (currentStatus === "completed") {

            alert("This appointment is already completed.");

            window.location.href = "dashboard.html";

            return;

        }

        if (currentStatus === "cancelled") {

            alert("A cancelled appointment cannot be completed.");

            return;

        }

        // Confirm the action.

        const confirmed = window.confirm(
            "Are you sure you want to mark this appointment as completed?"
        );

        if (!confirmed) {
            return;
        }

        // Prevent duplicate submissions.

        if (markCompletedButton) {

            markCompletedButton.disabled = true;

            markCompletedButton.innerHTML =
                '<i class="bi bi-hourglass-split"></i> Completing...';

        }

        try {

            // Call the route registered in appointmentRoutes.js.

            const response = await fetch(
                `http://localhost:5000/api/appointments/${encodeURIComponent(appointmentId)}/complete`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            let result = {};

            try {
                result = await response.json();
            } catch (parseError) {
                result = {};
            }

            if (!response.ok || result.success === false) {

                throw new Error(
                    result.message ||
                    "Unable to mark the appointment as completed."
                );

            }

            // Update the saved appointment in this browser session.

            appointment.Status = "Completed";

            sessionStorage.setItem(
                "selectedDoctorAppointment",
                JSON.stringify(appointment)
            );

            // Update the visible status before leaving the page.

            setText("appointmentStatus", "Completed");

            // Show confirmation.

            alert(
                result.message ||
                "Appointment marked as completed successfully."
            );

            // Remove the completed appointment from the selected
            // session and return to the dashboard, which reloads
            // appointment data from the backend.

            sessionStorage.removeItem("selectedDoctorAppointment");

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error(
                "DermCare: Error completing appointment:",
                error
            );

            alert(
                error.message ||
                "A server error occurred while completing the appointment. Please try again."
            );

            // Restore the original button if the request fails.

            if (markCompletedButton) {

                markCompletedButton.disabled = false;

                markCompletedButton.innerHTML =
                    '<i class="bi bi-check-circle-fill"></i> Mark Completed';

            }

        }

    }

    // Connect the Mark Completed button.

    if (markCompletedButton) {

        markCompletedButton.addEventListener(
            "click",
            markAppointmentCompleted
        );

    }

    /* ==================================================
       LOAD PATIENT DETAILS
    ================================================== */

    async function loadPatientDetails() {

        /* ----------------------------------------------
           CHECK SELECTED APPOINTMENT
        ---------------------------------------------- */

        if (!appointment) {

            showMessage(
                "No appointment selected. Return to the Doctor Dashboard and click View.",
                true
            );

            return;

        }

        /* ----------------------------------------------
           CHECK DOCTOR LOGIN
        ---------------------------------------------- */

        if (!doctor) {

            showMessage(
                "Doctor login information was not found. Please log in again.",
                true
            );

            return;

        }

        /* ----------------------------------------------
           VERIFY DOCTOR OWNERSHIP WHEN IDS ARE AVAILABLE
        ---------------------------------------------- */

        const loggedInDoctorId = getId(
            doctor._id ||
            doctor.id ||
            doctor.DoctorID ||
            doctor.doctorId
        );

        const appointmentDoctorId = getId(
            appointment.DoctorID ||
            appointment.doctorId ||
            appointment.doctor
        );

        if (
            loggedInDoctorId &&
            appointmentDoctorId &&
            loggedInDoctorId !== appointmentDoctorId
        ) {

            showMessage(
                "This appointment does not belong to the logged-in doctor.",
                true
            );

            return;

        }

        /* ----------------------------------------------
           GET PATIENT REFERENCE AND ID
        ---------------------------------------------- */

        const patientReference =
            appointment.PatientID ||
            appointment.patient ||
            appointment.Patient ||
            null;

        let patient = getAppointmentPatient();

        const patientId = getId(patientReference);

        /* ----------------------------------------------
           FETCH LATEST DATA IF DETAILS ARE MISSING
        ---------------------------------------------- */

        const patientDetailsMissing = !hasPatientDetails(patient);

        if (patientId && patientDetailsMissing) {

            const latestPatient = await fetchPatientDetails(patientId);

            if (latestPatient) {
                patient = latestPatient;
            }

        }

        /* ==============================================
           PATIENT INFORMATION
        ============================================== */

        setText(
            "patientName",
            getValue(patient, [
                "FullName",
                "fullName",
                "Name",
                "name"
            ])
        );

        setText(
            "patientEmail",
            getValue(patient, [
                "Email",
                "email"
            ])
        );

        setText(
            "patientMobile",
            getValue(patient, [
                "Mobile No",
                "MobileNo",
                "MobileNumber",
                "mobile",
                "mobileNumber",
                "Phone",
                "phone"
            ])
        );

        setText(
            "patientGender",
            getValue(patient, [
                "Gender",
                "gender"
            ])
        );

        setText(
            "patientDOB",
            formatDate(
                getValue(patient, [
                    "DateOfBirth",
                    "Date of Birth",
                    "DOB",
                    "dob"
                ])
            )
        );

        setText(
            "patientBloodGroup",
            getValue(patient, [
                "Blood Group",
                "BloodGroup",
                "bloodGroup"
            ])
        );

        /* ==============================================
           APPOINTMENT INFORMATION
        ============================================== */

        setText(
            "appointmentDate",
            formatDate(
                getValue(appointment, [
                    "AppointmentDate",
                    "appointmentDate",
                    "Date",
                    "date"
                ])
            )
        );

        setText(
            "appointmentTime",
            formatTime(
                getValue(appointment, [
                    "AppointmentTime",
                    "appointmentTime",
                    "Time",
                    "time"
                ])
            )
        );

        setText(
            "appointmentType",
            getValue(appointment, [
                "AppointmentType",
                "appointmentType",
                "Type",
                "type"
            ])
        );

        setText(
            "appointmentStatus",
            getValue(appointment, [
                "Status",
                "status"
            ])
        );

        /* ==============================================
           CONSULTATION INFORMATION
        ============================================== */

        setText(
            "reasonForVisit",
            getValue(appointment, [
                "ReasonForVisit",
                "reasonForVisit",
                "Reason",
                "reason"
            ])
        );

        setText(
            "patientSymptoms",
            getValue(appointment, [
                "Symptoms",
                "symptoms",
                "Problem",
                "problem",
                "SkinHairProblem"
            ])
        );

        const allergies = getValue(appointment, [
            "Allergies",
            "allergies"
        ]);

        const allergyDetails = getValue(appointment, [
            "AllergyDetails",
            "allergyDetails",
            "AllergiesDetails"
        ]);

        setText(
            "patientAllergies",
            allergies
        );

        setText(
            "allergyDetails",
            allergyDetails
        );

        /* ----------------------------------------------
           HIDE EMPTY ALLERGY DETAILS SECTION
        ---------------------------------------------- */

        const allergyDetailsWrapper = document.getElementById(
            "allergyDetailsWrapper"
        );

        if (allergyDetailsWrapper) {
            allergyDetailsWrapper.hidden = !allergyDetails;
        }

        /* ----------------------------------------------
           HANDLE COMPLETED OR CANCELLED APPOINTMENTS
        ---------------------------------------------- */

        const appointmentStatus = String(
            appointment.Status || appointment.status || ""
        ).trim().toLowerCase();

        if (markCompletedButton) {

            if (
                appointmentStatus === "completed" ||
                appointmentStatus === "cancelled"
            ) {

                markCompletedButton.hidden = true;

            } else {

                markCompletedButton.hidden = false;

            }

        }

        /* ----------------------------------------------
           SHOW PATIENT DETAILS
        ---------------------------------------------- */

        if (patientDetails) {
            patientDetails.hidden = false;
        }

        if (pageMessage) {
            pageMessage.hidden = true;
        }

    }

    /* ==================================================
       BACK TO DASHBOARD
    ================================================== */

    function goBackToDashboard() {
        window.location.href = "dashboard.html";
    }

    if (backButton) {
        backButton.addEventListener(
            "click",
            goBackToDashboard
        );
    }

    if (backToDashboard) {
        backToDashboard.addEventListener(
            "click",
            goBackToDashboard
        );
    }

    /* ==================================================
       WRITE PRESCRIPTION
    ================================================== */

    if (writePrescription) {

        writePrescription.addEventListener("click", function () {

            if (!appointment) {

                alert(
                    "Appointment information is missing. Please return to the Doctor Dashboard and select an appointment."
                );

                return;

            }

            try {

                sessionStorage.setItem(
                    "selectedDoctorAppointment",
                    JSON.stringify(appointment)
                );

                window.location.href = "prescription-form.html";

            } catch (error) {

                console.error(
                    "Unable to open prescription form:",
                    error
                );

                alert(
                    "Unable to open the prescription form. Please try again."
                );

            }

        });

    }

    /* ==================================================
       INITIALIZE PAGE
    ================================================== */

    loadPatientDetails();

});
