
/* =========================================================
   DERMCARE - DOCTOR UPCOMING APPOINTMENTS
   File: doctor/js/upcoming-appointments.js

   Rules:
   1. Show appointments from tomorrow onward only.
   2. Exclude completed and cancelled appointments.
   3. Preserve the existing backend API route.
   4. Match the existing upcoming-appointments.html IDs.
========================================================= */

(function () {
    "use strict";

    // Prevent duplicate initialization.
    if (window.dermCareUpcomingAppointmentsInitialized) {
        return;
    }

    window.dermCareUpcomingAppointmentsInitialized = true;

    const API_BASE_URL = "https://dermacare-eeca.onrender.com/api";
    const APPOINTMENT_API_URL = `${API_BASE_URL}/appointments`;

    const elements = {
        currentDate: document.getElementById("currentDate"),

        totalCount: document.getElementById("totalCount"),
        pendingCount: document.getElementById("pendingCount"),
        confirmedCount: document.getElementById("confirmedCount"),

        refreshBtn: document.getElementById("refreshBtn"),
        searchInput: document.getElementById("searchInput"),
        statusFilter: document.getElementById("statusFilter"),

        message: document.getElementById("message"),
        appointmentsTable: document.getElementById("appointmentsTable"),

        menuToggle: document.getElementById("menuToggle"),
        sidebar: document.getElementById("sidebar"),
        overlay: document.getElementById("overlay"),
        logoutLink: document.getElementById("logoutLink"),

        detailsModal: document.getElementById("detailsModal"),
        closeModal: document.getElementById("closeModal"),
        closeModalBottom: document.getElementById("closeModalBottom"),
        modalContent: document.getElementById("modalContent")
    };

    let allAppointments = [];
    let filteredAppointments = [];

    /* =====================================================
       GENERAL HELPERS
    ===================================================== */

    function getValue(object, keys) {
        if (!object || typeof object !== "object") {
            return "";
        }

        for (const key of keys) {
            const value = object[key];

            if (
                value !== undefined &&
                value !== null &&
                typeof value !== "object" &&
                String(value).trim() !== ""
            ) {
                return value;
            }
        }

        return "";
    }

    function getNestedAppointment(appointment) {
        if (!appointment || typeof appointment !== "object") {
            return {};
        }

        const nested =
            appointment.AppointmentID ||
            appointment.appointment ||
            appointment.Appointment ||
            appointment.appointmentDetails ||
            {};

        return nested && typeof nested === "object" ? nested : {};
    }

    function getAppointmentValues(appointment, keys) {
        const nested = getNestedAppointment(appointment);

        return (
            getValue(appointment, keys) ||
            getValue(nested, keys)
        );
    }

    function normalizeText(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const replacements = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return replacements[character];
        });
    }

    function getStoredDoctor() {
        try {
            const doctorData = localStorage.getItem("doctor");

            return doctorData ? JSON.parse(doctorData) : null;
        } catch (error) {
            console.error("Unable to read logged-in doctor:", error);
            return null;
        }
    }

    function getDoctorId(doctor) {
        if (!doctor) {
            return "";
        }

        return (
            doctor._id ||
            doctor.id ||
            doctor.DoctorID ||
            doctor.doctorId ||
            ""
        );
    }

    /* =====================================================
       CURRENT DATE
    ===================================================== */

    function getLocalDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function displayCurrentDate() {
        if (!elements.currentDate) {
            return;
        }

        elements.currentDate.textContent =
            new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
    }

    /* =====================================================
       APPOINTMENT DATE HANDLING
    ===================================================== */

    function getAppointmentDate(appointment) {
        const value = getAppointmentValues(appointment, [
            "AppointmentDate",
            "appointmentDate",
            "Date",
            "date",
            "BookingDate",
            "bookingDate"
        ]);

        if (!value) {
            return "";
        }

        // Support MongoDB extended JSON dates.
        const rawValue =
            typeof value === "object" && value.$date
                ? value.$date
                : value;

        const text = String(rawValue).trim();

        // ISO date: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
        const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (isoMatch) {
            return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
        }

        // DD/MM/YYYY or DD-MM-YYYY.
        const localMatch = text.match(
            /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
        );

        if (localMatch) {
            const day = Number(localMatch[1]);
            const month = Number(localMatch[2]);
            const year = Number(localMatch[3]);

            const parsed = new Date(year, month - 1, day);

            if (
                parsed.getFullYear() === year &&
                parsed.getMonth() === month - 1 &&
                parsed.getDate() === day
            ) {
                return getLocalDateKey(parsed);
            }

            return "";
        }

        // Last-resort parsing for other valid date formats.
        const parsed = new Date(text);

        if (Number.isNaN(parsed.getTime())) {
            return "";
        }

        return getLocalDateKey(parsed);
    }

    function formatDate(dateKey) {
        if (!dateKey) {
            return "—";
        }

        const parts = dateKey.split("-").map(Number);

        if (parts.length !== 3 || parts.some(Number.isNaN)) {
            return "—";
        }

        const date = new Date(parts[0], parts[1] - 1, parts[2]);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    /* =====================================================
       APPOINTMENT TIME
    ===================================================== */

    function getAppointmentTime(appointment) {
        return String(
            getAppointmentValues(appointment, [
                "AppointmentTime",
                "appointmentTime",
                "Time",
                "time",
                "SlotTime",
                "slotTime"
            ]) || "—"
        );
    }

    /* =====================================================
       PATIENT DETAILS
    ===================================================== */

    function getPatientObject(appointment) {
        if (!appointment || typeof appointment !== "object") {
            return {};
        }

        const nested = getNestedAppointment(appointment);

        const candidates = [
            appointment.Patient,
            appointment.patient,
            appointment.PatientID,
            appointment.patientId,
            nested.Patient,
            nested.patient,
            nested.PatientID,
            nested.patientId
        ];

        for (const candidate of candidates) {
            if (candidate && typeof candidate === "object") {
                return candidate;
            }
        }

        return {};
    }

    function getPatientName(appointment) {
        const patient = getPatientObject(appointment);

        return (
            getValue(patient, [
                "FullName",
                "fullName",
                "Name",
                "name",
                "PatientName",
                "patientName"
            ]) ||
            getAppointmentValues(appointment, [
                "PatientName",
                "patientName",
                "FullName",
                "fullName",
                "Name",
                "name"
            ]) ||
            "Unknown Patient"
        );
    }

    function getPatientEmail(appointment) {
        const patient = getPatientObject(appointment);

        return (
            getValue(patient, ["Email", "email"]) ||
            getAppointmentValues(appointment, [
                "PatientEmail",
                "patientEmail",
                "Email",
                "email"
            ]) ||
            ""
        );
    }

    function getPatientMobile(appointment) {
        const patient = getPatientObject(appointment);

        return (
            getValue(patient, [
                "MobileNo",
                "mobileNo",
                "Mobile",
                "mobile",
                "Phone",
                "phone",
                "PhoneNumber",
                "phoneNumber"
            ]) ||
            getAppointmentValues(appointment, [
                "PatientMobile",
                "patientMobile",
                "MobileNo",
                "mobileNo",
                "Mobile",
                "mobile",
                "Phone",
                "phone"
            ]) ||
            "—"
        );
    }

    /* =====================================================
       STATUS AND APPOINTMENT MODE
    ===================================================== */

    function getAppointmentStatus(appointment) {
        return String(
            getAppointmentValues(appointment, [
                "Status",
                "status",
                "AppointmentStatus",
                "appointmentStatus"
            ]) || "Pending"
        ).trim();
    }

    function getNormalizedStatus(appointment) {
        return normalizeText(getAppointmentStatus(appointment));
    }

    function isCancelledStatus(status) {
        return [
            "cancelled",
            "canceled",
            "rejected"
        ].includes(normalizeText(status));
    }

    function isCompletedStatus(status) {
        return [
            "completed",
            "complete"
        ].includes(normalizeText(status));
    }

    function isExcludedStatus(status) {
        return (
            isCancelledStatus(status) ||
            isCompletedStatus(status)
        );
    }

    function isPendingStatus(status) {
        return [
            "pending",
            "booked",
            "waiting",
            "scheduled"
        ].includes(normalizeText(status));
    }

    function isConfirmedStatus(status) {
        return [
            "confirmed",
            "arrived"
        ].includes(normalizeText(status));
    }

    function getStatusClass(status) {
        const normalized = normalizeText(status);

        if (isPendingStatus(normalized)) {
            return "pending";
        }

        if (normalized === "arrived") {
            return "arrived";
        }

        if (normalized === "confirmed") {
            return "confirmed";
        }

        return "default";
    }

    function getAppointmentMode(appointment) {
        const mode = getAppointmentValues(appointment, [
            "AppointmentType",
            "appointmentType",
            "Mode",
            "mode",
            "Type",
            "type"
        ]);

        const normalized = normalizeText(mode);

        if (normalized.includes("walkin")) {
            return "Walk-in";
        }

        if (normalized.includes("online")) {
            return "Online";
        }

        return mode ? String(mode) : "—";
    }

    /* =====================================================
       DOCTOR MATCHING
    ===================================================== */

    function belongsToDoctor(appointment, doctorId) {
        const nested = getNestedAppointment(appointment);

        const doctorReference =
            appointment.DoctorID ??
            appointment.doctorId ??
            appointment.Doctor ??
            appointment.doctor ??
            nested.DoctorID ??
            nested.doctorId ??
            nested.Doctor ??
            nested.doctor;

        // The backend route is already scoped to this doctor.
        if (
            doctorReference === undefined ||
            doctorReference === null ||
            doctorReference === ""
        ) {
            return true;
        }

        let referencedId = doctorReference;

        if (typeof doctorReference === "object") {
            referencedId =
                doctorReference._id ||
                doctorReference.id ||
                doctorReference.DoctorID ||
                doctorReference.doctorId ||
                "";
        }

        return String(referencedId) === String(doctorId);
    }

    /* =====================================================
       API RESPONSE NORMALIZATION
    ===================================================== */

    function normalizeAppointments(response) {
        if (Array.isArray(response)) {
            return response;
        }

        if (response && Array.isArray(response.appointments)) {
            return response.appointments;
        }

        if (response && Array.isArray(response.data)) {
            return response.data;
        }

        if (
            response &&
            response.data &&
            Array.isArray(response.data.appointments)
        ) {
            return response.data.appointments;
        }

        if (response && Array.isArray(response.results)) {
            return response.results;
        }

        return [];
    }

    /* =====================================================
       MESSAGES
    ===================================================== */

    function showMessage(message, type = "info") {
        if (!elements.message) {
            return;
        }

        elements.message.textContent = message;
        elements.message.className = `message ${type}`;
        elements.message.style.display = "block";
    }

    function hideMessage() {
        if (!elements.message) {
            return;
        }

        elements.message.textContent = "";
        elements.message.style.display = "none";
    }

    /* =====================================================
       SUMMARY CARDS
    ===================================================== */

    function updateSummary(appointments) {
        if (elements.totalCount) {
            elements.totalCount.textContent = appointments.length;
        }

        if (elements.pendingCount) {
            elements.pendingCount.textContent =
                appointments.filter(appointment =>
                    isPendingStatus(getAppointmentStatus(appointment))
                ).length;
        }

        if (elements.confirmedCount) {
            elements.confirmedCount.textContent =
                appointments.filter(appointment =>
                    isConfirmedStatus(getAppointmentStatus(appointment))
                ).length;
        }
    }

    /* =====================================================
       SORTING
    ===================================================== */

    function sortAppointments(appointments) {
        return appointments.sort((a, b) => {
            const dateA = getAppointmentDate(a);
            const dateB = getAppointmentDate(b);

            if (dateA !== dateB) {
                return dateA.localeCompare(dateB);
            }

            return getAppointmentTime(a).localeCompare(
                getAppointmentTime(b),
                undefined,
                { numeric: true }
            );
        });
    }

    /* =====================================================
       UPCOMING APPOINTMENTS FILTER
    ===================================================== */

    function getUpcomingAppointments(appointments) {
        const todayKey = getLocalDateKey(new Date());

        return appointments.filter(appointment => {
            const dateKey = getAppointmentDate(appointment);
            const status = getAppointmentStatus(appointment);

            // Upcoming means strictly after today.
            if (!dateKey || dateKey <= todayKey) {
                return false;
            }

            // Do not show completed or cancelled appointments.
            if (isExcludedStatus(status)) {
                return false;
            }

            return true;
        });
    }

    /* =====================================================
       TABLE RENDERING
    ===================================================== */

    
function createPatientCell(appointment) {
    const name = getPatientName(appointment);
    const initial = name.charAt(0).toUpperCase();

    return `
        <div class="patient-cell">
            <div class="patient-avatar">${escapeHTML(initial)}</div>
            <div class="patient-details">
                <div class="patient-name">${escapeHTML(name)}</div>
            </div>
        </div>
    `;
}


    
function createAppointmentRow(appointment, index) {
    const name = getPatientName(appointment);
    const dateKey = getAppointmentDate(appointment);
    const time = getAppointmentTime(appointment);
    const mode = getAppointmentMode(appointment);
    const status = getAppointmentStatus(appointment);

    const doctor = getValue(appointment, [
        "DoctorName",
        "doctorName"
    ]) || getValue(getNestedAppointment(appointment), [
        "DoctorName",
        "doctorName"
    ]) || (
        appointment.Doctor && typeof appointment.Doctor === "object"
            ? getValue(appointment.Doctor, ["FullName", "fullName", "Name", "name"])
            : ""
    ) || (
        appointment.doctor && typeof appointment.doctor === "object"
            ? getValue(appointment.doctor, ["FullName", "fullName", "Name", "name"])
            : ""
    ) || "—";

    return `
        <tr>
            <td>${escapeHTML(name)}</td>
            <td>${escapeHTML(doctor)}</td>
            <td>${escapeHTML(formatDate(dateKey))}</td>
            <td>${escapeHTML(time)}</td>
            <td>
                <span class="type-badge">
                    ${escapeHTML(mode)}
                </span>
            </td>
            <td>${escapeHTML(status)}</td>
            <td>
                <span class="upcoming-label">
                    <i class="bi bi-calendar-check"></i>
                    Upcoming
                </span>
            </td>
        </tr>
    `;
}

    function renderAppointments(appointments) {
        if (!elements.appointmentsTable) {
            console.error(
                'The HTML element "appointmentsTable" was not found.'
            );
            return;
        }

        if (!appointments.length) {
            elements.appointmentsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="bi bi-calendar-check"></i>
                        <p>No upcoming appointments found.</p>
                    </td>
                </tr>
            `;

            return;
        }

        elements.appointmentsTable.innerHTML = appointments
            .map((appointment, index) =>
                createAppointmentRow(appointment, index)
            )
            .join("");
    }

    /* =====================================================
       SEARCH AND STATUS FILTER
    ===================================================== */

    function applyFilters() {
        const searchTerm = elements.searchInput
            ? elements.searchInput.value.trim().toLowerCase()
            : "";

        const selectedStatus = elements.statusFilter
            ? elements.statusFilter.value
            : "all";

        filteredAppointments = allAppointments.filter(appointment => {
            const patientName = getPatientName(appointment).toLowerCase();
            const patientEmail = getPatientEmail(appointment).toLowerCase();
            const patientMobile = String(
                getPatientMobile(appointment)
            ).toLowerCase();

            const matchesSearch =
                !searchTerm ||
                patientName.includes(searchTerm) ||
                patientEmail.includes(searchTerm) ||
                patientMobile.includes(searchTerm);

            const normalizedStatus = normalizeText(
                getAppointmentStatus(appointment)
            );

            let matchesStatus = true;

            if (selectedStatus === "pending") {
                matchesStatus = isPendingStatus(normalizedStatus);
            } else if (selectedStatus === "arrived") {
                matchesStatus = normalizedStatus === "arrived";
            } else if (selectedStatus === "confirmed") {
                matchesStatus = normalizedStatus === "confirmed";
            }

            return matchesSearch && matchesStatus;
        });

        renderAppointments(filteredAppointments);
    }

    /* =====================================================
       APPOINTMENT DETAILS MODAL
    ===================================================== */

    function openAppointmentDetails(appointment) {
        if (!elements.detailsModal || !elements.modalContent) {
            console.error("Appointment details modal elements are missing.");
            return;
        }

        const name = getPatientName(appointment);
        const email = getPatientEmail(appointment);
        const mobile = getPatientMobile(appointment);
        const date = formatDate(getAppointmentDate(appointment));
        const time = getAppointmentTime(appointment);
        const mode = getAppointmentMode(appointment);
        const status = getAppointmentStatus(appointment);

        elements.modalContent.innerHTML = `
            <div class="appointment-details">
                <div class="detail-row">
                    <span>Patient Name</span>
                    <strong>${escapeHTML(name)}</strong>
                </div>

                <div class="detail-row">
                    <span>Email</span>
                    <strong>${escapeHTML(email || "—")}</strong>
                </div>

                <div class="detail-row">
                    <span>Mobile Number</span>
                    <strong>${escapeHTML(mobile)}</strong>
                </div>

                <div class="detail-row">
                    <span>Appointment Date</span>
                    <strong>${escapeHTML(date)}</strong>
                </div>

                <div class="detail-row">
                    <span>Appointment Time</span>
                    <strong>${escapeHTML(time)}</strong>
                </div>

                <div class="detail-row">
                    <span>Appointment Mode</span>
                    <strong>${escapeHTML(mode)}</strong>
                </div>

                <div class="detail-row">
                    <span>Status</span>
                    <strong>${escapeHTML(status)}</strong>
                </div>
            </div>
        `;

        elements.detailsModal.style.display = "flex";
        elements.detailsModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeAppointmentDetails() {
        if (!elements.detailsModal) {
            return;
        }

        elements.detailsModal.style.display = "none";
        elements.detailsModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function initializeModal() {
        if (elements.closeModal) {
            elements.closeModal.addEventListener(
                "click",
                closeAppointmentDetails
            );
        }

        if (elements.closeModalBottom) {
            elements.closeModalBottom.addEventListener(
                "click",
                closeAppointmentDetails
            );
        }

        if (elements.detailsModal) {
            elements.detailsModal.addEventListener("click", event => {
                if (event.target === elements.detailsModal) {
                    closeAppointmentDetails();
                }
            });
        }

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeAppointmentDetails();
                closeSidebar();
            }
        });

        if (elements.appointmentsTable) {
            elements.appointmentsTable.addEventListener("click", event => {
                const button = event.target.closest(
                    "[data-appointment-index]"
                );

                if (!button) {
                    return;
                }

                const index = Number(
                    button.getAttribute("data-appointment-index")
                );

                const appointment = filteredAppointments[index];

                if (appointment) {
                    openAppointmentDetails(appointment);
                }
            });
        }
    }

    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    function openSidebar() {
        if (elements.sidebar) {
            elements.sidebar.classList.add("active");
        }

        if (elements.overlay) {
            elements.overlay.classList.add("active");
        }

        if (elements.menuToggle) {
            elements.menuToggle.setAttribute("aria-expanded", "true");

            const icon = elements.menuToggle.querySelector("i");

            if (icon) {
                icon.classList.remove("bi-list");
                icon.classList.add("bi-x-lg");
            }
        }
    }

    function closeSidebar() {
        if (elements.sidebar) {
            elements.sidebar.classList.remove("active");
        }

        if (elements.overlay) {
            elements.overlay.classList.remove("active");
        }

        if (elements.menuToggle) {
            elements.menuToggle.setAttribute("aria-expanded", "false");

            const icon = elements.menuToggle.querySelector("i");

            if (icon) {
                icon.classList.remove("bi-x-lg");
                icon.classList.add("bi-list");
            }
        }
    }

    function initializeSidebar() {
        if (elements.menuToggle) {
            elements.menuToggle.addEventListener("click", () => {
                const isOpen =
                    elements.sidebar &&
                    elements.sidebar.classList.contains("active");

                if (isOpen) {
                    closeSidebar();
                } else {
                    openSidebar();
                }
            });
        }

        if (elements.overlay) {
            elements.overlay.addEventListener("click", closeSidebar);
        }

        if (elements.sidebar) {
            elements.sidebar
                .querySelectorAll("a")
                .forEach(link => {
                    link.addEventListener("click", closeSidebar);
                });
        }
    }

    /* =====================================================
       LOGOUT
    ===================================================== */

    function initializeLogout() {
        if (!elements.logoutLink) {
            return;
        }

        elements.logoutLink.addEventListener("click", event => {
            event.preventDefault();

            localStorage.removeItem("doctor");
            localStorage.removeItem("doctorToken");

            window.location.href = "login.html";
        });
    }

    /* =====================================================
       LOAD APPOINTMENTS
    ===================================================== */

    async function loadAppointments() {
        const doctor = getStoredDoctor();
        const doctorId = getDoctorId(doctor);

        if (!doctorId) {
            allAppointments = [];
            filteredAppointments = [];

            updateSummary([]);
            renderAppointments([]);

            showMessage(
                "Doctor login information was not found. Please log in again.",
                "error"
            );

            return;
        }

        if (elements.refreshBtn) {
            elements.refreshBtn.disabled = true;
            elements.refreshBtn.setAttribute("aria-busy", "true");
        }

        if (elements.appointmentsTable) {
            elements.appointmentsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-state">
                        <i class="bi bi-arrow-repeat"></i>
                        Loading upcoming appointments...
                    </td>
                </tr>
            `;
        }

        hideMessage();

        try {
            const response = await fetch(
                `${APPOINTMENT_API_URL}/doctor/${encodeURIComponent(doctorId)}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Unable to load appointments. Server returned ${response.status}.`
                );
            }

            const responseData = await response.json();

            const appointments = normalizeAppointments(responseData)
                .filter(appointment =>
                    belongsToDoctor(appointment, doctorId)
                );

            allAppointments = sortAppointments(
                getUpcomingAppointments(appointments)
            );

            updateSummary(allAppointments);
            applyFilters();

            if (!allAppointments.length) {
                showMessage(
                    "There are no upcoming appointments scheduled for future dates.",
                    "info"
                );
            }
        } catch (error) {
            console.error(
                "Error loading upcoming appointments:",
                error
            );

            allAppointments = [];
            filteredAppointments = [];

            updateSummary([]);
            renderAppointments([]);

            showMessage(
                error.message ||
                    "Unable to load appointments. Please try again.",
                "error"
            );
        } finally {
            if (elements.refreshBtn) {
                elements.refreshBtn.disabled = false;
                elements.refreshBtn.removeAttribute("aria-busy");
            }
        }
    }

    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    function initializeFilters() {
        if (elements.searchInput) {
            elements.searchInput.addEventListener(
                "input",
                applyFilters
            );
        }

        if (elements.statusFilter) {
            elements.statusFilter.addEventListener(
                "change",
                applyFilters
            );
        }

        if (elements.refreshBtn) {
            elements.refreshBtn.addEventListener(
                "click",
                loadAppointments
            );
        }
    }

    /* =====================================================
       INITIALIZE PAGE
    ===================================================== */

    function initialize() {
        displayCurrentDate();
        initializeSidebar();
        initializeLogout();
        initializeModal();
        initializeFilters();

        loadAppointments();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();
