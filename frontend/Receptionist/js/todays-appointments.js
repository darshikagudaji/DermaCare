
 // =======================================================
// DERMCARE - TODAY'S APPOINTMENTS JAVASCRIPT
// FILE: receptionist/js/todays-appointments.js
// =======================================================


// =======================================================
// API BASE URL
// =======================================================

const API_BASE_URL = "http://localhost:5000/api";


// =======================================================
// PAGE ELEMENTS
// =======================================================

const todaysAppointmentsBody =
    document.getElementById("todaysAppointmentsBody");

const currentDate =
    document.getElementById("currentDate");

const totalAppointments =
    document.getElementById("totalAppointments");

const bookedAppointments =
    document.getElementById("bookedAppointments");

const arrivedAppointments =
    document.getElementById("arrivedAppointments");

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
// Returns YYYY-MM-DD
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
// Only Booked and Arrived appointments are displayed
// =======================================================

function isActiveAppointment(appointment) {

    const status = getAppointmentStatus(appointment);

    return (
        status === "booked" ||
        status === "arrived"
    );

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

function getDoctorName(appointment) {

    if (
        appointment.DoctorID &&
        typeof appointment.DoctorID === "object"
    ) {
        return appointment.DoctorID.FullName ||
            appointment.DoctorName ||
            "Unknown Doctor";
    }

    return (
        appointment.DoctorName ||
        "Unknown Doctor"
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
// ESCAPE HTML FOR UNKNOWN APPOINTMENT TYPES
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

    const safeStatus = status || "Booked";

    const statusClass = safeStatus
        .toLowerCase()
        .replace(" ", "-");

    return `
        <span class="status-badge ${statusClass}">
            ${safeStatus}
        </span>
    `;

}


// =======================================================
// UPDATE SUMMARY COUNTS
// Cancelled appointments are counted but not displayed
// in the appointments table.
// =======================================================

function updateSummaryCounts(appointments) {

    const bookedCount = appointments.filter(
        appointment =>
            getAppointmentStatus(appointment) === "booked"
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

    const activeCount =
        bookedCount + arrivedCount;

    if (totalAppointments) {
        totalAppointments.textContent = activeCount;
    }

    if (bookedAppointments) {
        bookedAppointments.textContent = bookedCount;
    }

    if (arrivedAppointments) {
        arrivedAppointments.textContent = arrivedCount;
    }

    if (cancelledAppointments) {
        cancelledAppointments.textContent = cancelledCount;
    }

}


// =======================================================
// DISPLAY TODAY'S APPOINTMENTS
// Only Booked and Arrived appointments are displayed
// =======================================================

function displayTodaysAppointments(appointments) {

    if (!todaysAppointmentsBody) return;

    // Filter out cancelled, completed and other statuses

    const activeAppointments =
        (appointments || [])
            .filter(appointment =>
                isActiveAppointment(appointment)
            );


    // ===================================================
    // NO ACTIVE APPOINTMENTS
    // ===================================================

    if (activeAppointments.length === 0) {

        todaysAppointmentsBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    No active appointments scheduled for today.
                </td>
            </tr>
        `;

        return;

    }


    // ===================================================
    // SORT APPOINTMENTS BY TIME
    // ===================================================

    activeAppointments.sort(
        (appointmentA, appointmentB) =>
            (
                appointmentA.AppointmentTime ||
                appointmentA.appointmentTime ||
                ""
            ).localeCompare(
                appointmentB.AppointmentTime ||
                appointmentB.appointmentTime ||
                ""
            )
    );


    // ===================================================
    // CLEAR TABLE
    // ===================================================

    todaysAppointmentsBody.innerHTML = "";


    // ===================================================
    // CREATE APPOINTMENT ROWS
    // ===================================================

    activeAppointments.forEach(appointment => {

        const row = document.createElement("tr");

        let actionContent = "-";

        const status =
            getAppointmentStatus(appointment);


        // =================================================
        // BOOKED
        // =================================================

        if (status === "booked") {

            actionContent = `
                <button
                    type="button"
                    class="arrived-btn"
                    data-appointment-id="${appointment._id}"
                >
                    <i class="bi bi-person-check-fill"></i>
                    Arrived
                </button>
            `;

        }


        // =================================================
        // ARRIVED
        // =================================================

        else if (status === "arrived") {

            actionContent = `
                <span class="action-arrived">
                    <i class="bi bi-check-circle-fill"></i>
                    Arrived
                </span>
            `;

        }


        // =================================================
        // APPOINTMENT INFORMATION
        // =================================================

        const appointmentTime =
            appointment.AppointmentTime ||
            appointment.appointmentTime ||
            "-";

        const appointmentType =
            appointment.AppointmentType ||
            appointment.appointmentType ||
            "-";

        const appointmentStatus =
            appointment.Status ||
            appointment.status ||
            "Booked";


        // =================================================
        // ADD DATA TO ROW
        // =================================================

        row.innerHTML = `
            <td>${getPatientName(appointment)}</td>

            <td>${getDoctorName(appointment)}</td>

            <td>${appointmentTime}</td>

            <td>
                ${getAppointmentTypeBadge(
                    appointmentType
                )}
            </td>

            <td>
                ${getStatusBadge(
                    appointmentStatus
                )}
            </td>

            <td>${actionContent}</td>
        `;


        // =================================================
        // ADD ROW TO TABLE
        // =================================================

        todaysAppointmentsBody.appendChild(row);

    });


    // ===================================================
    // ARRIVED BUTTON EVENT LISTENERS
    // ===================================================

    const arrivedButtons =
        document.querySelectorAll(".arrived-btn");

    arrivedButtons.forEach(button => {

        button.addEventListener("click", function () {

            const appointmentId =
                this.dataset.appointmentId;

            markAppointmentAsArrived(
                appointmentId,
                this
            );

        });

    });

}


// =======================================================
// LOAD TODAY'S APPOINTMENTS
// =======================================================

async function loadTodaysAppointments() {

    try {

        // =================================================
        // SHOW LOADING MESSAGE
        // =================================================

        if (todaysAppointmentsBody) {

            todaysAppointmentsBody.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-row">
                        Loading today's appointments...
                    </td>
                </tr>
            `;

        }


        // =================================================
        // GET ALL APPOINTMENTS
        // =================================================

        const response = await fetch(
            `${API_BASE_URL}/appointments`
        );

        const data = await response.json();


        // =================================================
        // HANDLE ERROR
        // =================================================

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load appointments."
            );

        }


        // =================================================
        // GET TODAY'S DATE
        // =================================================

        const today =
            formatDateForComparison(new Date());


        // =================================================
        // FILTER TODAY'S APPOINTMENTS
        // Keep all statuses for the summary counts.
        // The display function filters active appointments.
        // =================================================

        const todaysAppointments =
            data.appointments.filter(appointment =>
                getAppointmentDateString(
                    appointment.AppointmentDate
                ) === today
            );


        // =================================================
        // UPDATE SUMMARY
        // =================================================

        updateSummaryCounts(todaysAppointments);


        // =================================================
        // DISPLAY APPOINTMENTS
        // =================================================

        displayTodaysAppointments(todaysAppointments);

    }

    catch (error) {

        console.error(
            "Error loading today's appointments:",
            error
        );


        // =================================================
        // RESET SUMMARY COUNTS
        // =================================================

        updateSummaryCounts([]);


        // =================================================
        // DISPLAY ERROR
        // =================================================

        if (todaysAppointmentsBody) {

            todaysAppointmentsBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-row">
                        Unable to load today's appointments.
                    </td>
                </tr>
            `;

        }

        alert(
            error.message ||
            "Unable to load today's appointments."
        );

    }

}


// =======================================================
// MARK APPOINTMENT AS ARRIVED
// PATCH: /api/appointments/:appointmentId/arrived
// =======================================================

async function markAppointmentAsArrived(
    appointmentId,
    button
) {

    try {

        // =================================================
        // VALIDATE ID
        // =================================================

        if (!appointmentId) {

            alert("Appointment ID is missing.");

            return;
        }


        // =================================================
        // DISABLE BUTTON
        // =================================================

        if (button) {

            button.disabled = true;

            button.innerHTML = `
                <i class="bi bi-hourglass-split"></i>
                Updating...
            `;

        }


        // =================================================
        // SEND PATCH REQUEST
        // =================================================

        const response = await fetch(
            `${API_BASE_URL}/appointments/${appointmentId}/arrived`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();


        // =================================================
        // HANDLE ERROR
        // =================================================

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to mark patient as arrived."
            );

        }


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            data.message ||
            "Patient marked as arrived successfully."
        );


        // =================================================
        // RELOAD APPOINTMENTS
        // =================================================

        await loadTodaysAppointments();

    }

    catch (error) {

        console.error(
            "Error marking appointment as arrived:",
            error
        );

        alert(
            error.message ||
            "Unable to mark patient as arrived."
        );


        // =================================================
        // RESTORE BUTTON
        // =================================================

        if (button) {

            button.disabled = false;

            button.innerHTML = `
                <i class="bi bi-person-check-fill"></i>
                Arrived
            `;

        }

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

    if (menuToggle) {

        menuToggle.classList.add("menu-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

    }

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

    closeSidebarBtn.addEventListener(
        "click",
        function () {

            closeSidebar();

        }
    );

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
// RESET SIDEBAR WHEN SCREEN RETURNS TO DESKTOP
// Matches CSS breakpoint: 650px
// =======================================================

window.addEventListener("resize", function () {

    if (window.innerWidth > 650) {

        closeSidebar();

    }

});


// =======================================================
// CLOSE SIDEBAR AFTER CLICKING A MENU LINK ON MOBILE
// =======================================================

const sidebarLinks =
    document.querySelectorAll(".sidebar-menu a");

sidebarLinks.forEach(link => {

    link.addEventListener("click", function () {

        if (window.innerWidth <= 650) {

            closeSidebar();

        }

    });

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

    displayCurrentDate();

    loadTodaysAppointments();

});
