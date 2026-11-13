
 // =======================================================
// DERMCARE - RECEPTIONIST DASHBOARD JAVASCRIPT
// =======================================================


// =======================================================
// API BASE URL
// =======================================================

const API_URL = "http://localhost:5000/api";


// =======================================================
// GET PAGE ELEMENTS
// =======================================================

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");

const receptionistName =
    document.getElementById("receptionistName");

const currentDate =
    document.getElementById("currentDate");

const totalDoctors =
    document.getElementById("totalDoctors");

const totalPatients =
    document.getElementById("totalPatients");

const todaysAppointments =
    document.getElementById("todaysAppointments");

const upcomingAppointments =
    document.getElementById("upcomingAppointments");

const cancelledAppointments =
    document.getElementById("cancelledAppointments");

const recentAppointmentsBody =
    document.getElementById("recentAppointmentsBody");

const logoutLink =
    document.getElementById("logoutLink");


// =======================================================
// PAGE LOAD
// =======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        showCurrentDate();

        showReceptionistName();

        loadDashboardData();

        setupMobileMenu();

        setupLogout();

    }
);


// =======================================================
// SHOW CURRENT DATE
// =======================================================

function showCurrentDate() {

    if (!currentDate) return;

    const today = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    currentDate.textContent =
        today.toLocaleDateString("en-IN", options);

}


// =======================================================
// SHOW RECEPTIONIST NAME WITHOUT "CLINIC" PREFIX
// =======================================================

function showReceptionistName() {

    const receptionistData =
        localStorage.getItem("receptionist");

    if (!receptionistName) return;

    if (!receptionistData) {
        receptionistName.textContent = "Receptionist";
        return;
    }

    try {

        const receptionist =
            JSON.parse(receptionistData);

        const fullName =
            receptionist.FullName ||
            receptionist.fullName ||
            "Receptionist";

        receptionistName.textContent =
            fullName.replace(/^Clinic\s+/i, "").trim() ||
            "Receptionist";

    }

    catch (error) {

        console.error(
            "Error reading receptionist data:",
            error
        );

        receptionistName.textContent = "Receptionist";

    }

}

// =======================================================
// LOAD ALL DASHBOARD DATA
// =======================================================

async function loadDashboardData() {

    try {

        await Promise.all([
            loadDoctors(),
            loadPatients(),
            loadAppointments()
        ]);

    }

    catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


// =======================================================
// LOAD TOTAL DOCTORS
// =======================================================

async function loadDoctors() {

    try {

        const response =
            await fetch(`${API_URL}/doctors`);

        if (!response.ok) {
            throw new Error("Unable to load doctors");
        }

        const data = await response.json();

        let doctors = [];

        if (Array.isArray(data)) {
            doctors = data;
        }

        else if (Array.isArray(data.doctors)) {
            doctors = data.doctors;
        }

        if (totalDoctors) {
            totalDoctors.textContent = doctors.length;
        }

    }

    catch (error) {

        console.error("Error loading doctors:", error);

        if (totalDoctors) {
            totalDoctors.textContent = "0";
        }

    }

}


// =======================================================
// LOAD TOTAL PATIENTS
// =======================================================

async function loadPatients() {

    try {

        const response =
            await fetch(`${API_URL}/patients`);

        if (!response.ok) {
            throw new Error("Unable to load patients");
        }

        const data = await response.json();

        let patients = [];

        if (Array.isArray(data)) {
            patients = data;
        }

        else if (Array.isArray(data.patients)) {
            patients = data.patients;
        }

        if (totalPatients) {
            totalPatients.textContent = patients.length;
        }

    }

    catch (error) {

        console.error("Error loading patients:", error);

        if (totalPatients) {
            totalPatients.textContent = "0";
        }

    }

}


// =======================================================
// LOAD APPOINTMENTS
// =======================================================

async function loadAppointments() {

    try {

        const response =
            await fetch(`${API_URL}/appointments`);

        if (!response.ok) {
            throw new Error("Unable to load appointments");
        }

        const data = await response.json();

        let appointments = [];

        if (Array.isArray(data)) {
            appointments = data;
        }

        else if (Array.isArray(data.appointments)) {
            appointments = data.appointments;
        }

        // Update dashboard count cards
        updateAppointmentCounts(appointments);

        // Display ALL active appointments in Dashboard table
        displayRecentAppointments(appointments);

    }

    catch (error) {

        console.error("Error loading appointments:", error);

        if (todaysAppointments) {
            todaysAppointments.textContent = "0";
        }

        if (upcomingAppointments) {
            upcomingAppointments.textContent = "0";
        }

        if (cancelledAppointments) {
            cancelledAppointments.textContent = "0";
        }

        if (recentAppointmentsBody) {

            recentAppointmentsBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-row">
                        Unable to load appointments.
                    </td>
                </tr>
            `;

        }

    }

}


// =======================================================
// GET NORMALIZED APPOINTMENT STATUS
// =======================================================

function getAppointmentStatus(appointment) {

    return (
        appointment.Status ||
        appointment.status ||
        ""
    )
        .toString()
        .trim()
        .toLowerCase();

}


// =======================================================
// CHECK IF APPOINTMENT IS ACTIVE
// Only Booked and Arrived appointments are active
// =======================================================

function isActiveAppointment(appointment) {

    const status = getAppointmentStatus(appointment);

    // Cancelled appointments must never appear in the table.
    if (
        status === "cancelled" ||
        status === "canceled"
    ) {
        return false;
    }

    return (
        status === "booked" ||
        status === "arrived"
    );

}


// =======================================================
// UPDATE APPOINTMENT COUNTS
// Completed appointments are excluded
// Cancelled count remains available
// =======================================================

function updateAppointmentCounts(appointments) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    let todayCount = 0;

    let upcomingCount = 0;

    let cancelledCount = 0;

    appointments.forEach(appointment => {

        const status = getAppointmentStatus(appointment);

        // Cancelled count card
        if (
            status === "cancelled" ||
            status === "canceled"
        ) {

            cancelledCount++;
            return;

        }

        // Count only active appointments
        if (!isActiveAppointment(appointment)) {
            return;
        }

        const appointmentDate =
            getAppointmentDate(appointment);

        if (!appointmentDate) return;

        // Today's active appointments
        if (appointmentDate.getTime() === today.getTime()) {
            todayCount++;
        }

        // Future active appointments
        if (appointmentDate >= tomorrow) {
            upcomingCount++;
        }

    });

    if (todaysAppointments) {
        todaysAppointments.textContent = todayCount;
    }

    if (upcomingAppointments) {
        upcomingAppointments.textContent = upcomingCount;
    }

    if (cancelledAppointments) {
        cancelledAppointments.textContent = cancelledCount;
    }

}


// =======================================================
// GET APPOINTMENT DATE
// =======================================================

function getAppointmentDate(appointment) {

    const dateValue =
        appointment.AppointmentDate ||
        appointment.appointmentDate ||
        appointment.Date ||
        appointment.date;

    if (!dateValue) return null;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return null;

    date.setHours(0, 0, 0, 0);

    return date;

}


// =======================================================
// DISPLAY ACTIVE APPOINTMENTS IN DASHBOARD
// Displays ALL Booked + Arrived appointments
// Across all dates, without a 5-row limit
// =======================================================

function displayRecentAppointments(appointments) {

    if (!recentAppointmentsBody) return;

    // Filter out Completed, Cancelled, and other statuses
    const activeAppointments =
        (appointments || [])
            .filter(appointment =>
                isActiveAppointment(appointment)
            );

    // Show empty message when no active appointments exist
    if (activeAppointments.length === 0) {

        recentAppointmentsBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    No active appointments found.
                </td>
            </tr>
        `;

        return;

    }

    // Sort by appointment date, nearest date first
    const sortedAppointments =
        [...activeAppointments].sort(
            (firstAppointment, secondAppointment) => {

                const firstDate =
                    getAppointmentDate(firstAppointment);

                const secondDate =
                    getAppointmentDate(secondAppointment);

                const firstTime =
                    firstDate ? firstDate.getTime() : 0;

                const secondTime =
                    secondDate ? secondDate.getTime() : 0;

                return firstTime - secondTime;

            }
        );

    recentAppointmentsBody.innerHTML = "";

    // Render EVERY active appointment
    // No .slice() limit — all matching records are displayed
    sortedAppointments.forEach(appointment => {

        // Patient name
        const patientName =
            getPatientName(appointment);

        // Doctor name
        const doctorName =
            getDoctorName(appointment);

        // Appointment date
        const appointmentDate =
            getAppointmentDate(appointment);

        const formattedDate =
            appointmentDate
                ? appointmentDate.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                )
                : "-";

        // Appointment time
        const appointmentTime =
            appointment.Time ||
            appointment.time ||
            appointment.AppointmentTime ||
            appointment.appointmentTime ||
            "-";

        // Appointment type
        const appointmentType =
            appointment.Type ||
            appointment.type ||
            appointment.AppointmentType ||
            appointment.appointmentType ||
            "Online";

        // Appointment status
        const appointmentStatus =
            appointment.Status ||
            appointment.status ||
            "Booked";

        // Create table row
        const row = document.createElement("tr");

        row.innerHTML = `

            <td>
                ${escapeHtml(patientName)}
            </td>

            <td>
                ${escapeHtml(doctorName)}
            </td>

            <td>
                ${formattedDate}
            </td>

            <td>
                ${escapeHtml(appointmentTime)}
            </td>

            <td>
                ${getAppointmentTypeBadge(appointmentType)}
            </td>

            <td>
                <span class="status-badge ${getStatusClass(appointmentStatus)}">
                    ${escapeHtml(appointmentStatus)}
                </span>
            </td>

        `;

        recentAppointmentsBody.appendChild(row);

    });

}


// =======================================================
// GET PATIENT NAME
// =======================================================

function getPatientName(appointment) {

    if (
        appointment.PatientID &&
        typeof appointment.PatientID === "object"
    ) {

        return (
            appointment.PatientID.FullName ||
            appointment.PatientID.fullName ||
            "Unknown Patient"
        );

    }

    if (
        appointment.Patient &&
        typeof appointment.Patient === "object"
    ) {

        return (
            appointment.Patient.FullName ||
            appointment.Patient.fullName ||
            "Unknown Patient"
        );

    }

    if (
        appointment.patient &&
        typeof appointment.patient === "object"
    ) {

        return (
            appointment.patient.FullName ||
            appointment.patient.fullName ||
            "Unknown Patient"
        );

    }

    return (
        appointment.PatientName ||
        appointment.patientName ||
        "Unknown Patient"
    );

}


// =======================================================
// GET DOCTOR NAME
// =======================================================

function getDoctorName(appointment) {

    if (
        appointment.DoctorID &&
        typeof appointment.DoctorID === "object"
    ) {

        return (
            appointment.DoctorID.FullName ||
            appointment.DoctorID.fullName ||
            "Unknown Doctor"
        );

    }

    if (
        appointment.Doctor &&
        typeof appointment.Doctor === "object"
    ) {

        return (
            appointment.Doctor.FullName ||
            appointment.Doctor.fullName ||
            "Unknown Doctor"
        );

    }

    if (
        appointment.doctor &&
        typeof appointment.doctor === "object"
    ) {

        return (
            appointment.doctor.FullName ||
            appointment.doctor.fullName ||
            "Unknown Doctor"
        );

    }

    return (
        appointment.DoctorName ||
        appointment.doctorName ||
        "Unknown Doctor"
    );

}


// =======================================================
// GET APPOINTMENT TYPE BADGE
// UPDATED: Online blue, Walk-in purple
// =======================================================

function getAppointmentTypeBadge(appointmentType) {

    const normalizedType = String(appointmentType || "")
        .trim()
        .toLowerCase();

    if (normalizedType === "online") {

        return `
            <span class="appointment-type online">
                Online
            </span>
        `;

    }

    if (
        normalizedType === "walk-in" ||
        normalizedType === "walkin"
    ) {

        return `
            <span class="appointment-type walkin">
                Walk-in
            </span>
        `;

    }

    return `
        <span class="appointment-type">
            ${escapeHtml(appointmentType || "-")}
        </span>
    `;

}


// =======================================================
// GET STATUS CSS CLASS
// =======================================================

function getStatusClass(status) {

    const normalizedStatus =
        status.toString().trim().toLowerCase();

    if (normalizedStatus === "booked") {
        return "status-confirmed";
    }

    if (normalizedStatus === "confirmed") {
        return "status-confirmed";
    }

    if (normalizedStatus === "arrived") {
        return "status-confirmed";
    }

    if (normalizedStatus === "completed") {
        return "status-completed";
    }

    if (
        normalizedStatus === "cancelled" ||
        normalizedStatus === "canceled"
    ) {
        return "status-cancelled";
    }

    return "status-pending";

}


// =======================================================
// ESCAPE HTML
// =======================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "-";
    }

    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent = value;

    return temporaryElement.innerHTML;

}


// =======================================================
// SETUP MOBILE MENU
// =======================================================

function setupMobileMenu() {

    if (!menuToggle || !sidebar || !overlay) {
        return;
    }

    menuToggle.addEventListener("click", () => {

        const isOpen =
            sidebar.classList.contains("mobile-open");

        if (isOpen) {
            closeMobileMenu();
        }

        else {
            openMobileMenu();
        }

    });

    overlay.addEventListener(
        "click",
        closeMobileMenu
    );

}


// =======================================================
// OPEN MOBILE MENU
// =======================================================

function openMobileMenu() {

    sidebar.classList.add("mobile-open");

    overlay.classList.add("show");

    menuToggle.classList.add("menu-open");

    menuToggle.innerHTML =
        '<i class="bi bi-x-lg"></i>';

    menuToggle.setAttribute(
        "aria-expanded",
        "true"
    );

    menuToggle.setAttribute(
        "aria-label",
        "Close menu"
    );

}


// =======================================================
// CLOSE MOBILE MENU
// =======================================================

function closeMobileMenu() {

    sidebar.classList.remove("mobile-open");

    overlay.classList.remove("show");

    menuToggle.classList.remove("menu-open");

    menuToggle.innerHTML =
        '<i class="bi bi-list"></i>';

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    menuToggle.setAttribute(
        "aria-label",
        "Open menu"
    );

}


// =======================================================
// SETUP LOGOUT
// =======================================================

function setupLogout() {

    if (!logoutLink) return;

    logoutLink.addEventListener("click", function (event) {

        event.preventDefault();

        // Clear receptionist login information
        localStorage.removeItem("receptionist");
        localStorage.removeItem("receptionistId");
        localStorage.removeItem("receptionistData");

        // Redirect to receptionist login page
        window.location.href = "receptionist-login.html";

    });

}
