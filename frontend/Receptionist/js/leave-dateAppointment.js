/* =======================================================
   DERMCARE - LEAVE DATE APPOINTMENT JAVASCRIPT
======================================================= */

if (window.dermCareLeaveDateInitialized) {
    console.warn("DermCare Leave Date JavaScript is already initialized.");
} else {
    window.dermCareLeaveDateInitialized = true;

    /* ===================================================
       API CONFIGURATION
    =================================================== */

    const API_BASE_URL = "http://localhost:5000/api";
    const LEAVE_API = `${API_BASE_URL}/leaves`;
    const DOCTOR_API = `${API_BASE_URL}/doctors`;
    const APPOINTMENT_API = `${API_BASE_URL}/appointments`;

    /* ===================================================
       DOM ELEMENTS
    =================================================== */

    const leaveDateForm = document.getElementById("leaveDateForm");
    const doctorSelect = document.getElementById("doctorSelect");
    const leaveDateInput = document.getElementById("leaveDate");
    const leaveReasonInput = document.getElementById("leaveReason");
    const addLeaveBtn = document.getElementById("addLeaveBtn");

    const affectedAppointmentsBody =
        document.getElementById("affectedAppointmentsBody");

    const leaveRecordsBody =
        document.getElementById("leaveRecordsBody");

    const affectedAppointmentsCount =
        document.getElementById("affectedAppointmentsCount");

    const noAffectedAppointments =
        document.getElementById("noAffectedAppointments");

    const noLeaveRecords =
        document.getElementById("noLeaveRecords");

    /* ===================================================
       GLOBAL DATA
    =================================================== */

    let doctors = [];
    let leaveRecords = [];
    let affectedAppointments = [];

    let selectedRescheduleAppointment = null;
    let selectedCancelAppointment = null;
    let selectedRemoveLeave = null;

    /* ===================================================
       INITIALIZE PAGE
    =================================================== */

    document.addEventListener("DOMContentLoaded", initializeLeaveDatePage);

    async function initializeLeaveDatePage() {
        displayCurrentDate();
        setupSidebar();
        setupLogout();
        setupModalEvents();
        setupFormEvents();
        setupRemoveLeaveModalEvents();
        setupToastContainer();
        setMinimumDates();

        await loadPageData();
    }

    /* ===================================================
       DISPLAY CURRENT DATE
    =================================================== */

    function displayCurrentDate() {
        const currentDateElement =
            document.getElementById("currentDate");

        if (!currentDateElement) return;

        currentDateElement.textContent =
            new Date().toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
    }

    /* ===================================================
       DATE HELPERS
    =================================================== */

    function getLocalDateString() {
        const date = new Date();

        const year = date.getFullYear();
        const month =
            String(date.getMonth() + 1).padStart(2, "0");
        const day =
            String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function setMinimumDates() {
        const today = getLocalDateString();

        if (leaveDateInput) {
            leaveDateInput.min = today;
        }

        const newDate =
            document.getElementById("newAppointmentDate");

        if (newDate) {
            newDate.min = today;
        }
    }

    function getDateString(value) {
        if (!value) return "";

        if (value instanceof Date && !isNaN(value)) {
            const year = value.getFullYear();
            const month =
                String(value.getMonth() + 1).padStart(2, "0");
            const day =
                String(value.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        }

        if (typeof value === "object") {

            if (value.$date) {
                return getDateString(value.$date);
            }

            if (value.date) {
                return getDateString(value.date);
            }

            if (value.value) {
                return getDateString(value.value);
            }

            return "";
        }

        if (typeof value === "string") {
            const cleaned = value.trim();

            if (!cleaned) return "";

            if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
                return cleaned.substring(0, 10);
            }

            const parsed = new Date(cleaned);

            if (!isNaN(parsed)) {
                const year = parsed.getFullYear();
                const month =
                    String(parsed.getMonth() + 1).padStart(2, "0");
                const day =
                    String(parsed.getDate()).padStart(2, "0");

                return `${year}-${month}-${day}`;
            }
        }

        return "";
    }

    function formatDate(value) {
        const dateString = getDateString(value);

        if (!dateString) return "-";

        const date =
            new Date(`${dateString}T00:00:00`);

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    /* ===================================================
       LOAD PAGE DATA
    =================================================== */

    async function loadPageData() {

        console.log("==========================================");
        console.log("DermCare: Loading Leave Date Page Data");
        console.log("==========================================");

        await Promise.all([
            loadDoctors(),
            loadLeaveRecords()
        ]);

        await loadAppointments();

        renderAffectedAppointments();
        renderLeaveRecords();
    }

    /* ===================================================
       API REQUEST HELPER
    =================================================== */

    async function apiRequest(url, options = {}) {

        const response = await fetch(url, {
            ...options,

            headers: {
                ...(options.body
                    ? { "Content-Type": "application/json" }
                    : {}),
                ...(options.headers || {})
            }
        });

        let data = {};

        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (!response.ok || data.success === false) {
            throw new Error(
                data.message || "Request failed."
            );
        }

        return data;
    }

    /* ===================================================
       LOAD DOCTORS
    =================================================== */

    async function loadDoctors() {

        if (!doctorSelect) return;

        doctorSelect.innerHTML =
            '<option value="">Loading doctors...</option>';

        try {

            const data =
                await apiRequest(DOCTOR_API);

            doctors =
                Array.isArray(data.doctors)
                    ? data.doctors
                    : [];

            console.log(
                "DermCare Doctors:",
                doctors
            );

            populateDoctorDropdown();

        } catch (error) {

            console.error(
                "Error loading doctors:",
                error
            );

            doctorSelect.innerHTML =
                '<option value="">Unable to load doctors</option>';
        }
    }

    /* ===================================================
       POPULATE DOCTOR DROPDOWN
    =================================================== */

    function populateDoctorDropdown() {

        if (!doctorSelect) return;

        doctorSelect.innerHTML = "";

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent =
            "Select Doctor";

        doctorSelect.appendChild(defaultOption);

        if (doctors.length === 0) {

            defaultOption.textContent =
                "No doctors found";

            return;
        }

        doctors.forEach(doctor => {

            const option =
                document.createElement("option");

            option.value =
                getDoctorObjectId(doctor);

            option.textContent =
                getDoctorObjectName(doctor);

            doctorSelect.appendChild(option);
        });
    }

    /* ===================================================
       LOAD LEAVE RECORDS
    =================================================== */

    async function loadLeaveRecords() {

        try {

            const data =
                await apiRequest(LEAVE_API);

            leaveRecords =
                Array.isArray(data.leaves)
                    ? data.leaves
                    : [];

            console.log(
                "DermCare Leave Records:",
                leaveRecords
            );

        } catch (error) {

            console.error(
                "Error loading leave records:",
                error
            );

            leaveRecords = [];

            if (leaveRecordsBody) {

                leaveRecordsBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-row">
                            Unable to load leave records.
                        </td>
                    </tr>
                `;
            }
        }
    }

    /* ===================================================
       LOAD APPOINTMENTS
    =================================================== */

    async function loadAppointments() {

        try {

            const data =
                await apiRequest(APPOINTMENT_API);

            const appointments =
                Array.isArray(data.appointments)
                    ? data.appointments
                    : [];

            console.log(
                "DermCare All Appointments:",
                appointments
            );

            const activeStatuses = [
                "pending",
                "booked",
                "confirmed",
                "arrived",
                "scheduled",
                "approved",
                "active"
            ];

            affectedAppointments =
                appointments.filter(
                    appointment => {

                        const rawStatus =
                            appointment.Status ||
                            appointment.status ||
                            appointment.AppointmentStatus ||
                            appointment.appointmentStatus ||
                            "";

                        const status =
                            String(rawStatus)
                                .trim()
                                .toLowerCase();

                        if (
                            status &&
                            !activeStatuses.includes(status)
                        ) {

                            console.log(
                                "Skipping inactive appointment:",
                                appointment
                            );

                            return false;
                        }

                        return isAppointmentAffected(
                            appointment
                        );
                    }
                );

            console.log(
                "DermCare Affected Appointments:",
                affectedAppointments
            );

        } catch (error) {

            console.error(
                "Error loading appointments:",
                error
            );

            affectedAppointments = [];

            if (affectedAppointmentsBody) {

                affectedAppointmentsBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-row">
                            Unable to load affected appointments.
                        </td>
                    </tr>
                `;
            }
        }
    }

    /* ===================================================
       GET ID FROM OBJECT OR STRING
    =================================================== */

    function getId(value) {

        if (!value) return "";

        if (typeof value === "object") {

            if (value.$oid) {
                return String(value.$oid).trim();
            }

            if (value._id) {

                if (
                    typeof value._id === "object" &&
                    value._id.$oid
                ) {
                    return String(
                        value._id.$oid
                    ).trim();
                }

                return String(
                    value._id
                ).trim();
            }

            if (value.id) {
                return String(
                    value.id
                ).trim();
            }

            if (value.Id) {
                return String(
                    value.Id
                ).trim();
            }

            if (value.ID) {
                return String(
                    value.ID
                ).trim();
            }

            if (value.toString) {

                const converted =
                    String(value.toString());

                if (
                    converted !== "[object Object]"
                ) {
                    return converted.trim();
                }
            }

            return "";
        }

        return String(value).trim();
    }

    /* ===================================================
       GET DOCTOR OBJECT ID
       IMPORTANT FIX
    =================================================== */

    function getDoctorObjectId(doctor) {

        if (!doctor) return "";

        const possibleIds = [
            doctor._id,
            doctor.id,
            doctor.DoctorID,
            doctor.doctorId,
            doctor.DoctorId,
            doctor.doctorID,
            doctor.ID,
            doctor.Id
        ];

        for (const value of possibleIds) {

            const id = getId(value);

            if (id) {
                return id;
            }
        }

        return "";
    }

    /* ===================================================
       GET DOCTOR OBJECT NAME
       IMPORTANT FIX
    =================================================== */

    function getDoctorObjectName(doctor) {

        if (!doctor) {
            return "Unknown Doctor";
        }

        const possibleNames = [
            doctor.FullName,
            doctor.fullName,
            doctor.full_name,
            doctor.DoctorName,
            doctor.doctorName,
            doctor.Name,
            doctor.name,
            doctor.fullname
        ];

        for (const value of possibleNames) {

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim()
            ) {
                return String(value).trim();
            }
        }

        return "Unknown Doctor";
    }

    /* ===================================================
       GET DOCTOR ID FROM ANY OBJECT
       IMPORTANT FIX
    =================================================== */

    function getDoctorIdFromRecord(record) {

        if (!record) return "";

        const possibleValues = [

            record.DoctorID,
            record.doctorId,

            record.DoctorId,
            record.doctorID,

            record.Doctor,
            record.doctor,

            record.doctor_id,
            record.Doctor_Id,

            record.Doctor_ID,
            record.doctor_ID,

            record.doctor_id,

            record.DoctorRef,
            record.doctorRef
        ];

        for (const value of possibleValues) {

            const id = getId(value);

            if (id) {
                return id;
            }
        }

        return "";
    }

    /* ===================================================
       GET LEAVE DATE FROM RECORD
    =================================================== */

    function getLeaveDateFromRecord(leave) {

        if (!leave) return "";

        return getDateString(

            leave.leaveDate ||

            leave.LeaveDate ||

            leave.leave_date ||

            leave.date ||

            leave.Date
        );
    }

    /* ===================================================
       GET APPOINTMENT DATE FROM RECORD
    =================================================== */

    function getAppointmentDateFromRecord(
        appointment
    ) {

        if (!appointment) return "";

        return getDateString(

            appointment.AppointmentDate ||

            appointment.appointmentDate ||

            appointment.appointment_date ||

            appointment.date ||

            appointment.Date
        );
    }

    /* ===================================================
       CHECK IF APPOINTMENT IS AFFECTED BY LEAVE
    =================================================== */

    function isAppointmentAffected(
        appointment
    ) {

        const appointmentDoctorId =
            getDoctorIdFromRecord(
                appointment
            );

        const appointmentDate =
            getAppointmentDateFromRecord(
                appointment
            );

        if (
            !appointmentDoctorId ||
            !appointmentDate
        ) {

            console.warn(
                "Appointment cannot be matched:",
                {
                    appointmentDoctorId,
                    appointmentDate,
                    appointment
                }
            );

            return false;
        }

        const matchedLeave =
            leaveRecords.find(leave => {

                const leaveDoctorId =
                    getDoctorIdFromRecord(
                        leave
                    );

                const leaveDate =
                    getLeaveDateFromRecord(
                        leave
                    );

                const doctorMatches =
                    String(leaveDoctorId).trim() ===
                    String(appointmentDoctorId).trim();

                const dateMatches =
                    String(leaveDate).trim() ===
                    String(appointmentDate).trim();

                return (
                    doctorMatches &&
                    dateMatches
                );
            });

        return !!matchedLeave;
    }

    /* ===================================================
       SAFE HTML
    =================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* ===================================================
       GET PATIENT NAME
    =================================================== */

    function getPatientName(appointment) {

        const patient =
            appointment.PatientID ||
            appointment.patientId ||
            appointment.Patient ||
            appointment.patient;

        if (
            patient &&
            typeof patient === "object"
        ) {

            return (
                patient.FullName ||
                patient.fullName ||
                patient.Name ||
                patient.name ||
                "Patient"
            );
        }

        return (
            appointment.patientName ||
            appointment.PatientName ||
            "Patient"
        );
    }

    /* ===================================================
       GET DOCTOR NAME
       IMPORTANT FIX
    =================================================== */

    function getDoctorName(appointment) {

        if (!appointment) {
            return "Unknown Doctor";
        }

        const directName =
            appointment.doctorName ||
            appointment.DoctorName ||
            appointment.DoctorFullName ||
            appointment.doctorFullName;

        if (
            directName &&
            String(directName).trim()
        ) {
            return String(directName).trim();
        }

        const doctor =
            appointment.Doctor ||
            appointment.doctor;

        if (
            doctor &&
            typeof doctor === "object"
        ) {

            const populatedName =
                doctor.FullName ||
                doctor.fullName ||
                doctor.DoctorName ||
                doctor.doctorName ||
                doctor.Name ||
                doctor.name;

            if (
                populatedName &&
                String(populatedName).trim()
            ) {
                return String(
                    populatedName
                ).trim();
            }
        }

        const doctorId =
            getAppointmentDoctorId(
                appointment
            );

        if (doctorId) {

            const matchedDoctor =
                getDoctorById(
                    doctorId
                );

            if (matchedDoctor) {
                return getDoctorObjectName(
                    matchedDoctor
                );
            }
        }

        return "Unknown Doctor";
    }

    /* ===================================================
       GET DOCTOR OBJECT
       IMPORTANT FIX
    =================================================== */

    function getDoctorById(doctorId) {

        if (!doctorId) return null;

        const searchId =
            String(
                getId(doctorId)
            ).trim();

        if (!searchId) return null;

        return doctors.find(doctor => {

            const currentDoctorId =
                getDoctorObjectId(
                    doctor
                );

            return (
                String(currentDoctorId).trim() ===
                searchId
            );
        }) || null;
    }

    /* ===================================================
       GET DOCTOR NAME FROM LEAVE RECORD
       IMPORTANT FIX FOR "UNKNOWN DOCTOR"
    =================================================== */

    function getLeaveDoctorName(leave) {

        if (!leave) {
            return "Unknown Doctor";
        }

        console.log(
            "Resolving Leave Doctor Name:",
            leave
        );

        /* -----------------------------------------------
           1. DIRECT DOCTOR NAME
        ----------------------------------------------- */

        const directNames = [
            leave.doctorName,
            leave.DoctorName,
            leave.DoctorFullName,
            leave.doctorFullName,
            leave.fullName,
            leave.FullName
        ];

        for (const value of directNames) {

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim()
            ) {
                return String(value).trim();
            }
        }

        /* -----------------------------------------------
           2. POPULATED DOCTOR OBJECT
        ----------------------------------------------- */

        const populatedDoctors = [
            leave.doctor,
            leave.Doctor,
            leave.doctorData,
            leave.DoctorData
        ];

        for (const populatedDoctor of populatedDoctors) {

            if (
                populatedDoctor &&
                typeof populatedDoctor === "object"
            ) {

                const populatedName =
                    getDoctorObjectName(
                        populatedDoctor
                    );

                if (
                    populatedName &&
                    populatedName !== "Unknown Doctor"
                ) {
                    return populatedName;
                }
            }
        }

        /* -----------------------------------------------
           3. GET DOCTOR ID FROM LEAVE
        ----------------------------------------------- */

        const leaveDoctorId =
            getDoctorIdFromRecord(
                leave
            );

        console.log(
            "Leave Doctor ID:",
            leaveDoctorId
        );

        if (leaveDoctorId) {

            const matchedDoctor =
                getDoctorById(
                    leaveDoctorId
                );

            console.log(
                "Matched Doctor:",
                matchedDoctor
            );

            if (matchedDoctor) {

                const doctorName =
                    getDoctorObjectName(
                        matchedDoctor
                    );

                if (
                    doctorName &&
                    doctorName !== "Unknown Doctor"
                ) {
                    return doctorName;
                }
            }
        }

        /* -----------------------------------------------
           4. FALLBACK: MATCH BY SELECTED DOCTOR
        ----------------------------------------------- */

        if (
            leave.DoctorID &&
            typeof leave.DoctorID === "object"
        ) {

            const embeddedName =
                getDoctorObjectName(
                    leave.DoctorID
                );

            if (
                embeddedName &&
                embeddedName !== "Unknown Doctor"
            ) {
                return embeddedName;
            }
        }

        if (
            leave.doctorId &&
            typeof leave.doctorId === "object"
        ) {

            const embeddedName =
                getDoctorObjectName(
                    leave.doctorId
                );

            if (
                embeddedName &&
                embeddedName !== "Unknown Doctor"
            ) {
                return embeddedName;
            }
        }

        return "Unknown Doctor";
    }

    /* ===================================================
       GET APPOINTMENT DOCTOR ID
    =================================================== */

    function getAppointmentDoctorId(
        appointment
    ) {

        return getDoctorIdFromRecord(
            appointment
        );
    }

    /* ===================================================
       GET APPOINTMENT ID
    =================================================== */

    function getAppointmentId(
        appointment
    ) {

        return getId(
            appointment?._id ||
            appointment?.id ||
            appointment?.AppointmentID ||
            appointment?.appointmentId
        );
    }

    /* ===================================================
       RENDER AFFECTED APPOINTMENTS
    =================================================== */

    function renderAffectedAppointments() {

        if (!affectedAppointmentsBody) return;

        affectedAppointmentsBody.innerHTML = "";

        if (affectedAppointmentsCount) {

            affectedAppointmentsCount.textContent =
                `${affectedAppointments.length} Appointments`;
        }

        if (
            affectedAppointments.length === 0
        ) {

            if (noAffectedAppointments) {

                noAffectedAppointments.style.display =
                    "block";
            }

            return;
        }

        if (noAffectedAppointments) {

            noAffectedAppointments.style.display =
                "none";
        }

        affectedAppointments.forEach(
            appointment => {

                const row =
                    document.createElement("tr");

                const appointmentDate =
                    appointment.AppointmentDate ||
                    appointment.appointmentDate ||
                    appointment.appointment_date ||
                    appointment.date;

                const appointmentTime =
                    appointment.AppointmentTime ||
                    appointment.appointmentTime ||
                    appointment.appointment_time ||
                    appointment.time;

                const appointmentType =
                    appointment.AppointmentType ||
                    appointment.appointmentType ||
                    appointment.appointment_type ||
                    appointment.type;

                const appointmentId =
                    getAppointmentId(
                        appointment
                    );

                row.innerHTML = `
                    <td>
                        ${escapeHTML(
                            getPatientName(
                                appointment
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getDoctorName(
                                appointment
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            formatDate(
                                appointmentDate
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            appointmentTime || "-"
                        )}
                    </td>

                    <td>
                        <span class="appointment-type">
                            ${escapeHTML(
                                appointmentType || "-"
                            )}
                        </span>
                    </td>

                    <td>
                        <span class="status-badge status-affected">
                            Action Required
                        </span>
                    </td>

                    <td>
                        <div class="action-buttons">

                            <button
                                type="button"
                                class="reschedule-btn"
                                data-id="${escapeHTML(
                                    appointmentId
                                )}">

                                <i class="bi bi-calendar2-week"></i>

                                Reschedule

                            </button>

                            <button
                                type="button"
                                class="cancel-btn"
                                data-id="${escapeHTML(
                                    appointmentId
                                )}">

                                <i class="bi bi-x-circle"></i>

                                Cancel

                            </button>

                        </div>
                    </td>
                `;

                affectedAppointmentsBody.appendChild(
                    row
                );
            }
        );

        setupAffectedAppointmentButtons();
    }

    /* ===================================================
       AFFECTED APPOINTMENT BUTTON EVENTS
    =================================================== */

    function setupAffectedAppointmentButtons() {

        document.querySelectorAll(
            ".reschedule-btn"
        ).forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openRescheduleModal(
                        button.dataset.id
                    );
                }
            );
        });

        document.querySelectorAll(
            ".cancel-btn"
        ).forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openCancelModal(
                        button.dataset.id
                    );
                }
            );
        });
    }

    /* ===================================================
       RENDER LEAVE RECORDS
       IMPORTANT FIX
    =================================================== */

    function renderLeaveRecords() {

        if (!leaveRecordsBody) return;

        leaveRecordsBody.innerHTML = "";

        if (leaveRecords.length === 0) {

            if (noLeaveRecords) {

                noLeaveRecords.style.display =
                    "block";
            }

            return;
        }

        if (noLeaveRecords) {

            noLeaveRecords.style.display =
                "none";
        }

        leaveRecords.forEach(leave => {

            const row =
                document.createElement("tr");

            const doctorName =
                getLeaveDoctorName(
                    leave
                );

            const leaveDate =
                leave.leaveDate ||
                leave.LeaveDate ||
                leave.date ||
                leave.Date;

            const reason =
                leave.reason ||
                leave.Reason ||
                "-";

            const leaveId =
                getId(
                    leave.id ||
                    leave._id
                );

            const addedByValue =
                leave.addedBy ||
                leave.AddedBy ||
                leave.createdBy ||
                leave.CreatedBy ||
                "";

            const addedBy =
                addedByValue
                    ? String(addedByValue)
                    : "—";

            row.innerHTML = `
                <td>
                    ${escapeHTML(
                        doctorName
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        formatDate(
                            leaveDate
                        )
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        reason
                    )}
                </td>

                <td>
                    <span class="status-badge status-affected">
                        On Leave
                    </span>
                </td>

                <td>
                    ${escapeHTML(
                        addedBy
                    )}
                </td>

                <td>
                    <button
                        type="button"
                        class="remove-leave-btn"
                        data-id="${escapeHTML(
                            leaveId
                        )}">

                        <i class="bi bi-trash"></i>

                        Remove

                    </button>
                </td>
            `;

            leaveRecordsBody.appendChild(
                row
            );
        });

        setupRemoveLeaveButtons();
    }

    /* ===================================================
       ADD LEAVE FORM EVENTS
    =================================================== */

    function setupFormEvents() {

        if (!leaveDateForm) return;

        leaveDateForm.addEventListener(
            "submit",
            handleAddLeave
        );
    }

    /* ===================================================
       ADD DOCTOR LEAVE
    =================================================== */

    async function handleAddLeave(event) {

        event.preventDefault();

        const doctorId =
            doctorSelect?.value;

        const leaveDate =
            leaveDateInput?.value;

        const reason =
            leaveReasonInput?.value.trim() || "";

        if (!doctorId || !leaveDate) {

            showToast(
                "Please select a doctor and leave date.",
                "error"
            );

            return;
        }

        if (
            leaveDate <
            getLocalDateString()
        ) {

            showToast(
                "Past dates cannot be added as leave.",
                "error"
            );

            return;
        }

        const alreadyExists =
            leaveRecords.some(leave => {

                return (
                    getDoctorIdFromRecord(leave) ===
                    String(doctorId).trim() &&

                    getLeaveDateFromRecord(leave) ===
                    String(leaveDate).trim()
                );
            });

        if (alreadyExists) {

            showToast(
                "Leave date is already added for this doctor.",
                "error"
            );

            return;
        }

        try {

            if (addLeaveBtn) {

                addLeaveBtn.disabled = true;

                addLeaveBtn.innerHTML = `
                    <i class="bi bi-arrow-repeat"></i>
                    Adding...
                `;
            }

            await apiRequest(
                `${LEAVE_API}/add`,
                {
                    method: "POST",

                    body: JSON.stringify({
                        doctorId,
                        leaveDate,
                        reason,
                        AddedBy: "Receptionist"
                    })
                }
            );

            showToast(
                "Doctor leave date added successfully!",
                "success"
            );

            leaveDateForm.reset();

            setMinimumDates();

            await loadPageData();

        } catch (error) {

            console.error(
                "Error adding leave:",
                error
            );

            showToast(
                error.message ||
                "Unable to add leave date.",
                "error"
            );

        } finally {

            if (addLeaveBtn) {

                addLeaveBtn.disabled = false;

                addLeaveBtn.innerHTML = `
                    <i class="bi bi-plus-circle"></i>
                    Add Leave Date
                `;
            }
        }
    }

    /* ===================================================
       REMOVE LEAVE BUTTON EVENTS
    =================================================== */

    function setupRemoveLeaveButtons() {

        document.querySelectorAll(
            ".remove-leave-btn"
        ).forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openRemoveLeaveModal(
                        button.dataset.id
                    );
                }
            );
        });
    }

    /* ===================================================
       OPEN REMOVE LEAVE MODAL
    =================================================== */

    function openRemoveLeaveModal(
        leaveId
    ) {

        selectedRemoveLeave =
            leaveRecords.find(
                leave =>
                    getId(
                        leave.id ||
                        leave._id
                    ) ===
                    getId(leaveId)
            );

        if (!selectedRemoveLeave) {

            showToast(
                "Leave record not found.",
                "error"
            );

            return;
        }

        const doctorNameElement =
            document.getElementById(
                "removeLeaveDoctorName"
            );

        const leaveDateElement =
            document.getElementById(
                "removeLeaveDate"
            );

        const leaveIdInput =
            document.getElementById(
                "removeLeaveId"
            );

        if (doctorNameElement) {

            doctorNameElement.textContent =
                getLeaveDoctorName(
                    selectedRemoveLeave
                );
        }

        if (leaveDateElement) {

            leaveDateElement.textContent =
                formatDate(
                    selectedRemoveLeave.leaveDate ||
                    selectedRemoveLeave.LeaveDate
                );
        }

        if (leaveIdInput) {
            leaveIdInput.value = leaveId;
        }

        document
            .getElementById(
                "removeLeaveModal"
            )
            ?.classList.add("show");
    }

    /* ===================================================
       REMOVE LEAVE MODAL EVENTS
    =================================================== */

    function setupRemoveLeaveModalEvents() {

        document
            .getElementById(
                "cancelRemoveLeaveBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    closeModal(
                        "removeLeaveModal"
                    );
                }
            );

        document
            .getElementById(
                "closeRemoveLeaveModal"
            )
            ?.addEventListener(
                "click",
                () => {

                    closeModal(
                        "removeLeaveModal"
                    );
                }
            );

        document
            .getElementById(
                "confirmRemoveLeaveBtn"
            )
            ?.addEventListener(
                "click",
                handleConfirmRemoveLeave
            );
    }

    /* ===================================================
       CONFIRM REMOVE LEAVE
    =================================================== */

    async function handleConfirmRemoveLeave() {

        const leaveId =
            document.getElementById(
                "removeLeaveId"
            )?.value ||
            getId(
                selectedRemoveLeave?.id ||
                selectedRemoveLeave?._id
            );

        if (!leaveId) {

            showToast(
                "Leave record ID is missing.",
                "error"
            );

            return;
        }

        const button =
            document.getElementById(
                "confirmRemoveLeaveBtn"
            );

        try {

            if (button) {

                button.disabled = true;

                button.textContent =
                    "Removing...";
            }

            await apiRequest(
                `${LEAVE_API}/${leaveId}`,
                {
                    method: "DELETE"
                }
            );

            closeModal(
                "removeLeaveModal"
            );

            selectedRemoveLeave = null;

            showToast(
                "Leave date removed successfully!",
                "success"
            );

            await loadPageData();

        } catch (error) {

            console.error(
                "Error removing leave:",
                error
            );

            showToast(
                error.message ||
                "Unable to remove leave date.",
                "error"
            );

        } finally {

            if (button) {

                button.disabled = false;

                button.innerHTML = `
                    <i class="bi bi-trash"></i>
                    Confirm Remove
                `;
            }
        }
    }

    /* ===================================================
       OPEN RESCHEDULE MODAL
    =================================================== */

    function openRescheduleModal(
        appointmentId
    ) {

        selectedRescheduleAppointment =
            affectedAppointments.find(
                appointment =>
                    getAppointmentId(
                        appointment
                    ) === appointmentId
            );

        if (!selectedRescheduleAppointment) {
            return;
        }

        document.getElementById(
            "rescheduleAppointmentId"
        ).value = appointmentId;

        document.getElementById(
            "reschedulePatientName"
        ).textContent =
            getPatientName(
                selectedRescheduleAppointment
            );

        document.getElementById(
            "rescheduleDoctorName"
        ).textContent =
            getDoctorName(
                selectedRescheduleAppointment
            );

        const currentDate =
            selectedRescheduleAppointment.AppointmentDate ||
            selectedRescheduleAppointment.appointmentDate;

        const currentTime =
            selectedRescheduleAppointment.AppointmentTime ||
            selectedRescheduleAppointment.appointmentTime;

        document.getElementById(
            "rescheduleCurrentDateTime"
        ).textContent =
            `${formatDate(currentDate)} - ${currentTime || "-"}`;

        const dateInput =
            document.getElementById(
                "newAppointmentDate"
            );

        if (dateInput) {

            dateInput.value = "";

            dateInput.min =
                getLocalDateString();
        }

        const timeSelect =
            document.getElementById(
                "newAppointmentTime"
            );

        if (timeSelect) {

            timeSelect.innerHTML =
                '<option value="">Select a date first</option>';

            timeSelect.disabled = true;
        }

        const reasonInput =
            document.getElementById(
                "rescheduleReason"
            );

        if (reasonInput) {
            reasonInput.value = "";
        }

        document
            .getElementById(
                "rescheduleModal"
            )
            ?.classList.add("show");
    }

    /* ===================================================
       CHECK DOCTOR WORKING DAY
    =================================================== */

    function isDoctorWorkingOnDate(
        doctor,
        dateString
    ) {

        if (!doctor || !dateString) {
            return true;
        }

        const workingDays =
            doctor.WorkingDays ||
            doctor.workingDays ||
            doctor.AvailableDays ||
            doctor.availableDays;

        if (
            !Array.isArray(workingDays) ||
            workingDays.length === 0
        ) {
            return true;
        }

        const date =
            new Date(
                `${dateString}T00:00:00`
            );

        const weekdayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];

        const selectedDay =
            weekdayNames[
                date.getDay()
            ];

        return workingDays.some(day => {

            const normalizedDay =
                String(day).toLowerCase();

            return (
                normalizedDay ===
                    selectedDay.toLowerCase() ||

                normalizedDay ===
                    selectedDay
                        .slice(0, 3)
                        .toLowerCase()
            );
        });
    }

    /* ===================================================
       CHECK DOCTOR LEAVE DATE
    =================================================== */

    function isDoctorOnLeave(
        doctorId,
        dateString
    ) {

        return leaveRecords.some(leave => {

            return (
                getDoctorIdFromRecord(leave) ===
                    getId(doctorId) &&

                getLeaveDateFromRecord(leave) ===
                    dateString
            );
        });
    }

   
    /* ===================================================
       LOAD AVAILABLE SLOTS
       FIX: SHOW ONLINE SLOTS FOR RESCHEDULING
    =================================================== */

    document
        .getElementById("newAppointmentDate")
        ?.addEventListener(
            "change",
            async function () {

                const selectedDate = this.value;

                const timeSelect =
                    document.getElementById(
                        "newAppointmentTime"
                    );

                if (!timeSelect) return;

                timeSelect.innerHTML =
                    '<option value="">Loading available online slots...</option>';

                timeSelect.disabled = true;

                if (
                    !selectedDate ||
                    !selectedRescheduleAppointment
                ) {

                    timeSelect.innerHTML =
                        '<option value="">Select a date first</option>';

                    return;
                }

                if (
                    selectedDate <
                    getLocalDateString()
                ) {

                    showToast(
                        "Please select today or a future date.",
                        "error"
                    );

                    this.value = "";

                    timeSelect.innerHTML =
                        '<option value="">Select a date first</option>';

                    return;
                }

                const doctorId =
                    getAppointmentDoctorId(
                        selectedRescheduleAppointment
                    );

                const doctor =
                    getDoctorById(doctorId);

                if (!doctorId) {

                    timeSelect.innerHTML =
                        '<option value="">Doctor not found</option>';

                    showToast(
                        "Unable to identify the appointment doctor.",
                        "error"
                    );

                    return;
                }

                if (
                    !isDoctorWorkingOnDate(
                        doctor,
                        selectedDate
                    )
                ) {

                    showToast(
                        "This doctor is not available on the selected weekday.",
                        "error"
                    );

                    this.value = "";

                    timeSelect.innerHTML =
                        '<option value="">Select an available date</option>';

                    return;
                }

                if (
                    isDoctorOnLeave(
                        doctorId,
                        selectedDate
                    )
                ) {

                    showToast(
                        "This doctor is on leave on the selected date.",
                        "error"
                    );

                    this.value = "";

                    timeSelect.innerHTML =
                        '<option value="">Select another date</option>';

                    return;
                }

                try {

                    // Always request ONLINE appointment slots
                    // for rescheduling from this page.

                    const url =
                        `${APPOINTMENT_API}/available-slots/` +
                        `${encodeURIComponent(doctorId)}/` +
                        `${encodeURIComponent(selectedDate)}` +
                        `?type=Online`;

                    const data =
                        await apiRequest(url);

                    const slots =
                        Array.isArray(data.availableSlots)
                            ? data.availableSlots
                            : [];

                    timeSelect.innerHTML =
                        '<option value="">Select Online Time Slot</option>';

                    slots.forEach(slot => {

                        const slotTime =
                            typeof slot === "string"
                                ? slot
                                : slot.time;

                        if (!slotTime) return;

                        const option =
                            document.createElement("option");

                        option.value = slotTime;
                        option.textContent = slotTime;

                        timeSelect.appendChild(option);
                    });

                    timeSelect.disabled =
                        slots.length === 0;

                    if (slots.length === 0) {

                        timeSelect.innerHTML =
                            '<option value="">No online slots available</option>';

                        showToast(
                            "No available online slots for this date. Please select another date.",
                            "error"
                        );
                    }

                } catch (error) {

                    console.error(
                        "Error loading available online slots:",
                        error
                    );

                    timeSelect.innerHTML =
                        '<option value="">Unable to load online slots</option>';

                    showToast(
                        error.message ||
                        "Unable to load available online slots.",
                        "error"
                    );
                }
            }
        );


    /* ===================================================
       RESCHEDULE FORM EVENT
    =================================================== */

    document
        .getElementById(
            "rescheduleForm"
        )
        ?.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                if (
                    !selectedRescheduleAppointment
                ) {
                    return;
                }

                const appointmentId =
                    document.getElementById(
                        "rescheduleAppointmentId"
                    ).value;

                const newDate =
                    document.getElementById(
                        "newAppointmentDate"
                    ).value;

                const newTime =
                    document.getElementById(
                        "newAppointmentTime"
                    ).value;

                const reasonInput =
                    document.getElementById(
                        "rescheduleReason"
                    );

                const reason =
                    reasonInput?.value.trim() || "";

                if (
                    !newDate ||
                    !newTime
                ) {

                    showToast(
                        "Please select a new date and time.",
                        "error"
                    );

                    return;
                }

                const doctorId =
                    getAppointmentDoctorId(
                        selectedRescheduleAppointment
                    );

                const doctor =
                    getDoctorById(
                        doctorId
                    );

                if (
                    !isDoctorWorkingOnDate(
                        doctor,
                        newDate
                    )
                ) {

                    showToast(
                        "The doctor is not available on the selected weekday.",
                        "error"
                    );

                    return;
                }

                if (
                    isDoctorOnLeave(
                        doctorId,
                        newDate
                    )
                ) {

                    showToast(
                        "The doctor is on leave on the selected date.",
                        "error"
                    );

                    return;
                }

                const button =
                    document.getElementById(
                        "confirmRescheduleBtn"
                    );

                try {

                    if (button) {

                        button.disabled = true;

                        button.textContent =
                            "Rescheduling...";
                    }

                    await apiRequest(
                        `${APPOINTMENT_API}/${appointmentId}/reschedule`,
                        {
                            method: "PATCH",

                            body: JSON.stringify({
                                AppointmentDate:
                                    newDate,

                                AppointmentTime:
                                    newTime,

                                Reason:
                                    reason,

                                RescheduledBy:
                                    "Receptionist"
                            })
                        }
                    );

                    closeModal(
                        "rescheduleModal"
                    );

                    showToast(
                        "Appointment rescheduled successfully!",
                        "success"
                    );

                    selectedRescheduleAppointment =
                        null;

                    await loadPageData();

                } catch (error) {

                    console.error(
                        "Error rescheduling appointment:",
                        error
                    );

                    showToast(
                        error.message ||
                        "Unable to reschedule appointment.",
                        "error"
                    );

                } finally {

                    if (button) {

                        button.disabled = false;

                        button.innerHTML = `
                            <i class="bi bi-calendar-check"></i>
                            Confirm Reschedule
                        `;
                    }
                }
            }
        );

    /* ===================================================
       OPEN CANCEL MODAL
    =================================================== */

    function openCancelModal(
        appointmentId
    ) {

        selectedCancelAppointment =
            affectedAppointments.find(
                appointment =>
                    getAppointmentId(
                        appointment
                    ) === appointmentId
            );

        if (!selectedCancelAppointment) {
            return;
        }

        document.getElementById(
            "cancelAppointmentId"
        ).value = appointmentId;

        document.getElementById(
            "cancelPatientName"
        ).textContent =
            getPatientName(
                selectedCancelAppointment
            );

        document.getElementById(
            "cancelDoctorName"
        ).textContent =
            getDoctorName(
                selectedCancelAppointment
            );

        const currentDate =
            selectedCancelAppointment.AppointmentDate ||
            selectedCancelAppointment.appointmentDate;

        const currentTime =
            selectedCancelAppointment.AppointmentTime ||
            selectedCancelAppointment.appointmentTime;

        document.getElementById(
            "cancelAppointmentDateTime"
        ).textContent =
            `${formatDate(currentDate)} - ${currentTime || "-"}`;

        document.getElementById(
            "cancellationReason"
        ).value = "";

        document
            .getElementById(
                "cancelAppointmentModal"
            )
            ?.classList.add("show");
    }

    /* ===================================================
       CANCEL APPOINTMENT FORM EVENT
    =================================================== */

    document
        .getElementById(
            "cancelAppointmentForm"
        )
        ?.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                if (
                    !selectedCancelAppointment
                ) {
                    return;
                }

                const appointmentId =
                    document.getElementById(
                        "cancelAppointmentId"
                    ).value;

                const reason =
                    document.getElementById(
                        "cancellationReason"
                    ).value.trim();

                const button =
                    document.getElementById(
                        "confirmCancelAppointmentBtn"
                    );

                const patientId =
                    getId(
                        selectedCancelAppointment.PatientID ||
                        selectedCancelAppointment.patientId
                    );

                try {

                    if (button) {

                        button.disabled = true;

                        button.textContent =
                            "Cancelling...";
                    }

                    await apiRequest(
                        `${APPOINTMENT_API}/${appointmentId}/cancel`,
                        {
                            method: "PATCH",

                            body: JSON.stringify({
                                PatientID:
                                    patientId ||
                                    undefined,

                                Reason:
                                    reason,

                                CancellationReason:
                                    reason,

                                CancelledBy:
                                    "Receptionist"
                            })
                        }
                    );

                    closeModal(
                        "cancelAppointmentModal"
                    );

                    showToast(
                        "Appointment cancelled successfully!",
                        "success"
                    );

                    selectedCancelAppointment =
                        null;

                    await loadPageData();

                } catch (error) {

                    console.error(
                        "Error cancelling appointment:",
                        error
                    );

                    showToast(
                        error.message ||
                        "Unable to cancel appointment.",
                        "error"
                    );

                } finally {

                    if (button) {

                        button.disabled = false;

                        button.innerHTML = `
                            <i class="bi bi-x-circle"></i>
                            Confirm Cancellation
                        `;
                    }
                }
            }
        );

    /* ===================================================
       MODAL EVENTS
    =================================================== */

    function setupModalEvents() {

        document
            .getElementById(
                "closeRescheduleModal"
            )
            ?.addEventListener(
                "click",
                () => {

                    closeModal(
                        "rescheduleModal"
                    );
                }
            );

        document
            .getElementById(
                "cancelRescheduleBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    closeModal(
                        "rescheduleModal"
                    );
                }
            );

        document
            .getElementById(
                "closeCancelModal"
            )
            ?.addEventListener(
                "click",
                () => {

                    closeModal(
                        "cancelAppointmentModal"
                    );
                }
            );

        document
            .getElementById(
                "cancelCancelModalBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    closeModal(
                        "cancelAppointmentModal"
                    );
                }
            );

        document
            .querySelectorAll(".modal")
            .forEach(modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target === modal
                        ) {

                            modal.classList.remove(
                                "show"
                            );
                        }
                    }
                );
            });

        document.addEventListener(
            "keydown",
            event => {

                if (event.key === "Escape") {

                    document
                        .querySelectorAll(
                            ".modal.show"
                        )
                        .forEach(modal => {

                            modal.classList.remove(
                                "show"
                            );
                        });
                }
            }
        );
    }

    /* ===================================================
       CLOSE MODAL
    =================================================== */

    function closeModal(modalId) {

        document
            .getElementById(modalId)
            ?.classList.remove("show");
    }

    /* ===================================================
       TOAST CONTAINER
    =================================================== */

    function setupToastContainer() {

        if (
            document.getElementById(
                "dermcareToastContainer"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "dermcareToastStyles";

        style.textContent = `
            #dermcareToastContainer {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: min(420px, calc(100vw - 32px));
            }

            .dermcare-toast {
                position: relative;
                overflow: hidden;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 44px 18px 18px;
                border-radius: 10px;
                background: #1769D5;
                color: #ffffff;
                box-shadow:
                    0 8px 24px
                    rgba(0, 0, 0, 0.20);
                font-size: 14px;
                font-weight: 600;
                line-height: 1.45;
                animation:
                    dermcareToastIn
                    0.3s ease forwards;
            }

            .dermcare-toast.error {
                background: #1769D5;
            }

            .dermcare-toast .toast-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .dermcare-toast .toast-message {
                flex: 1;
                overflow-wrap: anywhere;
            }

            .dermcare-toast .toast-close {
                position: absolute;
                top: 7px;
                right: 10px;
                border: 0;
                background: transparent;
                color: #ffffff;
                font-size: 23px;
                line-height: 1;
                cursor: pointer;
                padding: 2px 5px;
            }

            .dermcare-toast .toast-progress {
                position: absolute;
                left: 0;
                bottom: 0;
                height: 4px;
                width: 100%;
                background: #A3E635;
                transform-origin: left;
                animation:
                    dermcareToastProgress
                    4.5s linear forwards;
            }

            @keyframes dermcareToastIn {

                from {
                    opacity: 0;
                    transform:
                        translateX(25px);
                }

                to {
                    opacity: 1;
                    transform:
                        translateX(0);
                }
            }

            @keyframes dermcareToastOut {

                from {
                    opacity: 1;
                    transform:
                        translateX(0);
                }

                to {
                    opacity: 0;
                    transform:
                        translateX(25px);
                }
            }

            @keyframes dermcareToastProgress {

                from {
                    transform:
                        scaleX(1);
                }

                to {
                    transform:
                        scaleX(0);
                }
            }

            @media (max-width: 500px) {

                #dermcareToastContainer {
                    top: 12px;
                    right: 12px;
                    width:
                        calc(100vw - 24px);
                }
            }
        `;

        document.head.appendChild(style);

        const container =
            document.createElement("div");

        container.id =
            "dermcareToastContainer";

        document.body.appendChild(
            container
        );
    }

    /* ===================================================
       SHOW TOAST MESSAGE
    =================================================== */

    function showToast(
        message,
        type = "success"
    ) {

        setupToastContainer();

        const container =
            document.getElementById(
                "dermcareToastContainer"
            );

        if (!container) return;

        const toast =
            document.createElement("div");

        toast.className =
            `dermcare-toast ${type}`;

        const iconClass =
            type === "error"
                ? "bi-exclamation-circle-fill"
                : "bi-check-circle-fill";

        toast.innerHTML = `
            <i
                class="bi ${iconClass} toast-icon">
            </i>

            <span class="toast-message"></span>

            <button
                type="button"
                class="toast-close"
                aria-label="Close notification">

                &times;

            </button>

            <div class="toast-progress"></div>
        `;

        toast
            .querySelector(
                ".toast-message"
            )
            .textContent = message;

        container.appendChild(toast);

        let toastTimer;

        function removeToast() {

            if (!toast.isConnected) {
                return;
            }

            clearTimeout(toastTimer);

            toast.style.animation =
                "dermcareToastOut 0.3s ease forwards";

            setTimeout(() => {
                toast.remove();
            }, 300);
        }

        toast
            .querySelector(".toast-close")
            .addEventListener(
                "click",
                removeToast
            );

        toastTimer =
            setTimeout(
                removeToast,
                4500
            );
    }

    /* ===================================================
       SIDEBAR MOBILE TOGGLE
    =================================================== */

    function setupSidebar() {

        const menuToggle =
            document.getElementById(
                "menuToggle"
            );

        const sidebar =
            document.getElementById(
                "sidebar"
            );

        const overlay =
            document.getElementById(
                "overlay"
            );

        const closeSidebarBtn =
            document.getElementById(
                "closeSidebarBtn"
            );

        if (!sidebar) return;

        function updateMenuIcon() {

            if (!menuToggle) return;

            const icon =
                menuToggle.querySelector("i");

            if (!icon) return;

            if (
                sidebar.classList.contains(
                    "mobile-open"
                )
            ) {

                icon.classList.remove(
                    "bi-list"
                );

                icon.classList.add(
                    "bi-x-lg"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Close menu"
                );

                menuToggle.setAttribute(
                    "aria-expanded",
                    "true"
                );

            } else {

                icon.classList.remove(
                    "bi-x-lg"
                );

                icon.classList.add(
                    "bi-list"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Open menu"
                );

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }

        function closeMobileMenu() {

            sidebar.classList.remove(
                "mobile-open"
            );

            if (overlay) {

                overlay.classList.remove(
                    "show"
                );
            }

            updateMenuIcon();
        }

        if (menuToggle) {

            menuToggle.addEventListener(
                "click",
                function () {

                    sidebar.classList.toggle(
                        "mobile-open"
                    );

                    if (overlay) {

                        overlay.classList.toggle(
                            "show"
                        );
                    }

                    updateMenuIcon();
                }
            );
        }

        if (closeSidebarBtn) {

            closeSidebarBtn.addEventListener(
                "click",
                closeMobileMenu
            );
        }

        if (overlay) {

            overlay.addEventListener(
                "click",
                closeMobileMenu
            );
        }

        sidebar
            .querySelectorAll(
                ".sidebar-menu a"
            )
            .forEach(link => {

                link.addEventListener(
                    "click",
                    closeMobileMenu
                );
            });

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    closeMobileMenu();
                }
            }
        );

        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth > 650
                ) {

                    closeMobileMenu();
                }
            }
        );

        updateMenuIcon();
    }

    /* ===================================================
       LOGOUT
    =================================================== */

    function setupLogout() {

        const logoutLink =
            document.getElementById(
                "logoutLink"
            );

        if (!logoutLink) return;

        logoutLink.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "receptionist"
                );

                localStorage.removeItem(
                    "receptionistData"
                );

                localStorage.removeItem(
                    "receptionistId"
                );
            }
        );
    }
}