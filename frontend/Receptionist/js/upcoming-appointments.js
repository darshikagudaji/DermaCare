
 // =======================================================
// DERMCARE - UPCOMING APPOINTMENTS JAVASCRIPT
// FILE: receptionist/js/upcoming-appointments.js
// =======================================================


// =======================================================
// API BASE URL
// =======================================================

const API_BASE_URL = "https://dermacare-eeca.onrender.com/api";


// =======================================================
// PAGE ELEMENTS
// =======================================================

const upcomingAppointmentsBody =
    document.getElementById("upcomingAppointmentsBody");

const currentDate =
    document.getElementById("currentDate");

const totalAppointments =
    document.getElementById("totalAppointments");

const bookedAppointments =
    document.getElementById("bookedAppointments");

const confirmedAppointments =
    document.getElementById("confirmedAppointments");

const cancelledAppointments =
    document.getElementById("cancelledAppointments");


// =======================================================
// MOBILE MENU ELEMENTS
// =======================================================

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");

// X close button inside sidebar
const closeSidebarBtn =
    document.getElementById("closeSidebarBtn");


// =======================================================
// LOGOUT ELEMENT
// =======================================================

const logoutLink =
    document.getElementById("logoutLink");


// =======================================================
// DISPLAY CURRENT DATE
// =======================================================

function displayCurrentDate() {

    if (!currentDate) return;

    const today = new Date();

    currentDate.textContent =
        today.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
}


// =======================================================
// FORMAT DATE FOR COMPARISON
// YYYY-MM-DD
// =======================================================

function formatDateForComparison(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// =======================================================
// GET APPOINTMENT DATE STRING
// =======================================================

function getAppointmentDateString(appointmentDate) {

    if (!appointmentDate) return "";

    return String(appointmentDate).split("T")[0];
}


// =======================================================
// FORMAT APPOINTMENT DATE FOR DISPLAY
// =======================================================

function formatAppointmentDate(appointmentDate) {

    const dateString =
        getAppointmentDateString(appointmentDate);

    if (!dateString) return "-";

    const dateParts = dateString.split("-");

    if (dateParts.length !== 3) {
        return dateString;
    }

    const date = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
    );

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
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
        return appointment.PatientID.FullName ||
            "Unknown Patient";
    }

    return "Unknown Patient";
}


// =======================================================
// GET DOCTOR NAME
// =======================================================
//
// IMPORTANT:
// DoctorName is permanently stored inside the appointment.
//
// If the doctor still exists:
//     DoctorID.FullName is used.
//
// If the doctor has been deleted:
//     DoctorID may be null/unpopulated,
//     so the stored DoctorName is used.
//
// This keeps the doctor's name visible in historical,
// upcoming, today's and other appointment records even
// after the doctor is deleted.
//
// =======================================================

function getDoctorName(appointment) {

    // ---------------------------------------------------
    // FIRST: USE POPULATED DOCTOR DOCUMENT
    // ---------------------------------------------------

    if (
        appointment.DoctorID &&
        typeof appointment.DoctorID === "object"
    ) {

        const doctorName =
            appointment.DoctorID.FullName;

        if (
            typeof doctorName === "string" &&
            doctorName.trim() !== ""
        ) {
            return doctorName.trim();
        }
    }


    // ---------------------------------------------------
    // SECOND: USE STORED DOCTOR NAME
    // ---------------------------------------------------

    if (
        typeof appointment.DoctorName === "string" &&
        appointment.DoctorName.trim() !== ""
    ) {

        return appointment.DoctorName.trim();
    }


    // ---------------------------------------------------
    // LAST FALLBACK
    // ---------------------------------------------------

    return "Unknown Doctor";
}


// =======================================================
// GET ID FROM DIFFERENT OBJECT FORMATS
// =======================================================
//
// Used for matching DoctorID values from appointments
// and leave records.
//
// =======================================================

function getId(value) {

    if (!value) return "";

    // ObjectId / populated object / Mongo-style object
    if (typeof value === "object") {

        // MongoDB extended JSON
        if (value.$oid) {
            return String(value.$oid).trim();
        }

        // Populated document
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

        // Normal id field
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

        // Last safe fallback
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


// =======================================================
// GET DOCTOR ID FROM APPOINTMENT
// =======================================================

function getAppointmentDoctorId(appointment) {

    if (!appointment) return "";

    const possibleValues = [

        appointment.DoctorID,
        appointment.doctorId,

        appointment.DoctorId,
        appointment.doctorID,

        appointment.Doctor,
        appointment.doctor,

        appointment.doctor_id,
        appointment.Doctor_Id,

        appointment.Doctor_ID,
        appointment.doctor_ID,

        appointment.DoctorRef,
        appointment.doctorRef
    ];

    for (const value of possibleValues) {

        const id = getId(value);

        if (id) {
            return id;
        }
    }

    return "";
}


// =======================================================
// GET DOCTOR ID FROM LEAVE RECORD
// =======================================================

function getLeaveDoctorId(leave) {

    if (!leave) return "";

    const possibleValues = [

        leave.DoctorID,
        leave.doctorId,

        leave.DoctorId,
        leave.doctorID,

        leave.Doctor,
        leave.doctor,

        leave.doctor_id,
        leave.Doctor_Id,

        leave.Doctor_ID,
        leave.doctor_ID,

        leave.DoctorRef,
        leave.doctorRef
    ];

    for (const value of possibleValues) {

        const id = getId(value);

        if (id) {
            return id;
        }
    }

    return "";
}


// =======================================================
// GET LEAVE DATE
// =======================================================

function getLeaveDate(leave) {

    if (!leave) return "";

    const value =
        leave.leaveDate ||
        leave.LeaveDate ||
        leave.leave_date ||
        leave.date ||
        leave.Date;

    if (!value) return "";

    return String(value).split("T")[0];
}


// =======================================================
// GET LEAVE DOCTOR NAME
// =======================================================
//
// This is used as a fallback when the DoctorID cannot
// be matched, for example if the doctor has already been
// deleted but the Leave record still contains DoctorName.
//
// =======================================================

function getLeaveDoctorName(leave) {

    if (!leave) return "";

    const possibleNames = [

        leave.doctorName,
        leave.DoctorName,

        leave.DoctorFullName,
        leave.doctorFullName,

        leave.fullName,
        leave.FullName
    ];

    for (const value of possibleNames) {

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return String(value).trim();
        }
    }

    // If DoctorID is populated
    const populatedDoctor =
        leave.DoctorID ||
        leave.doctorId ||
        leave.Doctor ||
        leave.doctor;

    if (
        populatedDoctor &&
        typeof populatedDoctor === "object"
    ) {

        const populatedName =
            populatedDoctor.FullName ||
            populatedDoctor.fullName ||
            populatedDoctor.DoctorName ||
            populatedDoctor.doctorName ||
            populatedDoctor.Name ||
            populatedDoctor.name;

        if (
            populatedName &&
            String(populatedName).trim() !== ""
        ) {

            return String(
                populatedName
            ).trim();
        }
    }

    return "";
}


// =======================================================
// CHECK WHETHER APPOINTMENT IS ON DOCTOR LEAVE
// =======================================================

function isAppointmentOnLeave(
    appointment,
    leaveRecords
) {

    if (
        !appointment ||
        !Array.isArray(leaveRecords) ||
        leaveRecords.length === 0
    ) {
        return false;
    }

    const appointmentDate =
        getAppointmentDateString(
            appointment.AppointmentDate
        );

    if (!appointmentDate) {
        return false;
    }

    const appointmentDoctorId =
        getAppointmentDoctorId(
            appointment
        );

    const appointmentDoctorName =
        getDoctorName(
            appointment
        )
        .trim()
        .toLowerCase();

    return leaveRecords.some(leave => {

        const leaveDate =
            getLeaveDate(
                leave
            );

        if (
            !leaveDate ||
            leaveDate !== appointmentDate
        ) {
            return false;
        }

        // ------------------------------------------------
        // FIRST MATCH BY DOCTOR ID
        // ------------------------------------------------

        const leaveDoctorId =
            getLeaveDoctorId(
                leave
            );

        if (
            appointmentDoctorId &&
            leaveDoctorId
        ) {

            if (
                String(
                    appointmentDoctorId
                ).trim() ===
                String(
                    leaveDoctorId
                ).trim()
            ) {

                return true;
            }
        }

        // ------------------------------------------------
        // SECOND MATCH BY DOCTOR NAME
        // ------------------------------------------------

        const leaveDoctorName =
            getLeaveDoctorName(
                leave
            )
            .trim()
            .toLowerCase();

        if (
            appointmentDoctorName &&
            leaveDoctorName &&
            appointmentDoctorName !== "unknown doctor" &&
            appointmentDoctorName === leaveDoctorName
        ) {

            return true;
        }

        return false;
    });
}


// =======================================================
// GET NORMALIZED APPOINTMENT STATUS
// =======================================================

function getAppointmentStatus(appointment) {

    return (
        appointment.Status ||
        appointment.status ||
        ""
    ).toString().trim().toLowerCase();
}


// =======================================================
// CHECK WHETHER APPOINTMENT IS ACTIVE
// =======================================================

function isActiveAppointment(appointment) {

    const status =
        getAppointmentStatus(appointment);

    return (
        status === "booked" ||
        status === "arrived"
    );
}


// =======================================================
// GET APPOINTMENT TYPE BADGE
// UPDATED: Separate Online and Walk-in badge classes
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
            ${escapeHTML(appointmentType || "-")}
        </span>
    `;
}


// =======================================================
// ESCAPE HTML
// =======================================================

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


// =======================================================
// GET STATUS BADGE
// =======================================================

function getStatusBadge(status) {

    const safeStatus =
        status || "Booked";

    const statusClass = safeStatus
        .toLowerCase()
        .replace(/\s+/g, "-");

    return `
        <span class="status-badge ${statusClass}">
            ${safeStatus}
        </span>
    `;
}


// =======================================================
// UPDATE SUMMARY COUNTS
// =======================================================

function updateSummaryCounts(appointments) {

    const bookedCount = appointments.filter(
        appointment =>
            getAppointmentStatus(appointment) === "booked"
    ).length;

    const confirmedCount = appointments.filter(
        appointment =>
            getAppointmentStatus(appointment) === "confirmed"
    ).length;

    const arrivedCount = appointments.filter(
        appointment =>
            getAppointmentStatus(appointment) === "arrived"
    ).length;

    const cancelledCount = appointments.filter(
        appointment => {

            const status =
                getAppointmentStatus(appointment);

            return (
                status === "cancelled" ||
                status === "canceled"
            );
        }
    ).length;

    // Total includes active appointments only.
    // Cancelled and completed appointments are excluded.
    if (totalAppointments) {
        totalAppointments.textContent =
            bookedCount + arrivedCount;
    }

    if (bookedAppointments) {
        bookedAppointments.textContent =
            bookedCount;
    }

    if (confirmedAppointments) {
        confirmedAppointments.textContent =
            confirmedCount;
    }

    if (cancelledAppointments) {
        cancelledAppointments.textContent =
            cancelledCount;
    }
}


// =======================================================
// DISPLAY UPCOMING APPOINTMENTS
// =======================================================

function displayUpcomingAppointments(appointments) {

    if (!upcomingAppointmentsBody) return;

    // Display only active appointments
    const activeAppointments =
        (appointments || []).filter(
            appointment =>
                isActiveAppointment(appointment)
        );

    // No upcoming appointments
    if (activeAppointments.length === 0) {

        upcomingAppointmentsBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">
                    No upcoming appointments scheduled.
                </td>
            </tr>
        `;

        return;
    }

    // Sort by appointment date and time
    activeAppointments.sort((appointmentA, appointmentB) => {

        const dateA = getAppointmentDateString(
            appointmentA.AppointmentDate
        );

        const dateB = getAppointmentDateString(
            appointmentB.AppointmentDate
        );

        const dateComparison = dateA.localeCompare(dateB);

        if (dateComparison !== 0) {
            return dateComparison;
        }

        return (
            appointmentA.AppointmentTime || ""
        ).localeCompare(
            appointmentB.AppointmentTime || ""
        );
    });

    // Clear table
    upcomingAppointmentsBody.innerHTML = "";

    // Create appointment rows
    activeAppointments.forEach(appointment => {

        const row = document.createElement("tr");

        // Upcoming appointments are view-only
        const actionContent = `
            <span class="upcoming-action">
                <i class="bi bi-calendar-check"></i>
                Upcoming
            </span>
        `;

        row.innerHTML = `
            <td>
                ${getPatientName(appointment)}
            </td>

            <td>
                ${getDoctorName(appointment)}
            </td>

            <td>
                ${formatAppointmentDate(
                    appointment.AppointmentDate
                )}
            </td>

            <td>
                ${appointment.AppointmentTime || "-"}
            </td>

            <td>
                ${getAppointmentTypeBadge(
                    appointment.AppointmentType ||
                    appointment.appointmentType
                )}
            </td>

            <td>
                ${getStatusBadge(
                    appointment.Status || appointment.status
                )}
            </td>

            <td>
                ${actionContent}
            </td>
        `;

        upcomingAppointmentsBody.appendChild(row);
    });
}


// =======================================================
// LOAD UPCOMING APPOINTMENTS
// =======================================================

async function loadUpcomingAppointments() {

    try {

        // Show loading message
        if (upcomingAppointmentsBody) {

            upcomingAppointmentsBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-row">
                        Loading upcoming appointments...
                    </td>
                </tr>
            `;
        }


        // ===================================================
        // LOAD APPOINTMENTS AND LEAVE RECORDS
        // ===================================================

        const [
            appointmentsResponse,
            leavesResponse
        ] = await Promise.all([

            fetch(
                `${API_BASE_URL}/appointments`
            ),

            fetch(
                `${API_BASE_URL}/leaves`
            )

        ]);


        // ===================================================
        // READ API RESPONSES
        // ===================================================

        const data =
            await appointmentsResponse.json();

        const leaveData =
            await leavesResponse.json();


        // ===================================================
        // HANDLE APPOINTMENT API ERROR
        // ===================================================

        if (
            !appointmentsResponse.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load upcoming appointments."
            );
        }


        // ===================================================
        // HANDLE LEAVE API ERROR
        // ===================================================

        if (
            !leavesResponse.ok ||
            !leaveData.success
        ) {

            throw new Error(
                leaveData.message ||
                "Unable to load doctor leave records."
            );
        }


        // ===================================================
        // GET LEAVE RECORDS
        // ===================================================

        const leaveRecords =
            Array.isArray(
                leaveData.leaves
            )
                ? leaveData.leaves
                : [];


        console.log(
            "DermCare Leave Records for Upcoming Page:",
            leaveRecords
        );


        // ===================================================
        // GET TODAY'S DATE
        // ===================================================

        const today =
            formatDateForComparison(
                new Date()
            );


        // ===================================================
        // FILTER UPCOMING APPOINTMENTS
        // ===================================================

        const allUpcomingAppointments =
            data.appointments.filter(
                appointment => {

                    const appointmentDate =
                        getAppointmentDateString(
                            appointment.AppointmentDate
                        );


                    // Ignore invalid dates
                    if (!appointmentDate) {
                        return false;
                    }


                    // Only future appointments
                    if (
                        appointmentDate <= today
                    ) {
                        return false;
                    }


                    // Exclude cancelled and completed appointments
                    if (
                        !isActiveAppointment(appointment)
                    ) {
                        return false;
                    }


                    // Hide appointment if doctor is on leave
                    if (
                        isAppointmentOnLeave(
                            appointment,
                            leaveRecords
                        )
                    ) {

                        console.log(
                            "Hiding upcoming appointment because doctor is on leave:",
                            appointment
                        );

                        return false;
                    }


                    return true;
                }
            );


        // Get all future appointments for summary counts,
        // including cancelled appointments, but excluding
        // appointments on a doctor's leave date.
        const upcomingAppointmentsForCounts =
            data.appointments.filter(
                appointment => {

                    const appointmentDate =
                        getAppointmentDateString(
                            appointment.AppointmentDate
                        );

                    if (
                        !appointmentDate ||
                        appointmentDate <= today
                    ) {
                        return false;
                    }

                    return !isAppointmentOnLeave(
                        appointment,
                        leaveRecords
                    );
                }
            );


        console.log(
            "DermCare Final Upcoming Appointments:",
            allUpcomingAppointments
        );


        // ===================================================
        // UPDATE SUMMARY COUNTS
        // ===================================================

        updateSummaryCounts(
            upcomingAppointmentsForCounts
        );


        // ===================================================
        // DISPLAY UPCOMING APPOINTMENTS
        // ===================================================

        displayUpcomingAppointments(
            allUpcomingAppointments
        );

    } catch (error) {

        console.error(
            "Error loading upcoming appointments:",
            error
        );


        // Reset summary counts
        updateSummaryCounts([]);


        // Display error message
        if (upcomingAppointmentsBody) {

            upcomingAppointmentsBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-row">
                        Unable to load upcoming appointments.
                    </td>
                </tr>
            `;
        }


        alert(
            error.message ||
            "Unable to load upcoming appointments."
        );
    }
}


// =======================================================
// OPEN MOBILE SIDEBAR
// =======================================================

function openSidebar() {

    if (sidebar) {
        sidebar.classList.add("mobile-open");
    }

    if (overlay) {
        overlay.classList.add("show");
    }

    // Hide hamburger while sidebar is open
    if (menuToggle) {

        menuToggle.classList.add("menu-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    // Show X button through CSS when sidebar is open
}


// =======================================================
// CLOSE MOBILE SIDEBAR
// =======================================================

function closeSidebar() {

    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

    if (overlay) {
        overlay.classList.remove("show");
    }

    // Restore hamburger after sidebar closes
    if (menuToggle) {

        menuToggle.classList.remove("menu-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}


// =======================================================
// MOBILE HAMBURGER BUTTON
// =======================================================

if (menuToggle) {

    menuToggle.addEventListener("click", function () {

        if (
            sidebar &&
            sidebar.classList.contains("mobile-open")
        ) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}


// =======================================================
// CLOSE SIDEBAR USING X BUTTON
// =======================================================

if (closeSidebarBtn) {

    closeSidebarBtn.addEventListener("click", function () {

        closeSidebar();
    });
}


// =======================================================
// CLOSE SIDEBAR WHEN OVERLAY IS CLICKED
// =======================================================

if (overlay) {

    overlay.addEventListener(
        "click",
        closeSidebar
    );
}


// =======================================================
// CLOSE SIDEBAR AFTER CLICKING A MENU LINK
// =======================================================

const sidebarLinks = document.querySelectorAll(
    ".sidebar-menu a"
);

sidebarLinks.forEach(link => {

    link.addEventListener("click", function () {

        // Match the CSS mobile breakpoint
        if (window.innerWidth <= 650) {
            closeSidebar();
        }
    });
});


// =======================================================
// RESET SIDEBAR WHEN SCREEN RETURNS TO DESKTOP
// =======================================================

window.addEventListener("resize", function () {

    // Match the CSS mobile breakpoint
    if (window.innerWidth > 650) {
        closeSidebar();
    }
});


// =======================================================
// RECEPTIONIST LOGOUT
// =======================================================

if (logoutLink) {

    logoutLink.addEventListener("click", function (event) {

        event.preventDefault();

        localStorage.removeItem("receptionist");
        localStorage.removeItem("receptionistData");
        localStorage.removeItem("receptionistId");

        window.location.href = "receptionist-login.html";
    });
}


// =======================================================
// PAGE LOAD
// =======================================================

document.addEventListener("DOMContentLoaded", function () {

    // Display current date
    displayCurrentDate();

    // Load upcoming appointments
    loadUpcomingAppointments();
});
