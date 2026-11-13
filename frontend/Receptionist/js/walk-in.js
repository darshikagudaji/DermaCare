
/* =======================================================
   DERMCARE - RECEPTIONIST WALK-IN JAVASCRIPT
   FILE: receptionist/js/walk-in.js
======================================================= */

const API_BASE_URL = "http://127.0.0.1:5000/api";

const DOCTORS_API_URL = `${API_BASE_URL}/doctors`;
const APPOINTMENTS_API_URL = `${API_BASE_URL}/appointments`;
const LEAVES_API_URL = `${API_BASE_URL}/leaves`;
const PATIENTS_API_URL = `${API_BASE_URL}/patients`;

const WALK_IN_REGISTER_URL = `${PATIENTS_API_URL}/walk-in-register`;

const SLOT_DURATION = 20;
const APPOINTMENT_TYPE = "Walk-in";
const ACTIVE_STATUSES = ["Booked", "Arrived"];

let doctors = [];
let selectedDoctor = null;
let availableDates = [];
let availableSlots = [];
let walkInAppointments = [];
let selectedDate = "";
let selectedTime = "";
let currentDoctorId = "";
let isSubmitting = false;

/* =======================================================
   EXISTING PATIENT SEARCH STATE
======================================================= */

let existingPatients = [];
let selectedExistingPatient = null;
let patientSearchTimeout = null;
let patientSearchRequest = 0;

const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
];

/* =======================================================
   HTML ELEMENTS
======================================================= */

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const logoutLink = document.getElementById("logoutLink");

const receptionistName = document.getElementById("receptionistName");

const walkInForm = document.getElementById("walkInForm");
const resetWalkInForm = document.getElementById("resetWalkInForm");
const registerWalkInButton = document.getElementById("registerWalkInButton");

const patientNameInput = document.getElementById("patientName");
const patientMobileInput = document.getElementById("patientMobile");
const patientEmailInput = document.getElementById("patientEmail");
const patientGenderInput = document.getElementById("patientGender");
const patientBloodGroupInput = document.getElementById("patientBloodGroup");
const patientDOBInput = document.getElementById("patientDOB");
const patientAddressInput = document.getElementById("patientAddress");

/* Existing-patient search elements */
const existingPatientResults = document.getElementById(
    "existingPatientResults"
);

const existingPatientIdInput = document.getElementById(
    "existingPatientId"
);

const doctorSelect = document.getElementById("doctorSelect");
const appointmentDateInput = document.getElementById("appointmentDate");
const timeSlotSelect = document.getElementById("timeSlot");
const consultationFeeInput = document.getElementById("consultationFee");
const appointmentTypeInput = document.getElementById("appointmentType");
const visitReasonInput = document.getElementById("visitReason");

const walkInTableBody = document.getElementById("walkInTableBody");
const searchWalkIns = document.getElementById("searchWalkIns");

const totalWalkInsElement = document.getElementById("totalWalkIns");
const waitingPatientsElement = document.getElementById("waitingPatients");
const completedPatientsElement = document.getElementById("completedPatients");

const walkInToast = document.getElementById("walkInToast");
const walkInToastMessage = document.getElementById("walkInToastMessage");

/* =======================================================
   GENERAL HELPERS
======================================================= */

async function fetchJSON(url, options = {}) {
    let response;

    try {
        response = await fetch(url, {
            cache: "no-store",
            ...options,
            headers: {
                ...(options.headers || {})
            }
        });
    } catch (error) {
        throw new Error(
            "Unable to connect to the DermCare server. Please check that the backend is running."
        );
    }

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message || `Request failed (${response.status}).`
        );
    }

    return data;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
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

function getId(value) {
    if (!value) return "";

    if (typeof value === "string") return value;

    return String(
        value._id ||
        value.id ||
        value.DoctorID ||
        value.PatientID ||
        ""
    );
}

function getDoctorName(doctor) {
    return (
        doctor?.FullName ||
        doctor?.fullName ||
        doctor?.name ||
        "Doctor"
    );
}

function getPatientName(appointment) {
    const patient = appointment.PatientID;

    if (patient && typeof patient === "object") {
        return patient.FullName || patient.fullName || "Patient";
    }

    return appointment.PatientName || "Patient";
}


function getPatientMobile(appointment) {
    const patient = appointment?.PatientID;

    if (patient && typeof patient === "object") {
        return String(
            patient["Mobile No"] ||
            patient.MobileNo ||
            patient.mobileNo ||
            patient.Mobile ||
            patient.mobile ||
            patient.Phone ||
            patient.phone ||
            appointment.PatientMobile ||
            appointment["Mobile No"] ||
            appointment.MobileNo ||
            appointment.mobileNo ||
            ""
        ).trim();
    }

    return String(
        appointment?.PatientMobile ||
        appointment?.["Mobile No"] ||
        appointment?.MobileNo ||
        appointment?.mobileNo ||
        ""
    ).trim();
}


function getDateString(value) {
    if (!value) return "";

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function getTodayString() {
    return getDateString(new Date());
}

function formatDate(dateString) {
    if (!dateString) return "—";

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatTime(time) {
    if (!time) return "—";

    const [hours, minutes] = String(time).split(":").map(Number);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return String(time);
    }

    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function normalizeTime(time) {
    if (!time) return "";

    let value = String(time).trim().toUpperCase();

    if (value.includes("AM") || value.includes("PM")) {
        const isPM = value.includes("PM");

        value = value.replace("AM", "").replace("PM", "").trim();

        const [hourPart, minutePart = "00"] = value.split(":");

        let hours = Number(hourPart);
        const minutes = Number(minutePart);

        if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
            return "";
        }

        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    const [hourPart, minutePart] = value.split(":");

    if (minutePart === undefined) return "";

    const hours = Number(hourPart);
    const minutes = Number(minutePart);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return "";
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/* =======================================================
   TOAST NOTIFICATION
======================================================= */

function showToast(message, type = "success") {
    if (!walkInToast || !walkInToastMessage) {
        alert(message);
        return;
    }

    const toastIcon = walkInToast.querySelector(
        ".walk-in-toast-icon i"
    );

    walkInToastMessage.textContent = message;

    walkInToast.classList.remove(
        "success",
        "error",
        "info",
        "toast-visible"
    );

    walkInToast.classList.add(type);

    if (toastIcon) {
        toastIcon.className =
            type === "error"
                ? "bi bi-exclamation-circle"
                : type === "info"
                    ? "bi bi-info-circle"
                    : "bi bi-check-lg";
    }

    walkInToast.style.display = "flex";

    void walkInToast.offsetWidth;

    walkInToast.classList.add("toast-visible");

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {
        walkInToast.classList.remove("toast-visible");
        walkInToast.style.display = "none";
    }, 5000);
}

/* =======================================================
   TOAST CLOSE BUTTON
======================================================= */

let closeWalkInToast = document.getElementById("closeWalkInToast");

if (!closeWalkInToast && walkInToast) {
    closeWalkInToast = document.createElement("button");
    closeWalkInToast.type = "button";
    closeWalkInToast.id = "closeWalkInToast";
    closeWalkInToast.className = "close-walk-in-toast";
    closeWalkInToast.setAttribute("aria-label", "Close notification");
    closeWalkInToast.innerHTML = "&times;";
    walkInToast.appendChild(closeWalkInToast);
}

if (closeWalkInToast) {
    closeWalkInToast.addEventListener("click", () => {
        clearTimeout(showToast.timeout);

        walkInToast?.classList.remove("toast-visible");

        if (walkInToast) {
            walkInToast.style.display = "none";
        }
    });
}

/* =======================================================
   RECEPTIONIST PROFILE
   Remove "Clinic" prefix from the displayed name
======================================================= */

function loadReceptionistProfile() {
    if (!receptionistName) return;

    try {
        const storedReceptionist =
            localStorage.getItem("receptionist");

        if (storedReceptionist) {
            const receptionist =
                JSON.parse(storedReceptionist);

            const fullName =
                receptionist.fullName ||
                receptionist.FullName ||
                receptionist.name ||
                "Receptionist";

            receptionistName.textContent =
                fullName.replace(/^Clinic\s+/i, "").trim() ||
                "Receptionist";

            return;
        }
    } catch (error) {
        console.error(
            "Unable to load receptionist profile:",
            error
        );
    }

    receptionistName.textContent = "Receptionist";
}

/* =======================================================
   MOBILE SIDEBAR
======================================================= */

function openMobileSidebar() {
    if (!sidebar) return;

    sidebar.classList.add("mobile-open");

    overlay?.classList.add("show");

    if (menuToggle) {
        menuToggle.classList.add("menu-open");
        menuToggle.setAttribute("aria-expanded", "true");
    }
}

function closeMobileSidebar() {
    sidebar?.classList.remove("mobile-open");
    overlay?.classList.remove("show");

    if (menuToggle) {
        menuToggle.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
    }
}

menuToggle?.addEventListener("click", openMobileSidebar);
closeSidebarBtn?.addEventListener("click", closeMobileSidebar);
overlay?.addEventListener("click", closeMobileSidebar);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMobileSidebar();
});

if (sidebar) {
    sidebar.querySelectorAll(".sidebar-menu a").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 650) {
                closeMobileSidebar();
            }
        });
    });
}

window.addEventListener("resize", () => {
    if (window.innerWidth > 650) closeMobileSidebar();
});

/* =======================================================
   LOGOUT
======================================================= */

if (logoutLink) {
    logoutLink.addEventListener("click", event => {
        event.preventDefault();

        localStorage.removeItem("receptionist");
        localStorage.removeItem("receptionistId");

        window.location.href =
            logoutLink.getAttribute("href") || "receptionist-login.html";
    });
}

/* =======================================================
   SEARCH EXISTING PATIENTS BY NAME
   Uses the existing GET /api/patients endpoint.
======================================================= */

async function loadExistingPatients() {
    const data = await fetchJSON(PATIENTS_API_URL);

    return Array.isArray(data.patients)
        ? data.patients
        : Array.isArray(data)
            ? data
            : [];
}

function getExistingPatientName(patient) {
    return String(
        patient.FullName ||
        patient.fullName ||
        ""
    ).trim();
}

function getExistingPatientMobile(patient) {
    return String(
        patient["Mobile No"] ||
        patient.MobileNo ||
        patient.mobileNo ||
        ""
    ).trim();
}

function getExistingPatientEmail(patient) {
    return String(
        patient.Email ||
        patient.email ||
        ""
    ).trim();
}

function clearExistingPatientSelection() {
    selectedExistingPatient = null;

    if (existingPatientIdInput) {
        existingPatientIdInput.value = "";
    }

    [
        patientNameInput,
        patientMobileInput,
        patientEmailInput,
        patientDOBInput,
        patientAddressInput
    ].forEach(input => {
        if (input) input.readOnly = false;
    });

    if (patientGenderInput) patientGenderInput.disabled = false;
    if (patientBloodGroupInput) patientBloodGroupInput.disabled = false;
}

function hideExistingPatientResults() {
    if (!existingPatientResults) return;

    existingPatientResults.innerHTML = "";
    existingPatientResults.style.display = "none";
}

function displayExistingPatientResults(matches) {
    if (!existingPatientResults) return;

    if (matches.length === 0) {
        existingPatientResults.innerHTML = `
            <div class="existing-patient-empty">
                No existing patient found with this name.
                Continue entering details to register a new patient.
            </div>
        `;

        existingPatientResults.style.display = "block";
        return;
    }

    existingPatientResults.innerHTML = matches.map(patient => {
        const id = getId(patient);

        return `
            <button
                type="button"
                class="existing-patient-option"
                data-patient-id="${escapeHTML(id)}"
            >
                <strong>${escapeHTML(getExistingPatientName(patient))}</strong>
                <span>Mobile: ${escapeHTML(getExistingPatientMobile(patient) || "Not available")}</span>
                <span>Email: ${escapeHTML(getExistingPatientEmail(patient) || "Not available")}</span>
            </button>
        `;
    }).join("");

    existingPatientResults.style.display = "block";

    existingPatientResults
        .querySelectorAll(".existing-patient-option")
        .forEach(button => {
            button.addEventListener("click", () => {
                const patient = matches.find(
                    item => getId(item) === button.dataset.patientId
                );

                if (patient) {
                    selectExistingPatient(patient);
                }
            });
        });
}

function selectExistingPatient(patient) {
    const patientId = getId(patient);

    if (!patientId) {
        showToast("Unable to identify this patient record.", "error");
        return;
    }

    selectedExistingPatient = patient;

    if (existingPatientIdInput) {
        existingPatientIdInput.value = patientId;
    }

    patientNameInput.value = getExistingPatientName(patient);
    patientMobileInput.value = getExistingPatientMobile(patient);
    patientEmailInput.value = getExistingPatientEmail(patient);

    patientGenderInput.value =
        patient.Gender ||
        patient.gender ||
        "";

    patientBloodGroupInput.value =
        patient["Blood Group"] ||
        patient.BloodGroup ||
        patient.bloodGroup ||
        "";

    patientDOBInput.value = getDateString(
        patient.DateOfBirth ||
        patient.dateOfBirth
    );

    patientAddressInput.value =
        patient.Address ||
        patient.address ||
        "";

    /*
     * Existing patient details are read-only.
     * This page creates an appointment, not a profile update.
     */
    [
        patientNameInput,
        patientMobileInput,
        patientEmailInput,
        patientDOBInput,
        patientAddressInput
    ].forEach(input => {
        if (input) input.readOnly = true;
    });

    patientGenderInput.disabled = true;
    patientBloodGroupInput.disabled = true;

    existingPatientResults.innerHTML = `
        <div class="existing-patient-selected">
            <i class="bi bi-check-circle-fill"></i>

            <span>
                Existing patient selected.
                A duplicate patient record will not be created.
            </span>

            <button
                type="button"
                id="clearExistingPatientSelection"
            >
                Clear selection
            </button>
        </div>
    `;

    existingPatientResults.style.display = "block";

    document
        .getElementById("clearExistingPatientSelection")
        .addEventListener("click", () => {
            clearExistingPatientSelection();

            patientNameInput.value = "";
            patientMobileInput.value = "";
            patientEmailInput.value = "";
            patientDOBInput.value = "";
            patientAddressInput.value = "";
            patientGenderInput.value = "";
            patientBloodGroupInput.value = "";

            hideExistingPatientResults();
            patientNameInput.focus();
        });

    showToast("Existing patient selected.", "success");
}

/* =======================================================
   PATIENT NAME INPUT SEARCH
======================================================= */

if (patientNameInput) {
    patientNameInput.addEventListener("input", () => {
        if (selectedExistingPatient) {
            clearExistingPatientSelection();
        }

        clearTimeout(patientSearchTimeout);

        // Invalidate earlier searches as soon as the name changes.
        patientSearchRequest++;

        const requestNumber = patientSearchRequest;

        const searchTerm = patientNameInput.value
            .trim()
            .toLowerCase();

        hideExistingPatientResults();

        if (searchTerm.length < 2) return;

        patientSearchTimeout = setTimeout(async () => {
            try {
                existingPatients = await loadExistingPatients();

                // Ignore a response belonging to an older search.
                if (requestNumber !== patientSearchRequest) return;

                if (
                    patientNameInput.value.trim().toLowerCase() !== searchTerm
                ) {
                    return;
                }

                const matches = existingPatients
                    .filter(patient =>
                        getExistingPatientName(patient)
                            .toLowerCase()
                            .includes(searchTerm)
                    )
                    .slice(0, 10);

                displayExistingPatientResults(matches);
            } catch (error) {
                console.error(
                    "Existing patient search failed:",
                    error
                );

                if (requestNumber === patientSearchRequest) {
                    showToast(
                        "Unable to search existing patients. Check that the backend is running.",
                        "error"
                    );
                }
            }
        }, 300);
    });
}

/* =======================================================
   LOAD DOCTORS
======================================================= */

async function loadDoctors() {
    if (!doctorSelect) return;

    doctorSelect.innerHTML =
        '<option value="">Loading doctors...</option>';

    doctorSelect.disabled = true;

    try {
        const data = await fetchJSON(DOCTORS_API_URL);

        const doctorList = Array.isArray(data.doctors)
            ? data.doctors
            : Array.isArray(data)
                ? data
                : [];

        doctors = doctorList.filter(doctor => {
            const status = String(
                doctor.Status ||
                doctor.status ||
                doctor.Availability ||
                "Available"
            ).toLowerCase();

            return (
                doctor.isActive !== false &&
                status !== "inactive" &&
                status !== "not available" &&
                status !== "unavailable"
            );
        });

        doctorSelect.innerHTML =
            '<option value="">Select Doctor</option>';

        doctors.forEach(doctor => {
            const option = document.createElement("option");

            option.value = getId(doctor);
            option.textContent = getDoctorName(doctor);

            doctorSelect.appendChild(option);
        });

        doctorSelect.disabled = false;

        if (doctors.length === 0) {
            doctorSelect.innerHTML =
                '<option value="">No doctors available</option>';
        }
    } catch (error) {
        console.error("Error loading doctors:", error);

        doctorSelect.innerHTML =
            '<option value="">Unable to load doctors</option>';

        showToast(
            "Unable to load doctors. Check that the backend is running.",
            "error"
        );
    }
}

/* =======================================================
   RESET DATE AND TIME OPTIONS
======================================================= */

function resetDateAndTimeOptions() {
    selectedDate = "";
    selectedTime = "";
    availableDates = [];
    availableSlots = [];
    currentDoctorId = "";

    if (appointmentDateInput) {
        appointmentDateInput.value = "";
        appointmentDateInput.min = getTodayString();
        appointmentDateInput.removeAttribute("max");
        appointmentDateInput.disabled = true;
    }

    const dateHint = document.getElementById("dateHint");

    if (dateHint) {
        dateHint.textContent = "Select a doctor first.";
    }

    if (timeSlotSelect) {
        timeSlotSelect.innerHTML =
            '<option value="">Select Date First</option>';
        timeSlotSelect.value = "";
        timeSlotSelect.disabled = true;
    }

    const slotHint = document.getElementById("slotHint");

    if (slotHint) {
        slotHint.textContent =
            "Available walk-in slots will appear here.";
    }
}

/* =======================================================
   LOAD CONSULTATION FEE
======================================================= */

function displayDoctorFee(doctor) {
    if (!consultationFeeInput) return;

    const fee =
        doctor?.ConsultationFee ??
        doctor?.consultationFee ??
        doctor?.Consultation_Fee ??
        doctor?.Fee ??
        "";

    consultationFeeInput.value = fee === "" ? "" : fee;
}

/* =======================================================
   LOAD AVAILABLE WALK-IN DATES
======================================================= */

async function loadAvailableDates(doctorId) {
    if (!appointmentDateInput || !doctorId) return;

    appointmentDateInput.disabled = true;
    appointmentDateInput.value = "";
    appointmentDateInput.min = getTodayString();
    appointmentDateInput.removeAttribute("max");

    if (timeSlotSelect) {
        timeSlotSelect.innerHTML =
            '<option value="">Select Date First</option>';
        timeSlotSelect.disabled = true;
    }

    selectedDate = "";
    selectedTime = "";
    availableDates = [];
    availableSlots = [];
    currentDoctorId = doctorId;

    const dateHint = document.getElementById("dateHint");

    if (dateHint) {
        dateHint.textContent = "Checking available dates...";
    }

    const startDate = getTodayString();

    const lastDateObject = new Date();
    lastDateObject.setDate(lastDateObject.getDate() + 90);

    const endDate = getDateString(lastDateObject);

    const url =
        `${APPOINTMENTS_API_URL}/available-dates/${encodeURIComponent(doctorId)}` +
        `?type=${encodeURIComponent(APPOINTMENT_TYPE)}` +
        `&startDate=${encodeURIComponent(startDate)}` +
        `&endDate=${encodeURIComponent(endDate)}`;

    try {
        const data = await fetchJSON(url);

        if (!data || !Array.isArray(data.dates)) {
            throw new Error(
                "The server returned an unexpected available-dates response."
            );
        }

        availableDates = data.dates
            .filter(item =>
                item &&
                typeof item.date === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
                Array.isArray(item.availableSlots) &&
                item.availableSlots.length > 0 &&
                item.dateAvailable !== false
            )
            .sort((a, b) => a.date.localeCompare(b.date));

        if (availableDates.length === 0) {
            appointmentDateInput.disabled = true;

            if (dateHint) {
                dateHint.textContent =
                    "No available Walk-in dates in the next 90 days.";
            }

            if (timeSlotSelect) {
                timeSlotSelect.innerHTML =
                    '<option value="">No available Walk-in slots</option>';
                timeSlotSelect.disabled = true;
            }

            showToast(
                "This doctor has no available Walk-in dates in the next 90 days.",
                "info"
            );

            return;
        }

        appointmentDateInput.min = startDate;
        appointmentDateInput.max = endDate;
        appointmentDateInput.disabled = false;

        if (dateHint) {
            dateHint.textContent =
                "Choose a date with available Walk-in slots.";
        }
    } catch (error) {
        console.error("Error loading Walk-in dates:", error);

        appointmentDateInput.value = "";
        appointmentDateInput.disabled = true;

        if (dateHint) {
            dateHint.textContent = "Unable to load available dates.";
        }

        showToast(
            error.message || "Unable to load available dates.",
            "error"
        );
    }
}

/* =======================================================
   LOAD AVAILABLE WALK-IN TIME SLOTS
======================================================= */

async function loadAvailableTimeSlots(doctorId, date) {
    if (!timeSlotSelect || !doctorId || !date) return;

    selectedTime = "";
    timeSlotSelect.disabled = true;
    timeSlotSelect.innerHTML =
        '<option value="">Loading available time slots...</option>';

    const slotHint = document.getElementById("slotHint");

    if (slotHint) {
        slotHint.textContent = "Checking available Walk-in slots...";
    }

    const url =
        `${APPOINTMENTS_API_URL}/available-slots/` +
        `${encodeURIComponent(doctorId)}/${encodeURIComponent(date)}` +
        `?type=${encodeURIComponent(APPOINTMENT_TYPE)}`;

    try {
        const data = await fetchJSON(url);

        availableSlots = Array.isArray(data.availableSlots)
            ? [...new Set(data.availableSlots.map(normalizeTime).filter(Boolean))]
            : [];

        if (data.dateAvailable === false || availableSlots.length === 0) {
            timeSlotSelect.innerHTML =
                '<option value="">No available Walk-in slots</option>';
            timeSlotSelect.disabled = true;

            if (slotHint) {
                slotHint.textContent =
                    "No Walk-in slots remain on this date. Choose another date.";
            }

            showToast(
                "No Walk-in slots remain for this date. Select another date.",
                "info"
            );

            await removeDateIfUnavailable(date);

            return;
        }

        timeSlotSelect.innerHTML =
            '<option value="">Select Time Slot</option>';

        availableSlots.forEach(time => {
            const option = document.createElement("option");

            option.value = time;
            option.textContent = formatTime(time);

            timeSlotSelect.appendChild(option);
        });

        timeSlotSelect.disabled = false;

        if (slotHint) {
            slotHint.textContent =
                `${availableSlots.length} Walk-in slot(s) available.`;
        }
    } catch (error) {
        console.error("Error loading Walk-in time slots:", error);

        timeSlotSelect.innerHTML =
            '<option value="">Unable to load time slots</option>';
        timeSlotSelect.disabled = true;

        if (slotHint) {
            slotHint.textContent = "Unable to load available time slots.";
        }

        showToast(
            error.message || "Unable to load time slots.",
            "error"
        );
    }
}

/* =======================================================
   REMOVE DATE IF ALL WALK-IN SLOTS ARE NOW FULL
======================================================= */

async function removeDateIfUnavailable(date) {
    if (!appointmentDateInput || !currentDoctorId || !date) return;

    const url =
        `${APPOINTMENTS_API_URL}/available-slots/` +
        `${encodeURIComponent(currentDoctorId)}/${encodeURIComponent(date)}` +
        `?type=${encodeURIComponent(APPOINTMENT_TYPE)}`;

    try {
        const data = await fetchJSON(url);

        if (
            data.dateAvailable === false ||
            !Array.isArray(data.availableSlots) ||
            data.availableSlots.length === 0
        ) {
            availableDates = availableDates.filter(
                item => item.date !== date
            );

            if (appointmentDateInput.value === date) {
                appointmentDateInput.value = "";
            }

            selectedDate = "";
            selectedTime = "";
            availableSlots = [];

            if (timeSlotSelect) {
                timeSlotSelect.innerHTML =
                    '<option value="">Select another date</option>';
                timeSlotSelect.disabled = true;
            }

            const dateHint = document.getElementById("dateHint");

            if (dateHint) {
                dateHint.textContent =
                    "This date is full. Choose another available date.";
            }
        }
    } catch (error) {
        console.error("Unable to recheck date availability:", error);
    }
}

/* =======================================================
   DOCTOR SELECTION
======================================================= */

if (doctorSelect) {
    doctorSelect.addEventListener("change", async () => {
        resetDateAndTimeOptions();

        const doctorId = doctorSelect.value;

        selectedDoctor = doctors.find(
            doctor => getId(doctor) === String(doctorId)
        ) || null;

        displayDoctorFee(selectedDoctor);

        if (appointmentTypeInput) {
            appointmentTypeInput.value = APPOINTMENT_TYPE;
        }

        if (!doctorId) {
            selectedDoctor = null;
            return;
        }

        await loadAvailableDates(doctorId);
    });
}

/* =======================================================
   DATE SELECTION
======================================================= */

if (appointmentDateInput) {
    appointmentDateInput.addEventListener("change", async () => {
        selectedDate = appointmentDateInput.value;
        selectedTime = "";
        availableSlots = [];

        if (timeSlotSelect) {
            timeSlotSelect.innerHTML =
                '<option value="">Select Date First</option>';
            timeSlotSelect.disabled = true;
        }

        if (!selectedDate || !currentDoctorId) return;

        const dateRecord = availableDates.find(
            item => item.date === selectedDate
        );

        if (!dateRecord) {
            appointmentDateInput.value = "";
            selectedDate = "";

            if (timeSlotSelect) {
                timeSlotSelect.innerHTML =
                    '<option value="">Select an available date</option>';
                timeSlotSelect.disabled = true;
            }

            const dateHint = document.getElementById("dateHint");

            if (dateHint) {
                dateHint.textContent =
                    "No Walk-in slots are available on that date. Select another date.";
            }

            showToast(
                "This doctor has no available Walk-in slots on that date.",
                "error"
            );

            return;
        }

        await loadAvailableTimeSlots(currentDoctorId, selectedDate);
    });
}

/* =======================================================
   TIME SELECTION
======================================================= */

if (timeSlotSelect) {
    timeSlotSelect.addEventListener("change", () => {
        selectedTime = normalizeTime(timeSlotSelect.value);
    });
}

/* =======================================================
   PATIENT REGISTRATION FOR WALK-IN
   Registers a new patient without a password.
======================================================= */

async function registerNewWalkInPatient() {
    const fullName = patientNameInput?.value.trim() || "";
    const mobileNo = patientMobileInput?.value.trim() || "";
    const email = patientEmailInput?.value.trim().toLowerCase() || "";
    const gender = patientGenderInput?.value.trim() || "";
    const bloodGroup = patientBloodGroupInput?.value.trim() || "";
    const dateOfBirth = patientDOBInput?.value || "";
    const address = patientAddressInput?.value.trim() || "";

    const patientData = {
        fullName,
        email,
        mobileNo,
        dateOfBirth,
        gender,
        bloodGroup,
        address
    };

    const data = await fetchJSON(WALK_IN_REGISTER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(patientData)
    });

    const patient =
        data.patient ||
        data.data?.patient ||
        data.data ||
        null;

    const patientId =
        getId(patient) ||
        data.patientId ||
        data.id ||
        data._id ||
        "";

    if (!patientId) {
        throw new Error(
            "The patient was registered, but the server did not return a patient ID. Check the walk-in registration controller response before booking."
        );
    }

    return {
        id: String(patientId),
        patient
    };
}

/* =======================================================
   VALIDATE WALK-IN FORM
======================================================= */

function validateWalkInForm() {
    if (!walkInForm) {
        showToast("Walk-in form was not found.", "error");
        return false;
    }

    if (!patientNameInput?.value.trim()) {
        showToast("Please enter the patient's full name.", "error");
        patientNameInput?.focus();
        return false;
    }

    /*
     * Existing patients already have saved patient details.
     * Validate patient registration fields only for new patients.
     */
    if (!selectedExistingPatient) {
        const mobile = patientMobileInput?.value.trim() || "";

        if (!/^\d{10}$/.test(mobile)) {
            showToast(
                "Please enter a valid 10-digit mobile number.",
                "error"
            );
            patientMobileInput?.focus();
            return false;
        }

        const email = patientEmailInput?.value.trim() || "";

        if (
            !email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            showToast(
                "Please enter a valid patient email address.",
                "error"
            );
            patientEmailInput?.focus();
            return false;
        }

        if (!patientGenderInput?.value.trim()) {
            showToast("Please select the patient's gender.", "error");
            patientGenderInput?.focus();
            return false;
        }

        if (!patientBloodGroupInput?.value.trim()) {
            showToast("Please select the patient's blood group.", "error");
            patientBloodGroupInput?.focus();
            return false;
        }

        if (!patientDOBInput?.value) {
            showToast(
                "Please enter the patient's date of birth.",
                "error"
            );
            patientDOBInput?.focus();
            return false;
        }

        if (patientDOBInput.value > getTodayString()) {
            showToast(
                "Date of birth cannot be in the future.",
                "error"
            );
            patientDOBInput.focus();
            return false;
        }

        if (!patientAddressInput?.value.trim()) {
            showToast("Please enter the patient's address.", "error");
            patientAddressInput?.focus();
            return false;
        }
    } else if (!getId(selectedExistingPatient)) {
        showToast(
            "The selected existing patient is invalid. Please select the patient again.",
            "error"
        );
        return false;
    }

    if (!doctorSelect?.value) {
        showToast("Please select a doctor.", "error");
        doctorSelect?.focus();
        return false;
    }

    if (!appointmentDateInput?.value) {
        showToast("Please select an appointment date.", "error");
        appointmentDateInput?.focus();
        return false;
    }

    if (!availableDates.some(item => item.date === appointmentDateInput.value)) {
        showToast(
            "This date is not available for Walk-in appointments. Select another date.",
            "error"
        );
        appointmentDateInput?.focus();
        return false;
    }

    if (!timeSlotSelect?.value) {
        showToast("Please select an available Walk-in time slot.", "error");
        timeSlotSelect?.focus();
        return false;
    }

    if (!availableSlots.includes(normalizeTime(timeSlotSelect.value))) {
        showToast(
            "This time slot is not available. Please select another slot.",
            "error"
        );
        return false;
    }

    return true;
}

/* =======================================================
   REGISTER WALK-IN APPOINTMENT
======================================================= */

if (walkInForm) {
    walkInForm.addEventListener("submit", async event => {
        event.preventDefault();

        if (isSubmitting) return;

        if (!validateWalkInForm()) return;

        isSubmitting = true;

        const originalButtonText = registerWalkInButton
            ? registerWalkInButton.innerHTML
            : "";

        if (registerWalkInButton) {
            registerWalkInButton.disabled = true;
            registerWalkInButton.textContent = "Registering...";
        }

        let patientCreated = false;

        try {
            const chosenDate = appointmentDateInput.value;
            const chosenTime = normalizeTime(timeSlotSelect.value);
            const chosenDoctorId = doctorSelect.value;

            let patientResult;

            /*
             * Existing patient:
             * Reuse the saved MongoDB ID and do not register again.
             *
             * New patient:
             * Register first, then book the appointment.
             */
            if (selectedExistingPatient) {
                patientResult = {
                    id: getId(selectedExistingPatient),
                    patient: selectedExistingPatient
                };

                if (!patientResult.id) {
                    throw new Error(
                        "The selected patient ID is missing."
                    );
                }
            } else {
                patientResult = await registerNewWalkInPatient();
                patientCreated = true;
            }

            /*
             * Recheck availability immediately before booking.
             */
            const availabilityURL =
                `${APPOINTMENTS_API_URL}/available-slots/` +
                `${encodeURIComponent(chosenDoctorId)}/` +
                `${encodeURIComponent(chosenDate)}` +
                `?type=${encodeURIComponent(APPOINTMENT_TYPE)}`;

            const availability = await fetchJSON(availabilityURL);

            const latestSlots = Array.isArray(availability.availableSlots)
                ? availability.availableSlots.map(normalizeTime).filter(Boolean)
                : [];

            if (
                availability.dateAvailable === false ||
                !latestSlots.includes(chosenTime)
            ) {
                await loadAvailableTimeSlots(
                    chosenDoctorId,
                    chosenDate
                );

                throw new Error(
                    patientCreated
                        ? "The patient was registered, but the selected Walk-in slot is no longer available. Please choose another slot. The patient record has been saved."
                        : "The selected Walk-in slot is no longer available. Please choose another slot."
                );
            }

            const appointmentData = {
                PatientID: patientResult.id,
                DoctorID: chosenDoctorId,
                AppointmentDate: chosenDate,
                AppointmentTime: chosenTime,
                AppointmentType: APPOINTMENT_TYPE,
                ReasonForVisit: visitReasonInput?.value.trim() || "",
                Symptoms: "",
                Allergies: "No known allergies",
                AllergyDetails: ""
            };

            await fetchJSON(`${APPOINTMENTS_API_URL}/book`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(appointmentData)
            });

            showToast(
                selectedExistingPatient
                    ? "Appointment booked successfully for the existing patient."
                    : "Walk-in patient registered and appointment booked successfully.",
                "success"
            );

            walkInForm.reset();

            /*
             * Unlock fields after reset because they may have been
             * disabled when an existing patient was selected.
             */
            clearExistingPatientSelection();
            hideExistingPatientResults();

            if (patientGenderInput) {
                patientGenderInput.disabled = false;
            }

            if (patientBloodGroupInput) {
                patientBloodGroupInput.disabled = false;
            }

            if (appointmentTypeInput) {
                appointmentTypeInput.value = APPOINTMENT_TYPE;
            }

            resetDateAndTimeOptions();

            selectedDoctor = null;

            if (consultationFeeInput) {
                consultationFeeInput.value = "";
            }

            await Promise.all([
                loadWalkInAppointments(),
                loadDoctors()
            ]);
        } catch (error) {
            console.error(
                "Error registering Walk-in appointment:",
                error
            );

            if (patientCreated) {
                showToast(
                    error.message ||
                    "The patient was registered, but the appointment could not be booked. The patient record has been saved.",
                    "error"
                );
            } else {
                showToast(
                    error.message ||
                    "Unable to register the Walk-in appointment.",
                    "error"
                );
            }
        } finally {
            isSubmitting = false;

            if (registerWalkInButton) {
                registerWalkInButton.disabled = false;
                registerWalkInButton.innerHTML =
                    originalButtonText ||
                    '<i class="bi bi-person-check"></i> Register Walk-in';
            }
        }
    });
}

/* =======================================================
   RESET WALK-IN FORM
======================================================= */

if (resetWalkInForm) {
    resetWalkInForm.addEventListener("click", () => {
        clearTimeout(patientSearchTimeout);
        patientSearchRequest++;

        walkInForm?.reset();

        clearExistingPatientSelection();
        hideExistingPatientResults();

        if (patientGenderInput) {
            patientGenderInput.disabled = false;
        }

        if (patientBloodGroupInput) {
            patientBloodGroupInput.disabled = false;
        }

        resetDateAndTimeOptions();

        selectedDoctor = null;

        if (consultationFeeInput) {
            consultationFeeInput.value = "";
        }

        if (appointmentTypeInput) {
            appointmentTypeInput.value = APPOINTMENT_TYPE;
        }
    });
}

/* =======================================================
   LOAD WALK-IN APPOINTMENTS
======================================================= */

async function loadWalkInAppointments() {
    if (!walkInTableBody) return;

    walkInTableBody.innerHTML = `
        <tr>
            <td colspan="7">Loading Walk-in appointments...</td>
        </tr>
    `;

    try {
        const data = await fetchJSON(APPOINTMENTS_API_URL);

        const allAppointments = Array.isArray(data.appointments)
            ? data.appointments
            : [];

        walkInAppointments = allAppointments.filter(appointment =>
            String(appointment.AppointmentType || "").toLowerCase() === "walk-in"
        );

        updateWalkInSummary();
        renderWalkInAppointments();
    } catch (error) {
        console.error("Error loading Walk-in appointments:", error);

        walkInTableBody.innerHTML = `
            <tr>
                <td colspan="7">Unable to load Walk-in appointments.</td>
            </tr>
        `;

        showToast(
            "Unable to load Walk-in appointment records.",
            "error"
        );
    }
}

/* =======================================================
   UPDATE WALK-IN SUMMARY
======================================================= */

function updateWalkInSummary() {
    const activeAppointments = walkInAppointments.filter(appointment =>
        ACTIVE_STATUSES.includes(appointment.Status)
    );

    const waitingAppointments = activeAppointments.filter(
        appointment => appointment.Status === "Booked"
    );

    const completedAppointments = walkInAppointments.filter(
        appointment => appointment.Status === "Completed"
    );

    if (totalWalkInsElement) {
        totalWalkInsElement.textContent = walkInAppointments.length;
    }

    if (waitingPatientsElement) {
        waitingPatientsElement.textContent = waitingAppointments.length;
    }

    if (completedPatientsElement) {
        completedPatientsElement.textContent = completedAppointments.length;
    }
}

/* =======================================================
   RENDER WALK-IN APPOINTMENT TABLE
   Existing table structure is preserved.
======================================================= */

function renderWalkInAppointments() {
    if (!walkInTableBody) return;

    const searchTerm = (searchWalkIns?.value || "").trim().toLowerCase();

    const filteredAppointments = walkInAppointments.filter(appointment => {
        const patientName = getPatientName(appointment).toLowerCase();
        const mobile = getPatientMobile(appointment).toLowerCase();

        const doctorName = (
            appointment.DoctorID?.FullName ||
            appointment.DoctorName ||
            ""
        ).toLowerCase();

        const date = getDateString(appointment.AppointmentDate);
        const time = String(appointment.AppointmentTime || "").toLowerCase();
        const status = String(appointment.Status || "").toLowerCase();

        return (
            patientName.includes(searchTerm) ||
            mobile.includes(searchTerm) ||
            doctorName.includes(searchTerm) ||
            date.includes(searchTerm) ||
            time.includes(searchTerm) ||
            status.includes(searchTerm)
        );
    });

    if (filteredAppointments.length === 0) {
        walkInTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="bi bi-calendar2-x"></i>
                        <p>No Walk-in appointments found.</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }

    walkInTableBody.innerHTML = filteredAppointments.map(appointment => {
        const patientName = escapeHTML(getPatientName(appointment));
        const mobile = escapeHTML(getPatientMobile(appointment));

        const doctorName = escapeHTML(
            appointment.DoctorID?.FullName ||
            appointment.DoctorName ||
            "Doctor"
        );

        const time = escapeHTML(formatTime(appointment.AppointmentTime));
        const status = escapeHTML(appointment.Status || "Booked");

        const statusClass = String(appointment.Status || "Booked")
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "");

        return `
            <tr>
                <td>${patientName}</td>
                <td>${mobile || "—"}</td>
                <td>${doctorName}</td>
                <td>${time}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${status}
                    </span>
                </td>
                <td>—</td>
            </tr>
        `;
    }).join("");
}

if (searchWalkIns) {
    searchWalkIns.addEventListener("input", renderWalkInAppointments);
}


/* =======================================================
   DISPLAY CURRENT DATE IN PAGE HEADER
======================================================= */

function displayCurrentDate() {
    const currentDateElement = document.getElementById("currentDate");

    if (!currentDateElement) return;

    currentDateElement.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}



/* =======================================================
   INITIALIZE WALK-IN PAGE
======================================================= */

async function initializeWalkInPage() {
    displayCurrentDate(); // Added: display current date in header

    loadReceptionistProfile();

    if (appointmentTypeInput) {
        appointmentTypeInput.value = APPOINTMENT_TYPE;
    }

    resetDateAndTimeOptions();

    await Promise.all([
        loadDoctors(),
        loadWalkInAppointments()
    ]);
}

initializeWalkInPage();

