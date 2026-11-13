/* ======================================================
   DERMCARE - DOCTOR TODAY'S APPOINTMENTS
   File: doctor/js/today-appointments.js

   Features:
   1. Fetch appointments for the logged-in doctor.
   2. Display appointments scheduled for today.
   3. Exclude completed and cancelled appointments.
   4. Search by patient name.
   5. Filter by appointment status.
   6. View appointment details.
   7. Responsive mobile sidebar.
====================================================== */

"use strict";

const API_BASE_URL = "https://dermacare-eeca.onrender.com/api";
const APPOINTMENT_API_URL = `${API_BASE_URL}/appointments`;

let allTodayAppointments = [];
let doctorAppointments = [];

/* ======================================================
   INITIALIZE PAGE
====================================================== */

document.addEventListener("DOMContentLoaded", function () {
    displayCurrentDate();
    initializeSidebar();
    initializeFilters();
    initializeModal();
    initializeLogout();

    loadTodayAppointments();
});

/* ======================================================
   GET ELEMENT
====================================================== */

function getElement(id) {
    return document.getElementById(id);
}

/* ======================================================
   DISPLAY TODAY'S DATE
====================================================== */

function displayCurrentDate() {
    const dateElement = getElement("currentDate");

    if (!dateElement) return;

    dateElement.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

/* ======================================================
   MOBILE SIDEBAR
====================================================== */

function initializeSidebar() {
    const menuToggle = getElement("menuToggle");
    const sidebar = getElement("sidebar");
    const overlay = getElement("overlay");

    if (!menuToggle || !sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add("active");
        overlay.classList.add("active");
        menuToggle.innerHTML = '<i class="bi bi-x-lg"></i>';
        menuToggle.setAttribute("aria-label", "Close menu");
    }

    function closeSidebar() {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        menuToggle.innerHTML = '<i class="bi bi-list"></i>';
        menuToggle.setAttribute("aria-label", "Open menu");
    }

    menuToggle.addEventListener("click", function () {
        if (sidebar.classList.contains("active")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    overlay.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSidebar();
            closeDetailsModal();
        }
    });

    sidebar.querySelectorAll("nav a").forEach(function (link) {
        link.addEventListener("click", function () {
            closeSidebar();
        });
    });
}

/* ======================================================
   LOGOUT
====================================================== */

function initializeLogout() {
    const logoutLink = getElement("logoutLink");

    if (!logoutLink) return;

    logoutLink.addEventListener("click", function (event) {
        event.preventDefault();

        const shouldLogout = window.confirm(
            "Are you sure you want to log out?"
        );

        if (!shouldLogout) return;

        localStorage.removeItem("doctor");

        /*
         * Remove these only if they are used as
         * doctor-session keys in your project.
         */
        localStorage.removeItem("doctorToken");

        window.location.href = "login.html";
    });
}

/* ======================================================
   GET LOGGED-IN DOCTOR
====================================================== */

function getLoggedInDoctor() {
    const possibleKeys = ["doctor"];

    for (const key of possibleKeys) {
        try {
            const storedData = localStorage.getItem(key);

            if (!storedData) continue;

            const doctor = JSON.parse(storedData);

            if (doctor && typeof doctor === "object") {
                return doctor;
            }
        } catch (error) {
            console.error("Unable to read doctor session:", error);
        }
    }

    return null;
}

/* ======================================================
   GET DOCTOR ID
====================================================== */

function getDoctorId(doctor) {
    if (!doctor) return "";

    const possibleIds = [
        doctor._id,
        doctor.id,
        doctor.DoctorID,
        doctor.doctorId
    ];

    for (const id of possibleIds) {
        if (id !== undefined && id !== null && String(id).trim() !== "") {
            if (typeof id === "object" && id._id) {
                return String(id._id);
            }

            return String(id);
        }
    }

    return "";
}

/* ======================================================
   NORMALIZE API RESPONSE
====================================================== */

function normalizeArray(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (response && Array.isArray(response.appointments)) {
        return response.appointments;
    }

    if (response && Array.isArray(response.data)) {
        return response.data;
    }

    if (response && response.data &&
        Array.isArray(response.data.appointments)) {
        return response.data.appointments;
    }

    return [];
}

/* ======================================================
   FETCH TODAY'S APPOINTMENTS
====================================================== */

async function loadTodayAppointments() {
    const tableBody = getElement("appointmentsTable");
    const refreshBtn = getElement("refreshBtn");

    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-message">
                    <i class="bi bi-arrow-repeat"></i>
                    Loading appointments...
                </td>
            </tr>
        `;
    }

    hideMessage();

    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = `
            <i class="bi bi-arrow-clockwise"></i>
            Loading...
        `;
    }

    try {
        const doctor = getLoggedInDoctor();
        const doctorId = getDoctorId(doctor);

        if (!doctor) {
            showMessage(
                "Doctor login information was not found. Please log in again.",
                "error"
            );

            showTableMessage("Please log in to view your appointments.");
            return;
        }

        if (!doctorId) {
            showMessage(
                "The doctor ID is missing from the saved login information.",
                "error"
            );

            showTableMessage("Unable to identify the logged-in doctor.");
            return;
        }

        const response = await fetch(
            `${APPOINTMENT_API_URL}/doctor/${encodeURIComponent(doctorId)}`
        );

        if (!response.ok) {
            throw new Error(
                `Could not load appointments. Server returned ${response.status}.`
            );
        }

        const data = await response.json();

        doctorAppointments = normalizeArray(data);

        const todayKey = getLocalDateKey(new Date());

        allTodayAppointments = doctorAppointments.filter(function (appointment) {
            const appointmentDate = getAppointmentDate(appointment);
            const appointmentStatus = normalizeStatus(
                getAppointmentStatus(appointment)
            );

            return (
                appointmentDate === todayKey &&
                !isCompletedStatus(appointmentStatus) &&
                !isCancelledStatus(appointmentStatus) &&
                belongsToDoctor(appointment, doctorId)
            );
        });

        /*
         * Sort by appointment time.
         */
        allTodayAppointments.sort(function (a, b) {
            return getAppointmentTime(a).localeCompare(
                getAppointmentTime(b)
            );
        });

        updateSummaryCounts(allTodayAppointments);
        renderAppointments(allTodayAppointments);

    } catch (error) {
        console.error("Today's appointments error:", error);

        showMessage(
            error.message ||
            "Unable to load appointments. Please try again.",
            "error"
        );

        showTableMessage(
            "Appointments could not be loaded. Check your backend server and try Refresh."
        );

        updateSummaryCounts([]);

    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = `
                <i class="bi bi-arrow-clockwise"></i>
                Refresh
            `;
        }
    }
}

/* ======================================================
   DATE HELPERS
====================================================== */

/*
 * Produces a local YYYY-MM-DD date without UTC conversion.
 * This avoids incorrectly moving an appointment to
 * the previous or next day due to timezone conversion.
 */

function getLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/* ======================================================
   GET APPOINTMENT DATE
====================================================== */

function getAppointmentDate(appointment) {
    const nested = getNestedAppointment(appointment);

    const possibleDates = [
        appointment.AppointmentDate,
        appointment.appointmentDate,
        appointment.Date,
        appointment.date,
        appointment.BookingDate,
        appointment.bookingDate,
        nested.AppointmentDate,
        nested.appointmentDate,
        nested.Date,
        nested.date
    ];

    for (const value of possibleDates) {
        const dateKey = normalizeDate(value);

        if (dateKey) return dateKey;
    }

    return "";
}

/* ======================================================
   NORMALIZE DATE
====================================================== */

function normalizeDate(value) {
    if (!value) return "";

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? "" : getLocalDateKey(value);
    }

    if (typeof value === "object") {
        if (value.$date) {
            return normalizeDate(value.$date);
        }

        return "";
    }

    const text = String(value).trim();

    /*
     * Handle ISO dates such as:
     * 2026-10-21
     * 2026-10-21T00:00:00.000Z
     */
    const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})/);

    if (isoMatch) {
        return isoMatch[1];
    }

    /*
     * Handle DD/MM/YYYY.
     */
    const localMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (localMatch) {
        const day = localMatch[1].padStart(2, "0");
        const month = localMatch[2].padStart(2, "0");
        const year = localMatch[3];

        return `${year}-${month}-${day}`;
    }

    const parsed = new Date(text);

    if (isNaN(parsed.getTime())) return "";

    return getLocalDateKey(parsed);
}

/* ======================================================
   GET NESTED APPOINTMENT
====================================================== */

function getNestedAppointment(appointment) {
    if (!appointment || typeof appointment !== "object") {
        return {};
    }

    const nested =
        appointment.AppointmentID ||
        appointment.appointment ||
        appointment.Appointment ||
        {};

    return typeof nested === "object" ? nested : {};
}

/* ======================================================
   GET APPOINTMENT TIME
====================================================== */

function getAppointmentTime(appointment) {
    const nested = getNestedAppointment(appointment);

    const possibleTimes = [
        appointment.AppointmentTime,
        appointment.appointmentTime,
        appointment.Time,
        appointment.time,
        appointment.SlotTime,
        appointment.slotTime,
        nested.AppointmentTime,
        nested.appointmentTime,
        nested.Time,
        nested.time
    ];

    for (const value of possibleTimes) {
        if (value !== undefined && value !== null && String(value).trim()) {
            return String(value).trim();
        }
    }

    return "";
}

/* ======================================================
   GET APPOINTMENT STATUS
====================================================== */

function getAppointmentStatus(appointment) {
    const nested = getNestedAppointment(appointment);

    return (
        appointment.Status ||
        appointment.status ||
        nested.Status ||
        nested.status ||
        "Pending"
    );
}

/* ======================================================
   NORMALIZE STATUS
====================================================== */

function normalizeStatus(status) {
    return String(status || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
}

/* ======================================================
   COMPLETED / CANCELLED STATUS
====================================================== */

function isCompletedStatus(status) {
    return [
        "completed",
        "complete"
    ].includes(status);
}

function isCancelledStatus(status) {
    return [
        "cancelled",
        "canceled",
        "rejected"
    ].includes(status);
}

/* ======================================================
   DOCTOR OWNERSHIP CHECK
====================================================== */

function belongsToDoctor(appointment, loggedInDoctorId) {
    const possibleDoctorValues = [
        appointment.DoctorID,
        appointment.doctorId,
        appointment.Doctor,
        appointment.doctor
    ];

    const nested = getNestedAppointment(appointment);

    possibleDoctorValues.push(
        nested.DoctorID,
        nested.doctorId,
        nested.Doctor,
        nested.doctor
    );

    /*
     * The doctor-specific endpoint should already return
     * only this doctor's appointments. If the response
     * does not include a doctor reference, trust that
     * endpoint instead of discarding the appointment.
     */

    const doctorValue = possibleDoctorValues.find(function (value) {
        return value !== undefined && value !== null && value !== "";
    });

    if (doctorValue === undefined) {
        return true;
    }

    let actualId = doctorValue;

    if (typeof doctorValue === "object") {
        actualId =
            doctorValue._id ||
            doctorValue.id ||
            doctorValue.DoctorID ||
            doctorValue.doctorId ||
            "";
    }

    if (!actualId) return false;

    return String(actualId) === String(loggedInDoctorId);
}

/* ======================================================
   GET PATIENT INFORMATION
====================================================== */

function getPatientObject(appointment) {
    const possiblePatients = [
        appointment.PatientID,
        appointment.patientId,
        appointment.Patient,
        appointment.patient
    ];

    const nested = getNestedAppointment(appointment);

    possiblePatients.push(
        nested.PatientID,
        nested.patientId,
        nested.Patient,
        nested.patient
    );

    for (const patient of possiblePatients) {
        if (patient && typeof patient === "object") {
            return patient;
        }
    }

    return {};
}

/* ======================================================
   GET PATIENT NAME
====================================================== */

function getPatientName(appointment) {
    const patient = getPatientObject(appointment);

    const fullName =
        patient.FullName ||
        patient.fullName ||
        patient.Name ||
        patient.name ||
        appointment.PatientName ||
        appointment.patientName ||
        appointment.FullName ||
        appointment.fullName ||
        "";

    if (fullName) return String(fullName);

    const firstName = patient.FirstName || patient.firstName || "";
    const lastName = patient.LastName || patient.lastName || "";

    const combinedName = `${firstName} ${lastName}`.trim();

    return combinedName || "Patient";
}

/* ======================================================
   GET PATIENT EMAIL
====================================================== */

function getPatientEmail(appointment) {
    const patient = getPatientObject(appointment);

    return (
        patient.Email ||
        patient.email ||
        appointment.PatientEmail ||
        appointment.patientEmail ||
        "Not available"
    );
}

/* ======================================================
   GET PATIENT MOBILE
====================================================== */

/* ======================================================
   GET PATIENT MOBILE NUMBER
====================================================== */

function getPatientMobile(appointment) {
    const patient = getPatientObject(appointment);

    const possibleValues = [
        patient.MobileNo,
        patient["Mobile No"],
        patient.Mobile,
        patient.mobile,
        patient.MobileNumber,
        patient.mobileNumber,
        patient.Phone,
        patient.phone,
        patient.PhoneNumber,
        patient.phoneNumber,
        patient.ContactNumber,
        patient.contactNumber,
        patient.Contact,
        patient.contact,
        appointment.PatientMobile,
        appointment.patientMobile,
        appointment.MobileNo,
        appointment["Mobile No"],
        appointment.MobileNumber,
        appointment.mobileNumber
    ];

    for (const value of possibleValues) {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            return String(value);
        }
    }

    return "Not available";
}

/* ======================================================
   GET APPOINTMENT MODE
====================================================== */

function getAppointmentMode(appointment) {
    const nested = getNestedAppointment(appointment);

    const value =
        appointment.AppointmentType ||
        appointment.appointmentType ||
        appointment.Mode ||
        appointment.mode ||
        appointment.Type ||
        appointment.type ||
        nested.AppointmentType ||
        nested.appointmentType ||
        nested.Mode ||
        nested.mode ||
        "";

    const normalized = String(value).trim().toLowerCase();

    if (
        normalized.includes("walk") ||
        normalized.includes("offline") ||
        normalized.includes("in-person") ||
        normalized.includes("in person")
    ) {
        return "Walk-in";
    }

    if (normalized.includes("online")) {
        return "Online";
    }

    return value ? String(value) : "Not specified";
}

/* ======================================================
   UPDATE SUMMARY COUNTS
====================================================== */

function updateSummaryCounts(appointments) {
    const totalElement = getElement("totalCount");
    const pendingElement = getElement("pendingCount");
    const arrivedElement = getElement("arrivedCount");

    const total = appointments.length;

    const pending = appointments.filter(function (appointment) {
        const status = normalizeStatus(getAppointmentStatus(appointment));

        return [
            "pending",
            "booked",
            "waiting",
            "scheduled"
        ].includes(status);
    }).length;

    const arrived = appointments.filter(function (appointment) {
        const status = normalizeStatus(getAppointmentStatus(appointment));

        return [
            "arrived",
            "confirmed"
        ].includes(status);
    }).length;

    if (totalElement) totalElement.textContent = total;
    if (pendingElement) pendingElement.textContent = pending;
    if (arrivedElement) arrivedElement.textContent = arrived;
}

/* ======================================================
   FILTER INITIALIZATION
====================================================== */

function initializeFilters() {
    const searchInput = getElement("searchInput");
    const statusFilter = getElement("statusFilter");
    const refreshBtn = getElement("refreshBtn");

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", applyFilters);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadTodayAppointments);
    }
}

/* ======================================================
   APPLY SEARCH AND STATUS FILTER
====================================================== */

function applyFilters() {
    const searchInput = getElement("searchInput");
    const statusFilter = getElement("statusFilter");

    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedStatus = statusFilter
        ? statusFilter.value
        : "all";

    const filteredAppointments = allTodayAppointments.filter(
        function (appointment) {
            const patientName = getPatientName(appointment).toLowerCase();

            const status = normalizeStatus(
                getAppointmentStatus(appointment)
            );

            const matchesName = patientName.includes(searchText);

            let matchesStatus = true;

            if (selectedStatus === "pending") {
                matchesStatus = [
                    "pending",
                    "booked",
                    "waiting",
                    "scheduled"
                ].includes(status);
            } else if (selectedStatus === "arrived") {
                matchesStatus = status === "arrived";
            } else if (selectedStatus === "confirmed") {
                matchesStatus = status === "confirmed";
            }

            return matchesName && matchesStatus;
        }
    );

    renderAppointments(filteredAppointments);
}

/* ======================================================
   RENDER APPOINTMENTS
====================================================== */

function renderAppointments(appointments) {
    const tableBody = getElement("appointmentsTable");

    if (!tableBody) return;

    if (!appointments.length) {
        showTableMessage(
            allTodayAppointments.length
                ? "No appointments match your search or selected filter."
                : "No active appointments are scheduled for today."
        );

        return;
    }

    tableBody.innerHTML = "";

    appointments.forEach(function (appointment) {
        const row = document.createElement("tr");

        const patientName = getPatientName(appointment);
        const patientEmail = getPatientEmail(appointment);
        const dateKey = getAppointmentDate(appointment);
        const mode = getAppointmentMode(appointment);
        const time = getAppointmentTime(appointment);
        const status = getAppointmentStatus(appointment);

        const patientCell = document.createElement("td");

        const patientInfo = document.createElement("div");
        patientInfo.className = "patient-info";

        const avatar = document.createElement("div");
        avatar.className = "patient-avatar";
        avatar.innerHTML = '<i class="bi bi-person-fill"></i>';

        const patientText = document.createElement("div");

        const nameElement = document.createElement("strong");
        nameElement.textContent = patientName;

        const emailElement = document.createElement("small");
        emailElement.textContent =
            patientEmail === "Not available"
                ? "Patient"
                : patientEmail;

        patientText.appendChild(nameElement);
        patientText.appendChild(emailElement);

        patientInfo.appendChild(avatar);
        patientInfo.appendChild(patientText);
        patientCell.appendChild(patientInfo);

        const dateCell = document.createElement("td");
        dateCell.className = "appointment-date";
        dateCell.textContent = formatDate(dateKey);

        const modeCell = document.createElement("td");
        const modeBadge = document.createElement("span");
        modeBadge.className = "appointment-mode";

        if (mode.toLowerCase().includes("walk")) {
            modeBadge.classList.add("walkin");
        } else {
            modeBadge.classList.add("online");
        }

        modeBadge.textContent = mode;
        modeCell.appendChild(modeBadge);

        const timeCell = document.createElement("td");
        timeCell.className = "appointment-time";
        timeCell.textContent = time || "Not specified";

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.className = `status ${getStatusClass(status)}`;
        statusBadge.textContent = formatStatus(status);

        statusCell.appendChild(statusBadge);

        const actionCell = document.createElement("td");

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.className = "view-btn";
        viewButton.innerHTML = '<i class="bi bi-eye"></i> View';

        viewButton.addEventListener("click", function () {
            openDetailsModal(appointment);
        });

        actionCell.appendChild(viewButton);

        row.appendChild(patientCell);
        row.appendChild(dateCell);
        row.appendChild(modeCell);
        row.appendChild(timeCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}

/* ======================================================
   FORMAT DATE
====================================================== */

function formatDate(dateKey) {
    if (!dateKey) return "Not specified";

    const parts = dateKey.split("-");

    if (parts.length !== 3) return dateKey;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/* ======================================================
   FORMAT STATUS
====================================================== */

function formatStatus(status) {
    const value = String(status || "Pending").trim();

    if (!value) return "Pending";

    return value.charAt(0).toUpperCase() + value.slice(1);
}

/* ======================================================
   GET STATUS CSS CLASS
====================================================== */

function getStatusClass(status) {
    const normalized = normalizeStatus(status);

    if (
        normalized === "pending" ||
        normalized === "booked" ||
        normalized === "waiting" ||
        normalized === "scheduled"
    ) {
        return "pending";
    }

    if (
        normalized === "arrived" ||
        normalized === "confirmed"
    ) {
        return normalized;
    }

    return "other";
}

/* ======================================================
   SHOW EMPTY TABLE MESSAGE
====================================================== */

function showTableMessage(message) {
    const tableBody = getElement("appointmentsTable");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.className = "table-message";
    cell.textContent = message;

    row.appendChild(cell);
    tableBody.appendChild(row);
}

/* ======================================================
   SHOW / HIDE MESSAGE
====================================================== */

function showMessage(message, type) {
    const messageElement = getElement("message");

    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.className = `message ${type || "info"}`;
    messageElement.hidden = false;
}

function hideMessage() {
    const messageElement = getElement("message");

    if (!messageElement) return;

    messageElement.textContent = "";
    messageElement.hidden = true;
    messageElement.className = "message";
}

/* ======================================================
   APPOINTMENT DETAILS MODAL
====================================================== */

function initializeModal() {
    const closeTop = getElement("closeModal");
    const closeBottom = getElement("closeModalBottom");
    const backdrop = getElement("detailsModal");

    if (closeTop) {
        closeTop.addEventListener("click", closeDetailsModal);
    }

    if (closeBottom) {
        closeBottom.addEventListener("click", closeDetailsModal);
    }

    if (backdrop) {
        backdrop.addEventListener("click", function (event) {
            if (event.target === backdrop) {
                closeDetailsModal();
            }
        });
    }
}

function openDetailsModal(appointment) {
    const backdrop = getElement("detailsModal");
    const modalContent = getElement("modalContent");

    if (!backdrop || !modalContent) return;

    modalContent.innerHTML = "";

    const details = [
        ["Patient Name", getPatientName(appointment)],
        ["Email", getPatientEmail(appointment)],
        ["Mobile Number", getPatientMobile(appointment)],
        ["Appointment Date", formatDate(getAppointmentDate(appointment))],
        ["Appointment Time", getAppointmentTime(appointment) || "Not specified"],
        ["Appointment Mode", getAppointmentMode(appointment)],
        ["Status", formatStatus(getAppointmentStatus(appointment))]
    ];

    details.forEach(function (detail) {
        const row = document.createElement("div");
        row.className = "detail-row";

        const label = document.createElement("span");
        label.className = "detail-label";
        label.textContent = detail[0];

        const value = document.createElement("span");
        value.className = "detail-value";
        value.textContent = detail[1] || "Not available";

        row.appendChild(label);
        row.appendChild(value);

        modalContent.appendChild(row);
    });

    backdrop.hidden = false;

    const closeButton = getElement("closeModal");
    if (closeButton) closeButton.focus();
}

function closeDetailsModal() {
    const backdrop = getElement("detailsModal");

    if (backdrop) {
        backdrop.hidden = true;
    }
}