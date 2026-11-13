
/* =======================================================
   DERMCARE - APPOINTMENT HISTORY JAVASCRIPT
   FILE: patient/js/appointment-history.js
======================================================= */

// =======================================================
// API BASE URL
// =======================================================

const API_BASE_URL = "https://dermacare-eeca.onrender.com/api";

// =======================================================
// MOBILE MENU ELEMENTS
// =======================================================

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

// =======================================================
// APPOINTMENT TABLE
// =======================================================

const appointmentTableBody =
    document.getElementById("appointmentTableBody");

// =======================================================
// LOGOUT BUTTON
// =======================================================

const logoutButton = document.getElementById("logoutButton");

// =======================================================
// CURRENT APPOINTMENT ID
// =======================================================

let selectedAppointmentId = null;


// =======================================================
// CREATE CUSTOM CANCEL MODAL
// =======================================================

function createCancelModal() {

    if (document.getElementById("cancelConfirmationModal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "cancelConfirmationModal";
    modal.className = "cancel-confirmation-modal";

    modal.innerHTML = `
        <div class="cancel-confirmation-box">

            <div class="cancel-confirmation-icon">
                <i class="bi bi-exclamation-circle"></i>
            </div>

            <h2>Cancel Appointment?</h2>

            <p>
                Are you sure you want to cancel this appointment?
            </p>

            <div class="cancel-confirmation-actions">

                <button
                    type="button"
                    class="keep-appointment-btn"
                    id="keepAppointmentButton">
                    No, Keep It
                </button>

                <button
                    type="button"
                    class="confirm-cancel-btn"
                    id="confirmCancelButton">
                    Yes, Cancel
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    // Keep appointment
    document.getElementById("keepAppointmentButton")
        ?.addEventListener("click", closeCancelModal);

    // Confirm cancellation
    document.getElementById("confirmCancelButton")
        ?.addEventListener("click", function () {

            if (selectedAppointmentId) {
                performCancelAppointment(selectedAppointmentId);
            }

        });

    // Close when clicking outside
    modal.addEventListener("click", function (event) {

        if (event.target === modal) {
            closeCancelModal();
        }

    });
}


// =======================================================
// OPEN CANCEL MODAL
// =======================================================

function openCancelModal(appointmentId) {

    selectedAppointmentId = appointmentId;

    createCancelModal();

    document.getElementById("cancelConfirmationModal")
        ?.classList.add("active");
}


// =======================================================
// CLOSE CANCEL MODAL
// =======================================================

function closeCancelModal() {

    document.getElementById("cancelConfirmationModal")
        ?.classList.remove("active");

    selectedAppointmentId = null;
}


// =======================================================
// GET LOGGED-IN PATIENT
// =======================================================

function getLoggedInPatient() {

    const patientData = localStorage.getItem("patient");

    if (!patientData) {

        window.location.href = "../login.html";
        return null;

    }

    try {

        return JSON.parse(patientData);

    } catch (error) {

        console.error("Error reading patient data:", error);

        localStorage.removeItem("patient");

        window.location.href = "../login.html";

        return null;
    }
}


// =======================================================
// GET PATIENT ID
// =======================================================

function getPatientId() {

    const patient = getLoggedInPatient();

    if (!patient) {
        return null;
    }

    return (
        patient._id ||
        patient.id ||
        patient.PatientID
    );
}


// =======================================================
// FORMAT DATE
// =======================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// =======================================================
// FORMAT TIME
// =======================================================

function formatTime(time) {

    if (!time) {
        return "-";
    }

    const parts = String(time).split(":");

    if (parts.length !== 2) {
        return time;
    }

    let hours = Number(parts[0]);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
        return time;
    }

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    return `${hours}:${minutes} ${period}`;
}


// =======================================================
// NORMALIZE STATUS
// =======================================================

function normalizeStatus(status) {

    return String(status || "")
        .trim()
        .toLowerCase();
}


// =======================================================
// GET STATUS CLASS
// =======================================================

function getStatusClass(status) {

    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "booked") {
        return "booked";
    }

    if (normalizedStatus === "completed") {
        return "completed";
    }

    if (normalizedStatus === "cancelled") {
        return "cancelled";
    }

    return "";
}


// =======================================================
// GET STATUS TEXT
// UPDATED: SHOW WHO CANCELLED THE APPOINTMENT
// =======================================================

function getStatusText(appointment) {

    if (!appointment) {
        return "-";
    }

    const status = normalizeStatus(appointment.Status);

    if (status === "cancelled") {

        const cancelledBy = String(
            appointment.CancelledBy ||
            appointment.cancelledBy ||
            ""
        ).trim().toLowerCase();

        // Cancelled by Receptionist
        if (cancelledBy === "receptionist") {
            return "Cancelled by Receptionist";
        }

        // Cancelled by Patient
        if (
            cancelledBy === "patient" ||
            cancelledBy === "you"
        ) {
            return "Cancelled by you";
        }

        // Fallback for older cancellation records
        return "Cancelled";
    }

    return appointment.Status || "-";
}


// =======================================================
// GET CANCELLATION REASON
// =======================================================

function getCancellationReason(appointment) {

    if (!appointment) {
        return "";
    }

    return String(
        appointment.CancellationReason ||
        appointment.cancellationReason ||
        ""
    ).trim();
}


// =======================================================
// GET DOCTOR NAME
// =======================================================

function getDoctorName(doctor) {

    if (!doctor) {
        return "Doctor unavailable";
    }

    if (typeof doctor === "string") {
        return "Doctor";
    }

    return (
        doctor.fullName ||
        doctor.FullName ||
        doctor.name ||
        doctor.Name ||
        doctor.doctorName ||
        doctor.DoctorName ||
        "Doctor"
    );
}


// =======================================================
// GET DOCTOR ID
// =======================================================

function getDoctorId(doctor) {

    if (!doctor) {
        return null;
    }

    if (typeof doctor === "string") {
        return doctor;
    }

    return (
        doctor._id ||
        doctor.id ||
        doctor.DoctorID ||
        null
    );
}


// =======================================================
// FORMAT DATE FOR URL
// =======================================================

function formatDateForURL(dateValue) {

    if (!dateValue) {
        return "";
    }

    if (
        typeof dateValue === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ) {
        return dateValue;
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}


// =======================================================
// NORMALIZE TIME FOR URL
// =======================================================

function normalizeTimeForURL(time) {

    if (!time) {
        return "";
    }

    let timeString = String(time).trim().toUpperCase();

    if (
        timeString.includes("AM") ||
        timeString.includes("PM")
    ) {

        const isPM = timeString.includes("PM");

        timeString = timeString
            .replace("AM", "")
            .replace("PM", "")
            .trim();

        const parts = timeString.split(":");

        let hours = Number(parts[0]);

        const minutes = String(
            Number(parts[1] || 0)
        ).padStart(2, "0");

        if (isPM && hours !== 12) {
            hours += 12;
        }

        if (!isPM && hours === 12) {
            hours = 0;
        }

        return (
            String(hours).padStart(2, "0") +
            ":" +
            minutes
        );
    }

    const parts = timeString.split(":");

    if (parts.length !== 2) {
        return timeString;
    }

    const hours = String(
        Number(parts[0])
    ).padStart(2, "0");

    const minutes = String(
        Number(parts[1])
    ).padStart(2, "0");

    return `${hours}:${minutes}`;
}


// =======================================================
// LOAD PATIENT APPOINTMENTS
// =======================================================

async function loadPatientAppointments() {

    if (!appointmentTableBody) {
        return;
    }

    const patientId = getPatientId();

    if (!patientId) {
        return;
    }

    appointmentTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-message">
                Loading appointments...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_BASE_URL}/appointments/patient/${patientId}`,
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to load appointments."
            );
        }

        displayAppointments(data.appointments);

    } catch (error) {

        console.error("Error loading appointments:", error);

        appointmentTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    Unable to load appointments.
                </td>
            </tr>
        `;
    }
}


// =======================================================
// DISPLAY APPOINTMENTS
// UPDATED: CANCELLATION REASON DISPLAY
// =======================================================

function displayAppointments(appointments) {

    if (!appointments || appointments.length === 0) {

        appointmentTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No appointments found.
                </td>
            </tr>
        `;

        return;
    }

    appointmentTableBody.innerHTML = "";

    appointments.forEach(function (appointment) {

        const doctorName = getDoctorName(appointment.DoctorID);

        const row = document.createElement("tr");

        let actionButtons = "";

        if (normalizeStatus(appointment.Status) === "booked") {

            actionButtons = `
                <button
                    class="reschedule-btn"
                    type="button">

                    <i class="bi bi-calendar-event"></i>

                    <span>Reschedule</span>

                </button>

                <button
                    class="cancel-btn"
                    type="button">

                    <i class="bi bi-x-circle"></i>

                    <span>Cancel</span>

                </button>
            `;

        } else {

            actionButtons = `
                <span class="no-action">-</span>
            `;
        }

        // ===============================================
        // CANCELLATION REASON
        // ===============================================

        const cancellationReason =
            getCancellationReason(appointment);

        const isCancelled =
            normalizeStatus(appointment.Status) === "cancelled";

        // ===============================================
        // STATUS + REASON HTML
        // ===============================================

        const statusHTML = `
            <span class="status ${getStatusClass(appointment.Status)}">
                ${escapeHTML(getStatusText(appointment))}
            </span>

            ${
                isCancelled && cancellationReason
                    ? `
                        <div class="cancellation-reason"
                             style="margin-top: 6px; font-size: 12px; line-height: 1.4; color: #555;">

                            <strong>Reason:</strong>
                            ${escapeHTML(cancellationReason)}

                        </div>
                    `
                    : ""
            }
        `;

        row.innerHTML = `
            <td>
                <div class="doctor-name">
                    <i class="bi bi-person-badge"></i>
                    ${escapeHTML(doctorName)}
                </div>
            </td>

            <td>
                ${escapeHTML(formatDate(appointment.AppointmentDate))}
            </td>

            <td>
                ${escapeHTML(formatTime(appointment.AppointmentTime))}
            </td>

            <td>
                ${escapeHTML(appointment.AppointmentType || "-")}
            </td>

            <td>
                ${statusHTML}
            </td>

            <td>
                <div class="appointment-actions">
                    ${actionButtons}
                </div>
            </td>
        `;

        appointmentTableBody.appendChild(row);

        // ===============================================
        // CANCEL BUTTON
        // ===============================================

        const cancelButton = row.querySelector(".cancel-btn");

        if (cancelButton) {

            cancelButton.addEventListener("click", function () {

                openCancelModal(appointment._id);

            });
        }

        // ===============================================
        // RESCHEDULE BUTTON
        // ===============================================

        const rescheduleButton =
            row.querySelector(".reschedule-btn");

        if (rescheduleButton) {

            rescheduleButton.addEventListener("click", function () {

                redirectToRescheduleBooking(appointment);

            });
        }

    });
}


// =======================================================
// ESCAPE HTML
// =======================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =======================================================
// REDIRECT TO RESCHEDULE BOOKING PAGE
// =======================================================

function redirectToRescheduleBooking(appointment) {

    if (!appointment) {
        return;
    }

    const doctorId = getDoctorId(appointment.DoctorID);

    if (!doctorId) {
        return;
    }

    const appointmentDate =
        formatDateForURL(appointment.AppointmentDate);

    const appointmentTime =
        normalizeTimeForURL(appointment.AppointmentTime);

    if (!appointment._id) {
        return;
    }

    window.location.href =
        `doctor-booking.html?reschedule=true&appointmentId=${encodeURIComponent(
            appointment._id
        )}&doctor=${encodeURIComponent(
            doctorId
        )}&doctorId=${encodeURIComponent(
            doctorId
        )}&date=${encodeURIComponent(
            appointmentDate
        )}&time=${encodeURIComponent(
            appointmentTime
        )}`;
}


// =======================================================
// PERFORM PATIENT CANCEL APPOINTMENT
// =======================================================

async function performCancelAppointment(appointmentId) {

    const patientId = getPatientId();

    if (!patientId) {
        return;
    }

    const confirmCancelButton =
        document.getElementById("confirmCancelButton");

    if (confirmCancelButton) {

        confirmCancelButton.disabled = true;

        confirmCancelButton.innerHTML = `
            <i class="bi bi-arrow-repeat"></i>
            Cancelling...
        `;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    PatientID: patientId
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to cancel appointment."
            );
        }

        // Close modal
        closeCancelModal();

        // Reload appointment history
        await loadPatientAppointments();

    } catch (error) {

        console.error("Error cancelling appointment:", error);

        if (confirmCancelButton) {

            confirmCancelButton.disabled = false;

            confirmCancelButton.innerHTML = "Yes, Cancel";
        }

        alert(
            error.message || "Unable to cancel appointment."
        );
    }
}


// =======================================================
// SETUP MOBILE SIDEBAR
// =======================================================

function setupMobileSidebar() {

    if (!menuToggle || !sidebar) {
        return;
    }

    menuToggle.addEventListener("click", function () {

        sidebar.classList.toggle("active");

        if (overlay) {

            overlay.classList.toggle(
                "active",
                sidebar.classList.contains("active")
            );
        }

        const icon = menuToggle.querySelector("i");

        if (icon) {

            if (sidebar.classList.contains("active")) {

                icon.classList.remove("bi-list");
                icon.classList.add("bi-x-lg");

            } else {

                icon.classList.remove("bi-x-lg");
                icon.classList.add("bi-list");
            }
        }
    });

    function closeSidebar() {

        sidebar.classList.remove("active");

        if (overlay) {
            overlay.classList.remove("active");
        }

        const icon = menuToggle.querySelector("i");

        if (icon) {

            icon.classList.remove("bi-x-lg");
            icon.classList.add("bi-list");
        }
    }

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    window.addEventListener("resize", function () {

        if (window.innerWidth > 900) {
            closeSidebar();
        }
    });
}


// =======================================================
// LOGOUT
// =======================================================

function setupLogout() {

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", function (event) {

        event.preventDefault();

        localStorage.removeItem("patient");

        window.location.href = "../login.html";
    });
}


// =======================================================
// INITIALIZE PAGE
// =======================================================

document.addEventListener("DOMContentLoaded", function () {

    createCancelModal();

    setupMobileSidebar();

    setupLogout();

    loadPatientAppointments();

});