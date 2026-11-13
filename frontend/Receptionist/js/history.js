
/* =======================================================
   DERMCARE - RECEPTIONIST HISTORY JS
   FILE: js/history.js
======================================================= */


/* =======================================================
   API CONFIGURATION
======================================================= */

const API_BASE_URL = "https://dermacare-eeca.onrender.com/api";

const PATIENTS_API = `${API_BASE_URL}/patients`;
const APPOINTMENTS_API = `${API_BASE_URL}/appointments`;


/* =======================================================
   GLOBAL DATA
======================================================= */

let allPatients = [];
let allAppointments = [];

let currentPatientId = null;
let activeHistorySection = null;


/* =======================================================
   GET HTML ELEMENTS
======================================================= */

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");

const currentDateElement = document.getElementById("currentDate");
const receptionistNameElement = document.getElementById("receptionistName");

const allPatientsCard = document.getElementById("allPatientsCard");
const completedAppointmentsCard = document.getElementById("completedAppointmentsCard");
const cancelledAppointmentsCard = document.getElementById("cancelledAppointmentsCard");

const totalPatientsElement = document.getElementById("totalPatients");
const totalCompletedElement = document.getElementById("totalCompleted");
const totalCancelledElement = document.getElementById("totalCancelled");

const allPatientsSection = document.getElementById("allPatientsSection");
const completedAppointmentsSection = document.getElementById("completedAppointmentsSection");
const cancelledAppointmentsSection = document.getElementById("cancelledAppointmentsSection");

const patientsTableBody = document.getElementById("patientsTableBody");
const completedAppointmentsTableBody = document.getElementById("completedAppointmentsTableBody");
const cancelledAppointmentsTableBody = document.getElementById("cancelledAppointmentsTableBody");

const patientSearch = document.getElementById("patientSearch");
const completedSearch = document.getElementById("completedSearch");
const cancelledSearch = document.getElementById("cancelledSearch");

const patientRecordCount = document.getElementById("patientRecordCount");
const completedRecordCount = document.getElementById("completedRecordCount");
const cancelledRecordCount = document.getElementById("cancelledRecordCount");

const statusMessage = document.getElementById("statusMessage");

const editPatientModal = document.getElementById("editPatientModal");
const editPatientForm = document.getElementById("editPatientForm");

const editPatientId = document.getElementById("editPatientId");
const editFullName = document.getElementById("editFullName");
const editEmail = document.getElementById("editEmail");
const editMobileNo = document.getElementById("editMobileNo");
const editDateOfBirth = document.getElementById("editDateOfBirth");
const editGender = document.getElementById("editGender");
const editBloodGroup = document.getElementById("editBloodGroup");
const editAddress = document.getElementById("editAddress");

const editPatientMessage = document.getElementById("editPatientMessage");
const savePatientChanges = document.getElementById("savePatientChanges");

const closeEditModal = document.getElementById("closeEditModal");
const cancelEditPatient = document.getElementById("cancelEditPatient");

const toastMessage = document.getElementById("toastMessage");
const toastText = document.getElementById("toastText");
const toastProgress = document.getElementById("toastProgress");
const closeToast = document.getElementById("closeToast");


/* =======================================================
   INITIALIZE HISTORY PAGE
======================================================= */

document.addEventListener("DOMContentLoaded", function () {
    displayCurrentDate();
    loadReceptionistName();
    setupSidebar();
    setupHistoryCards();
    setupSearch();
    setupPatientModal();
    setupLogout();
    loadHistoryData();
});


/* =======================================================
   DISPLAY CURRENT DATE
======================================================= */

function displayCurrentDate() {
    if (!currentDateElement) return;

    const today = new Date();

    currentDateElement.textContent = today.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* =======================================================
   LOAD RECEPTIONIST NAME
======================================================= */

function loadReceptionistName() {
    if (!receptionistNameElement) return;

    const possibleNames = [
        localStorage.getItem("receptionistName"),
        sessionStorage.getItem("receptionistName"),
        localStorage.getItem("ReceptionistName"),
        sessionStorage.getItem("ReceptionistName")
    ];

    const storedName = possibleNames.find(function (name) {
        return name && name.trim();
    });

    if (storedName) {
        receptionistNameElement.textContent = storedName;
    }
}


/* =======================================================
   MOBILE SIDEBAR
======================================================= */

function setupSidebar() {
    if (menuToggle) {
        menuToggle.addEventListener("click", openSidebar);
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener("click", closeSidebar);
    }

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSidebar();
            closePatientModal();
            hideToast();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 650) {
            closeSidebar();
        }
    });
}


function openSidebar() {
    if (!sidebar) return;

    sidebar.classList.add("mobile-open");

    if (overlay) {
        overlay.classList.add("show");
    }

    if (menuToggle) {
        menuToggle.classList.add("menu-open");
        menuToggle.setAttribute("aria-expanded", "true");
    }
}


function closeSidebar() {
    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

    if (overlay) {
        overlay.classList.remove("show");
    }

    if (menuToggle) {
        menuToggle.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
    }
}


/* =======================================================
   LOGOUT
======================================================= */

function setupLogout() {
    const logoutLink = document.getElementById("logoutLink");

    if (!logoutLink) return;

    logoutLink.addEventListener("click", function () {
        /*
         * Preserve the existing logout link and its destination.
         * Authentication storage is not cleared here because the
         * application's existing logout convention is not known.
         */
    });
}


/* =======================================================
   HISTORY CARD CLICK EVENTS
======================================================= */

function setupHistoryCards() {
    if (allPatientsCard) {
        allPatientsCard.addEventListener("click", function () {
            toggleHistorySection("allPatientsSection");
        });
    }

    if (completedAppointmentsCard) {
        completedAppointmentsCard.addEventListener("click", function () {
            toggleHistorySection("completedAppointmentsSection");
        });
    }

    if (cancelledAppointmentsCard) {
        cancelledAppointmentsCard.addEventListener("click", function () {
            toggleHistorySection("cancelledAppointmentsSection");
        });
    }

    document.querySelectorAll("[data-close-section]").forEach(function (button) {
        button.addEventListener("click", function () {
            hideHistorySection(button.dataset.closeSection);
        });
    });
}


/* =======================================================
   SHOW / HIDE HISTORY SECTIONS
======================================================= */

function toggleHistorySection(sectionId) {
    const sections = [
        allPatientsSection,
        completedAppointmentsSection,
        cancelledAppointmentsSection
    ];

    const cards = [
        allPatientsCard,
        completedAppointmentsCard,
        cancelledAppointmentsCard
    ];

    const targetSection = document.getElementById(sectionId);

    if (!targetSection) return;

    const wasVisible = !targetSection.hidden;

    sections.forEach(function (section) {
        if (section) {
            section.hidden = true;
        }
    });

    cards.forEach(function (card) {
        if (card) {
            card.setAttribute("aria-expanded", "false");
        }
    });

    if (wasVisible) {
        activeHistorySection = null;
        return;
    }

    targetSection.hidden = false;
    activeHistorySection = sectionId;

    const cardMap = {
        allPatientsSection: allPatientsCard,
        completedAppointmentsSection: completedAppointmentsCard,
        cancelledAppointmentsSection: cancelledAppointmentsCard
    };

    if (cardMap[sectionId]) {
        cardMap[sectionId].setAttribute("aria-expanded", "true");
    }

    if (statusMessage) {
        statusMessage.hidden = true;
    }

    targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function hideHistorySection(sectionId) {
    const section = document.getElementById(sectionId);

    if (section) {
        section.hidden = true;
    }

    const cardMap = {
        allPatientsSection: allPatientsCard,
        completedAppointmentsSection: completedAppointmentsCard,
        cancelledAppointmentsSection: cancelledAppointmentsCard
    };

    if (cardMap[sectionId]) {
        cardMap[sectionId].setAttribute("aria-expanded", "false");
    }

    if (activeHistorySection === sectionId) {
        activeHistorySection = null;
    }
}


/* =======================================================
   LOAD PATIENTS AND APPOINTMENTS
======================================================= */

async function loadHistoryData() {
    showStatus("Loading patient and appointment history...");

    await Promise.all([
        loadPatients(),
        loadAppointments()
    ]);

    updateSummaryCards();

    if (statusMessage) {
        statusMessage.textContent =
            "Select a history card to view its records.";

        statusMessage.hidden = false;
    }
}


/* =======================================================
   LOAD ALL REGISTERED PATIENTS
======================================================= */

async function loadPatients() {
    if (patientsTableBody) {
        showTableMessage(patientsTableBody, 9, "Loading registered patients...");
    }

    try {
        const response = await fetch(PATIENTS_API);
        const result = await readApiResponse(response);

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Unable to load patients.");
        }

        const patients = Array.isArray(result)
            ? result
            : result.patients || [];

        allPatients = patients;

        renderPatients();

    } catch (error) {
        console.error("Load patients error:", error);

        allPatients = [];

        if (patientsTableBody) {
            showTableMessage(
                patientsTableBody,
                9,
                "Unable to load patients. Check that the backend is running."
            );
        }

        showToast("Unable to load registered patients.", "error");
    }
}


/* =======================================================
   LOAD ALL APPOINTMENTS
======================================================= */

async function loadAppointments() {
    if (completedAppointmentsTableBody) {
        showTableMessage(
            completedAppointmentsTableBody,
            7,
            "Loading completed appointments..."
        );
    }

    if (cancelledAppointmentsTableBody) {
        showTableMessage(
            cancelledAppointmentsTableBody,
            9,
            "Loading cancelled appointments..."
        );
    }

    try {
        const response = await fetch(APPOINTMENTS_API);
        const result = await readApiResponse(response);

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Unable to load appointments.");
        }

        const appointments = Array.isArray(result)
            ? result
            : result.appointments || [];

        allAppointments = appointments;

        renderCompletedAppointments();
        renderCancelledAppointments();

    } catch (error) {
        console.error("Load appointments error:", error);

        allAppointments = [];

        showTableMessage(
            completedAppointmentsTableBody,
            7,
            "Unable to load completed appointments. Check the backend."
        );

        showTableMessage(
            cancelledAppointmentsTableBody,
            9,
            "Unable to load cancelled appointments. Check the backend."
        );

        showToast("Unable to load appointment history.", "error");
    }
}


/* =======================================================
   READ API RESPONSE
======================================================= */

async function readApiResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return await response.json();
    }

    const text = await response.text();

    throw new Error(
        text || "The server returned an unexpected response."
    );
}


/* =======================================================
   UPDATE SUMMARY CARDS
======================================================= */

function updateSummaryCards() {
    if (totalPatientsElement) {
        totalPatientsElement.textContent = allPatients.length;
    }

    if (totalCompletedElement) {
        totalCompletedElement.textContent =
            allAppointments.filter(isCompletedAppointment).length;
    }

    if (totalCancelledElement) {
        totalCancelledElement.textContent =
            allAppointments.filter(isCancelledAppointment).length;
    }
}


/* =======================================================
   GET PATIENT FIELD VALUES
======================================================= */

function getPatientName(patient) {
    return patient?.FullName ??
        patient?.fullName ??
        patient?.Name ??
        "N/A";
}


function getPatientEmail(patient) {
    return patient?.Email ??
        patient?.email ??
        "N/A";
}


function getPatientMobile(patient) {
    return patient?.["Mobile No"] ??
        patient?.mobileNo ??
        patient?.MobileNo ??
        "N/A";
}


function getPatientDateOfBirth(patient) {
    return patient?.DateOfBirth ??
        patient?.dateOfBirth ??
        "";
}


function getPatientGender(patient) {
    return patient?.Gender ??
        patient?.gender ??
        "N/A";
}


function getPatientBloodGroup(patient) {
    return patient?.["Blood Group"] ??
        patient?.bloodGroup ??
        "N/A";
}


function getPatientAddress(patient) {
    return patient?.Address ??
        patient?.address ??
        "N/A";
}


function getPatientId(patient) {
    return patient?._id ??
        patient?.id ??
        "";
}


/* =======================================================
   RENDER REGISTERED PATIENTS
======================================================= */

function renderPatients() {
    if (!patientsTableBody) return;

    const searchTerm = patientSearch
        ? patientSearch.value.trim().toLowerCase()
        : "";

    const filteredPatients = allPatients.filter(function (patient) {
        const searchableText = [
            getPatientName(patient),
            getPatientEmail(patient),
            getPatientMobile(patient),
            getPatientAddress(patient)
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
    });

    if (patientRecordCount) {
        patientRecordCount.textContent =
            `${filteredPatients.length} patient${filteredPatients.length !== 1 ? "s" : ""}`;
    }

    if (filteredPatients.length === 0) {
        showTableMessage(
            patientsTableBody,
            9,
            allPatients.length === 0
                ? "No registered patients found."
                : "No patients match your search."
        );
        return;
    }

    patientsTableBody.innerHTML = filteredPatients.map(function (patient, index) {
        const patientId = getPatientId(patient);

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHTML(getPatientName(patient))}</td>
                <td>${escapeHTML(getPatientEmail(patient))}</td>
                <td>${escapeHTML(getPatientMobile(patient))}</td>
                <td>${escapeHTML(formatDate(getPatientDateOfBirth(patient)))}</td>
                <td>${escapeHTML(getPatientGender(patient))}</td>
                <td>${escapeHTML(getPatientBloodGroup(patient))}</td>
                <td>${escapeHTML(getPatientAddress(patient))}</td>
                <td>
                    <button
                        type="button"
                        class="edit-btn"
                        data-edit-patient="${escapeHTML(patientId)}"
                        ${patientId ? "" : "disabled"}
                    >
                        <i class="bi bi-pencil-square"></i>
                        Edit
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    patientsTableBody.querySelectorAll("[data-edit-patient]").forEach(function (button) {
        button.addEventListener("click", function () {
            openPatientEditor(button.dataset.editPatient);
        });
    });
}


/* =======================================================
   GET APPOINTMENT FIELD VALUES
======================================================= */

function getAppointmentStatus(appointment) {
    return String(
        appointment?.Status ??
        appointment?.status ??
        ""
    ).trim().toLowerCase();
}


function isCompletedAppointment(appointment) {
    return getAppointmentStatus(appointment) === "completed";
}


function isCancelledAppointment(appointment) {
    return getAppointmentStatus(appointment) === "cancelled";
}


function getAppointmentPatient(appointment) {
    const patient = appointment?.PatientID ??
        appointment?.patient ??
        appointment?.patientId;

    if (patient && typeof patient === "object") {
        return patient;
    }

    const patientId = typeof patient === "string"
        ? patient
        : "";

    return allPatients.find(function (item) {
        return getPatientId(item) === patientId;
    }) || null;
}


function getAppointmentDoctor(appointment) {
    const doctor = appointment?.DoctorID ??
        appointment?.doctor ??
        appointment?.doctorId;

    if (doctor && typeof doctor === "object") {
        return doctor;
    }

    return null;
}


/* =======================================================
   GET SAVED APPOINTMENT DOCTOR NAME
   Keep showing the saved name even if the doctor is deleted.
======================================================= */

function getAppointmentDoctorName(appointment) {
    const doctor = getAppointmentDoctor(appointment);

    return appointment?.DoctorName ||
        appointment?.doctorName ||
        doctor?.FullName ||
        doctor?.fullName ||
        "N/A";
}


function getAppointmentDate(appointment) {
    return appointment?.AppointmentDate ??
        appointment?.appointmentDate ??
        appointment?.Date ??
        appointment?.date ??
        "";
}


function getAppointmentTime(appointment) {
    return appointment?.AppointmentTime ??
        appointment?.appointmentTime ??
        appointment?.Time ??
        appointment?.time ??
        "N/A";
}


function getAppointmentType(appointment) {
    return appointment?.AppointmentType ??
        appointment?.appointmentType ??
        "N/A";
}


function getAppointmentId(appointment) {
    return appointment?._id ??
        appointment?.id ??
        "";
}


/* =======================================================
   RENDER COMPLETED APPOINTMENTS
======================================================= */

function renderCompletedAppointments() {
    if (!completedAppointmentsTableBody) return;

    const searchTerm = completedSearch
        ? completedSearch.value.trim().toLowerCase()
        : "";

    const completedAppointments = allAppointments.filter(function (appointment) {
        if (!isCompletedAppointment(appointment)) return false;

        const patient = getAppointmentPatient(appointment);

        const searchableText = [
            getPatientName(patient || {}),
            getPatientEmail(patient || {}),
            getAppointmentDoctorName(appointment),
            getAppointmentDate(appointment),
            getAppointmentTime(appointment),
            getAppointmentType(appointment)
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
    });

    if (completedRecordCount) {
        completedRecordCount.textContent =
            `${completedAppointments.length} appointment${completedAppointments.length !== 1 ? "s" : ""}`;
    }

    if (completedAppointments.length === 0) {
        showTableMessage(
            completedAppointmentsTableBody,
            7,
            "No completed appointments found."
        );
        return;
    }

    completedAppointmentsTableBody.innerHTML =
        completedAppointments.map(function (appointment, index) {
            const patient = getAppointmentPatient(appointment);

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHTML(getPatientName(patient || {}))}</td>
                    <td>${escapeHTML(getAppointmentDoctorName(appointment))}</td>
                    <td>${escapeHTML(formatDate(getAppointmentDate(appointment)))}</td>
                    <td>${escapeHTML(getAppointmentTime(appointment))}</td>
                    <td>${renderAppointmentType(getAppointmentType(appointment))}</td>
                    <td>
                        <span class="status-badge status-completed">
                            Completed
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
}


/* =======================================================
   RENDER CANCELLED APPOINTMENTS
======================================================= */

function renderCancelledAppointments() {
    if (!cancelledAppointmentsTableBody) return;

    const searchTerm = cancelledSearch
        ? cancelledSearch.value.trim().toLowerCase()
        : "";

    const cancelledAppointments = allAppointments.filter(function (appointment) {
        if (!isCancelledAppointment(appointment)) return false;

        const patient = getAppointmentPatient(appointment);

        const searchableText = [
            getPatientName(patient || {}),
            getPatientEmail(patient || {}),
            getAppointmentDoctorName(appointment),
            getAppointmentDate(appointment),
            getAppointmentTime(appointment),
            getAppointmentType(appointment),
            appointment?.CancelledBy || appointment?.cancelledBy || "",
            appointment?.CancellationReason || appointment?.cancellationReason || ""
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
    });

    if (cancelledRecordCount) {
        cancelledRecordCount.textContent =
            `${cancelledAppointments.length} appointment${cancelledAppointments.length !== 1 ? "s" : ""}`;
    }

    if (cancelledAppointments.length === 0) {
        showTableMessage(
            cancelledAppointmentsTableBody,
            9,
            "No cancelled appointments found."
        );
        return;
    }

    cancelledAppointmentsTableBody.innerHTML =
        cancelledAppointments.map(function (appointment, index) {
            const patient = getAppointmentPatient(appointment);

            const cancelledBy =
                appointment?.CancelledBy ??
                appointment?.cancelledBy ??
                "Not recorded";

            const cancellationReason =
                appointment?.CancellationReason ??
                appointment?.cancellationReason ??
                "Not recorded";

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHTML(getPatientName(patient || {}))}</td>
                    <td>${escapeHTML(getAppointmentDoctorName(appointment))}</td>
                    <td>${escapeHTML(formatDate(getAppointmentDate(appointment)))}</td>
                    <td>${escapeHTML(getAppointmentTime(appointment))}</td>
                    <td>${renderAppointmentType(getAppointmentType(appointment))}</td>
                    <td>${escapeHTML(cancelledBy)}</td>
                    <td>${escapeHTML(cancellationReason)}</td>
                    <td>
                        <span class="status-badge status-cancelled">
                            Cancelled
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
}


/* =======================================================
   RENDER APPOINTMENT TYPE
======================================================= */

function renderAppointmentType(type) {
    const normalizedType = String(type || "").trim();
    const lowerType = normalizedType.toLowerCase();

    let className = "";

    if (lowerType === "online") {
        className = "online";
    } else if (lowerType === "walk-in" || lowerType === "walkin") {
        className = "walkin";
    }

    return `
        <span class="appointment-type ${className}">
            ${escapeHTML(normalizedType || "N/A")}
        </span>
    `;
}


/* =======================================================
   SEARCH EVENTS
======================================================= */

function setupSearch() {
    if (patientSearch) {
        patientSearch.addEventListener("input", renderPatients);
    }

    if (completedSearch) {
        completedSearch.addEventListener("input", renderCompletedAppointments);
    }

    if (cancelledSearch) {
        cancelledSearch.addEventListener("input", renderCancelledAppointments);
    }
}


/* =======================================================
   SETUP PATIENT EDIT MODAL
======================================================= */

function setupPatientModal() {
    if (editPatientForm) {
        editPatientForm.addEventListener("submit", savePatientDetails);
    }

    if (closeEditModal) {
        closeEditModal.addEventListener("click", closePatientModal);
    }

    if (cancelEditPatient) {
        cancelEditPatient.addEventListener("click", closePatientModal);
    }

    if (editPatientModal) {
        editPatientModal.querySelectorAll("[data-close-modal]").forEach(function (element) {
            element.addEventListener("click", closePatientModal);
        });
    }
}


/* =======================================================
   OPEN PATIENT EDIT MODAL
======================================================= */

function openPatientEditor(patientId) {
    const patient = allPatients.find(function (item) {
        return String(getPatientId(item)) === String(patientId);
    });

    if (!patient) {
        showToast("Patient record not found.", "error");
        return;
    }

    currentPatientId = patientId;

    editPatientId.value = patientId;
    editFullName.value = getPatientName(patient) === "N/A"
        ? ""
        : getPatientName(patient);

    editEmail.value = getPatientEmail(patient) === "N/A"
        ? ""
        : getPatientEmail(patient);

    editMobileNo.value = getPatientMobile(patient) === "N/A"
        ? ""
        : getPatientMobile(patient);

    editDateOfBirth.value = formatDateForInput(getPatientDateOfBirth(patient));
    editGender.value = getPatientGender(patient) === "N/A"
        ? ""
        : getPatientGender(patient);

    editBloodGroup.value = getPatientBloodGroup(patient) === "N/A"
        ? ""
        : getPatientBloodGroup(patient);

    editAddress.value = getPatientAddress(patient) === "N/A"
        ? ""
        : getPatientAddress(patient);

    clearPatientFormErrors();

    if (editPatientMessage) {
        editPatientMessage.textContent = "";
        editPatientMessage.className = "modal-message";
    }

    if (editPatientModal) {
        editPatientModal.hidden = false;
        document.body.style.overflow = "hidden";
        editFullName.focus();
    }
}


/* =======================================================
   CLOSE PATIENT EDIT MODAL
======================================================= */

function closePatientModal() {
    if (editPatientModal) {
        editPatientModal.hidden = true;
    }

    document.body.style.overflow = "";
    currentPatientId = null;
}


/* =======================================================
   SAVE PATIENT DETAILS
======================================================= */

async function savePatientDetails(event) {
    event.preventDefault();

    clearPatientFormErrors();

    if (!editPatientForm.checkValidity()) {
        editPatientForm.reportValidity();
        return;
    }

    const patientId = editPatientId.value || currentPatientId;

    if (!patientId) {
        showPatientFormMessage("Patient ID is missing.", "error");
        return;
    }

    const fullName = editFullName.value.trim();
    const email = editEmail.value.trim();
    const mobileNo = editMobileNo.value.trim();
    const dateOfBirth = editDateOfBirth.value;
    const gender = editGender.value;
    const bloodGroup = editBloodGroup.value;
    const address = editAddress.value.trim();

    if (!fullName || !email || !mobileNo ||
        !dateOfBirth || !gender || !bloodGroup || !address) {

        showPatientFormMessage("Please complete all patient fields.", "error");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError("emailError", "Please enter a valid email address.");
        editEmail.focus();
        return;
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(mobileNo)) {
        showFieldError("mobileNoError", "Please enter a valid mobile number.");
        editMobileNo.focus();
        return;
    }

    const payload = {
        fullName,
        email,
        mobileNo,
        dateOfBirth,
        gender,
        bloodGroup,
        address
    };

    savePatientChanges.disabled = true;
    savePatientChanges.innerHTML =
        '<i class="bi bi-hourglass-split"></i> Saving...';

    showPatientFormMessage("Saving patient details...", "");

    try {
        const response = await fetch(
            `${PATIENTS_API}/profile/${encodeURIComponent(patientId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const result = await readApiResponse(response);

        if (!response.ok || result.success === false) {
            throw new Error(
                result.message || "Unable to update patient details."
            );
        }

        const updatedPatient = result.patient || result.data || result;

        /*
         * Update the local patient record using the response from
         * the existing patient profile API.
         */
        const patientIndex = allPatients.findIndex(function (patient) {
            return String(getPatientId(patient)) === String(patientId);
        });

        if (patientIndex !== -1) {
            allPatients[patientIndex] = {
                ...allPatients[patientIndex],
                ...updatedPatient,
                _id: getPatientId(allPatients[patientIndex]),
                FullName: updatedPatient.fullName ?? fullName,
                Email: updatedPatient.email ?? email,
                "Mobile No": updatedPatient.mobileNo ?? mobileNo,
                DateOfBirth: updatedPatient.dateOfBirth ?? dateOfBirth,
                Gender: updatedPatient.gender ?? gender,
                "Blood Group": updatedPatient.bloodGroup ?? bloodGroup,
                Address: updatedPatient.address ?? address
            };
        }

        renderPatients();

        showPatientFormMessage(
            result.message || "Patient details updated successfully.",
            "success"
        );

        showToast("Patient details updated successfully.", "success");

        setTimeout(function () {
            closePatientModal();
        }, 800);

    } catch (error) {
        console.error("Update patient error:", error);

        showPatientFormMessage(
            error.message || "Unable to update patient details.",
            "error"
        );
    } finally {
        savePatientChanges.disabled = false;
        savePatientChanges.innerHTML =
            '<i class="bi bi-check-lg"></i> Save Changes';
    }
}


/* =======================================================
   FORM ERROR HELPERS
======================================================= */

function showFieldError(elementId, message) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = message;
    }
}


function clearPatientFormErrors() {
    document.querySelectorAll(".field-error").forEach(function (element) {
        element.textContent = "";
    });
}


function showPatientFormMessage(message, type) {
    if (!editPatientMessage) return;

    editPatientMessage.textContent = message;
    editPatientMessage.className = "modal-message";

    if (type) {
        editPatientMessage.classList.add(type);
    }
}


/* =======================================================
   TOAST NOTIFICATION
======================================================= */

let toastTimeout = null;


function showToast(message, type = "success") {
    if (!toastMessage || !toastText) {
        console.log(message);
        return;
    }

    toastText.textContent = message;
    toastMessage.hidden = false;

    toastMessage.style.background =
        type === "error" ? "#B91C1C" : "#1769D5";

    if (toastProgress) {
        toastProgress.style.transition = "none";
        toastProgress.style.width = "100%";

        void toastProgress.offsetWidth;

        toastProgress.style.transition = "width 4s linear";
        toastProgress.style.width = "0%";
    }

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {
        hideToast();
    }, 4000);
}


function hideToast() {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }

    if (toastMessage) {
        toastMessage.hidden = true;
    }
}


if (closeToast) {
    closeToast.addEventListener("click", hideToast);
}


/* =======================================================
   GENERAL STATUS MESSAGE
======================================================= */

function showStatus(message) {
    if (!statusMessage) return;

    statusMessage.textContent = message;
    statusMessage.hidden = false;
}


/* =======================================================
   TABLE MESSAGE
======================================================= */

function showTableMessage(tableBody, columnCount, message) {
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="${columnCount}" class="empty-state">
                ${escapeHTML(message)}
            </td>
        </tr>
    `;
}


/* =======================================================
   DATE FORMAT HELPERS
======================================================= */

function formatDate(value) {
    if (!value) return "N/A";

    const dateString = String(value);

    /*
     * Preserve date-only values as local calendar dates.
     * Avoid timezone shifting YYYY-MM-DD dates.
     */
    const dateOnlyMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
        return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}


function formatDateForInput(value) {
    if (!value) return "";

    const dateString = String(value);

    const dateOnlyMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})/);

    if (dateOnlyMatch) {
        return dateOnlyMatch[1];
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =======================================================
   ESCAPE HTML
   PROTECT TABLE OUTPUT FROM HTML IN DATABASE VALUES
======================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
