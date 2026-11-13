
// =======================================================
// DERMCARE - DOCTOR DASHBOARD JAVASCRIPT
// File: doctor/js/doctor.js
// PURPOSE:
// 1. Check doctor login
// 2. Display doctor name
// 3. Handle mobile sidebar
// 4. Handle logout
// 5. Load doctor appointments
// 6. Display appointment counts
// 7. Display total patients for logged-in doctor
// =======================================================


// =======================================================
// API URL
// =======================================================

const APPOINTMENT_API_URL =
    "https://dermacare-eeca.onrender.com/api/appointments";


// =======================================================
// GET HTML ELEMENTS
// =======================================================

// Doctor name displayed in the welcome message

const doctorNameElement =
    document.getElementById("doctorName");


// Mobile menu button

const menuToggle =
    document.getElementById("menuToggle");


// Sidebar

const sidebar =
    document.getElementById("sidebar");


// Dark overlay shown behind mobile sidebar

const overlay =
    document.getElementById("overlay");


// Logout link

const logoutLink =
    document.getElementById("logoutLink");


// Today's appointment count

const todayCountElement =
    document.getElementById("todayCount");


// Upcoming appointment count

const upcomingCountElement =
    document.getElementById("upcomingCount");


// Total patients count

const totalPatientsCountElement =
    document.getElementById("totalPatientsCount");


// Appointment table body

const appointmentsTableBody =
    document.getElementById("todayAppointments");


// No appointments row

const noAppointmentsRow =
    document.getElementById("noAppointments");


// =======================================================
// GET LOGGED-IN DOCTOR
// =======================================================
//
// Doctor login saves the doctor information in:
//
// localStorage → "doctor"
//
// Example:
//
// localStorage.setItem(
//     "doctor",
//     JSON.stringify(data.doctor)
// );
//
// We retrieve the saved doctor information here.
// =======================================================

let loggedInDoctor = null;


try {

    const savedDoctor =
        localStorage.getItem("doctor");


    if (savedDoctor) {

        loggedInDoctor =
            JSON.parse(savedDoctor);

    }

}


catch (error) {

    console.error(
        "Unable to read doctor information:",
        error
    );

    // Remove corrupted doctor data

    localStorage.removeItem("doctor");

}


// =======================================================
// CHECK DOCTOR LOGIN
// =======================================================
//
// If there is no doctor information in localStorage,
// the doctor is considered logged out.
//
// In that case, redirect to doctor login page.
// =======================================================

if (!loggedInDoctor) {

    window.location.href =
        "doctor-login.html";

}


// =======================================================
// DISPLAY DOCTOR NAME
// =======================================================
//
// Doctor dashboard HTML contains:
//
// <span id="doctorName">
//     Doctor
// </span>
//
// The doctor's name comes from:
//
// loggedInDoctor.fullName
//
// Example:
//
// Welcome, Dr. Rahul Sharma 👋
// =======================================================

if (
    loggedInDoctor &&
    doctorNameElement
) {

    const fullName =
        loggedInDoctor.fullName;


    if (fullName) {

        doctorNameElement.textContent =
            fullName;

    }

    else {

        doctorNameElement.textContent =
            "Doctor";

    }

}


// =======================================================
// GET DOCTOR ID
// =======================================================
//
// Different login responses may store the MongoDB
// doctor ID using different property names.
//
// We check the commonly used properties without
// changing the existing login system.
// =======================================================

function getLoggedInDoctorId() {

    if (!loggedInDoctor) {

        return null;

    }


    return (
        loggedInDoctor._id ||
        loggedInDoctor.id ||
        loggedInDoctor.DoctorID ||
        loggedInDoctor.doctorId ||
        null
    );

}


// =======================================================
// FORMAT APPOINTMENT DATE
// =======================================================
//
// AppointmentDate is stored as a MongoDB Date.
//
// We first take the YYYY-MM-DD portion so that the
// appointment date does not shift because of timezone
// conversion.
// =======================================================

function getAppointmentDateOnly(
    appointmentDate
) {

    if (!appointmentDate) {

        return "";

    }


    const dateString =
        String(appointmentDate);


    if (
        dateString.includes("T")
    ) {

        return dateString.split("T")[0];

    }


    return dateString.substring(
        0,
        10
    );

}


// =======================================================
// DISPLAY DATE
// =======================================================
//
// Converts:
//
// 2026-09-27
//
// into:
//
// 27 Sep 2026
// =======================================================

function formatAppointmentDate(
    appointmentDate
) {

    const dateOnly =
        getAppointmentDateOnly(
            appointmentDate
        );


    if (!dateOnly) {

        return "-";

    }


    const parts =
        dateOnly.split("-");


    if (
        parts.length !== 3
    ) {

        return dateOnly;

    }


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateOnly;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =======================================================
// FORMAT APPOINTMENT TIME
// =======================================================
//
// Backend time is stored in HH:mm format.
//
// Example:
//
// 10:00 → 10:00 AM
// 14:20 → 02:20 PM
// =======================================================

function formatAppointmentTime(
    appointmentTime
) {

    if (!appointmentTime) {

        return "-";

    }


    const timeString =
        String(appointmentTime);


    const parts =
        timeString.split(":");


    if (
        parts.length < 2
    ) {

        return timeString;

    }


    let hours =
        Number(parts[0]);

    const minutes =
        Number(parts[1]);


    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {

        return timeString;

    }


    const period =
        hours >= 12
            ? "PM"
            : "AM";


    hours =
        hours % 12 || 12;


    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        " " +
        period
    );

}


// =======================================================
// GET STATUS CLASS
// =======================================================
//
// Used for the existing dashboard CSS.
//
// Booked     → pending
// Arrived    → confirmed
// Completed  → completed
// =======================================================

function getStatusClass(
    status
) {

    if (
        status === "Arrived"
    ) {

        return "confirmed";

    }


    if (
        status === "Completed"
    ) {

        return "completed";

    }


    return "pending";

}


// =======================================================
// GET APPOINTMENT MODE CLASS
// =======================================================
//
// Online   → online
// Walk-in  → walkin
// =======================================================

function getAppointmentModeClass(
    appointmentType
) {

    if (
        appointmentType === "Walk-in"
    ) {

        return "walkin";

    }


    return "online";

}


// =======================================================
// GET PATIENT NAME
// =======================================================
//
// Patient information normally comes from:
//
// appointment.PatientID.FullName
//
// A fallback is provided in case the patient document
// is unavailable.
// =======================================================

function getPatientName(
    appointment
) {

    if (
        appointment &&
        appointment.PatientID &&
        typeof appointment.PatientID === "object"
    ) {

        if (
            appointment.PatientID.FullName
        ) {

            return appointment.PatientID.FullName;

        }

    }


    return "Unknown Patient";

}


// =======================================================
// GET PATIENT ID
// =======================================================
//
// Returns the patient's MongoDB ID.
//
// This is used for counting unique patients instead
// of counting every appointment separately.
// =======================================================

function getPatientId(
    appointment
) {

    if (
        !appointment ||
        !appointment.PatientID
    ) {

        return null;

    }


    if (
        typeof appointment.PatientID === "object"
    ) {

        return (
            appointment.PatientID._id ||
            appointment.PatientID.id ||
            null
        );

    }


    return appointment.PatientID;

}


// =======================================================
// CREATE APPOINTMENT ROW
// =======================================================
//
// Creates one table row for the doctor's dashboard.
//
// Cancelled and Completed appointments are never passed
// to this function because they are filtered before
// rendering.
// =======================================================

function createAppointmentRow(
    appointment
) {

    const row =
        document.createElement("tr");


    // ===================================================
    // PATIENT
    // ===================================================

    const patientCell =
        document.createElement("td");

    patientCell.className =
        "patient-info";


    const patientName =
        getPatientName(
            appointment
        );


    patientCell.textContent =
        patientName;


    // ===================================================
    // DATE
    // ===================================================

    const dateCell =
        document.createElement("td");

    dateCell.className =
        "appointment-date";


    dateCell.textContent =
        formatAppointmentDate(
            appointment.AppointmentDate
        );


    // ===================================================
    // MODE
    // ===================================================

    const modeCell =
        document.createElement("td");

    modeCell.className =
        "appointment-mode";


    const modeSpan =
        document.createElement("span");

    modeSpan.className =
        "appointment-mode " +
        getAppointmentModeClass(
            appointment.AppointmentType
        );


    modeSpan.textContent =
        appointment.AppointmentType ||
        "-";


    modeCell.appendChild(
        modeSpan
    );


    // ===================================================
    // TIME
    // ===================================================

    const timeCell =
        document.createElement("td");

    timeCell.className =
        "appointment-time";


    timeCell.textContent =
        formatAppointmentTime(
            appointment.AppointmentTime
        );


    // ===================================================
    // STATUS
    // ===================================================

    const statusCell =
        document.createElement("td");


    const statusSpan =
        document.createElement("span");

    statusSpan.className =
        "status " +
        getStatusClass(
            appointment.Status
        );


    statusSpan.textContent =
        appointment.Status ||
        "-";


    statusCell.appendChild(
        statusSpan
    );


    // ===================================================
    // ACTION
    // ===================================================

    const actionCell =
        document.createElement("td");


    const viewButton =
        document.createElement("button");


    viewButton.type =
        "button";


    viewButton.className =
        "view-btn";


    viewButton.textContent =
        "View";


    // Store appointment ID for the
    // patient-details functionality later.

    if (
        appointment._id
    ) {

        viewButton.dataset.appointmentId =
            appointment._id;

    }


    // Temporary click handler.

    viewButton.addEventListener("click", function () {

        try {

            sessionStorage.setItem(
                "selectedDoctorAppointment",
                JSON.stringify(appointment)
            );

            window.location.href = "patient-view.html";

        } catch (error) {

            console.error("Unable to open patient details:", error);

            alert("Unable to open patient details. Please try again.");

        }

    });


    actionCell.appendChild(
        viewButton
    );


    // ===================================================
    // ADD CELLS TO ROW
    // ===================================================

    row.appendChild(
        patientCell
    );

    row.appendChild(
        dateCell
    );

    row.appendChild(
        modeCell
    );

    row.appendChild(
        timeCell
    );

    row.appendChild(
        statusCell
    );

    row.appendChild(
        actionCell
    );


    return row;

}


// =======================================================
// LOAD DOCTOR APPOINTMENTS
// =======================================================
//
// Gets all appointments for the logged-in doctor.
//
// Then:
//
// 1. Confirms appointments belong to the logged-in doctor.
// 2. Removes Cancelled appointments.
// 3. Counts unique patients from Booked, Arrived
//    and Completed appointments.
// 4. Keeps only Booked and Arrived for the dashboard table.
// 5. Calculates today's count.
// 6. Calculates upcoming count.
// =======================================================

async function loadDoctorAppointments() {

    if (
        !loggedInDoctor
    ) {

        return;

    }


    const doctorId =
        getLoggedInDoctorId();


    if (!doctorId) {

        console.error(
            "Doctor ID not found in localStorage."
        );

        if (noAppointmentsRow) {

            noAppointmentsRow.style.display =
                "table-row";

        }

        if (totalPatientsCountElement) {

            totalPatientsCountElement.textContent =
                "0";

        }

        return;

    }


    try {

        console.log(
            "Loading doctor appointments..."
        );


        const response =
            await fetch(
                `${APPOINTMENT_API_URL}/doctor/${doctorId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to fetch appointments. Status: " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "Appointments API response:",
            result
        );


        // =================================================
        // GET APPOINTMENT ARRAY
        // =================================================

        let appointments = [];


        if (
            Array.isArray(result)
        ) {

            appointments =
                result;

        }

        else if (
            Array.isArray(
                result.appointments
            )
        ) {

            appointments =
                result.appointments;

        }

        else if (
            Array.isArray(
                result.data
            )
        ) {

            appointments =
                result.data;

        }


        // =================================================
        // FILTER BY LOGGED-IN DOCTOR
        // =================================================

        appointments =
            appointments.filter(
                function (appointment) {

                    if (
                        !appointment.DoctorID
                    ) {

                        return false;

                    }


                    const appointmentDoctorId =
                        typeof appointment.DoctorID === "object"
                            ? appointment.DoctorID._id
                            : appointment.DoctorID;


                    return (
                        String(
                            appointmentDoctorId
                        ) ===
                        String(
                            doctorId
                        )
                    );

                }
            );


        // =================================================
        // REMOVE CANCELLED APPOINTMENTS
        // =================================================
        //
        // Cancelled appointments should not be included
        // anywhere in the doctor's dashboard.
        // =================================================

        appointments =
            appointments.filter(
                function (appointment) {

                    return (
                        appointment.Status !==
                        "Cancelled"
                    );

                }
            );


        // =================================================
        // CALCULATE TOTAL PATIENTS
        // =================================================
        //
        // Total Patients means unique patients belonging
        // to this doctor.
        //
        // Booked, Arrived and Completed appointments
        // are included.
        //
        // Cancelled appointments were already removed.
        //
        // The same patient is counted only once even if
        // they have multiple appointments with this doctor.
        // =================================================

        const uniquePatientIds =
            new Set();


        appointments.forEach(
            function (appointment) {

                const patientId =
                    getPatientId(
                        appointment
                    );


                if (
                    patientId
                ) {

                    uniquePatientIds.add(
                        String(patientId)
                    );

                }

            }
        );


        if (
            totalPatientsCountElement
        ) {

            totalPatientsCountElement.textContent =
                uniquePatientIds.size;

        }


        // =================================================
        // FILTER DASHBOARD APPOINTMENTS
        // =================================================
        //
        // Doctor Dashboard should show only:
        //
        // Booked
        // Arrived
        //
        // Completed appointments will be available
        // through the Doctor History page.
        //
        // Cancelled appointments are not shown.
        // =================================================

        let dashboardAppointments =
            appointments.filter(
                function (appointment) {

                    return (
                        appointment.Status === "Booked" ||
                        appointment.Status === "Arrived"
                    );

                }
            );


        // =================================================
        // SORT APPOINTMENTS
        // =================================================
        //
        // Priority:
        // 1. Arrived appointments appear first.
        // 2. Booked appointments appear after Arrived.
        // 3. Within each status, sort by date and time.
        //
        // Both Online and Walk-in appointments are included.
        // =================================================

        dashboardAppointments.sort(
            function (first, second) {

                // Give Arrived appointments higher priority.

                const firstPriority =
                    first.Status === "Arrived" ? 0 : 1;

                const secondPriority =
                    second.Status === "Arrived" ? 0 : 1;


                if (
                    firstPriority !== secondPriority
                ) {

                    return firstPriority - secondPriority;

                }


                // Sort by appointment date.

                const firstDate =
                    getAppointmentDateOnly(
                        first.AppointmentDate
                    );


                const secondDate =
                    getAppointmentDateOnly(
                        second.AppointmentDate
                    );


                if (
                    firstDate !==
                    secondDate
                ) {

                    return firstDate.localeCompare(
                        secondDate
                    );

                }


                // If dates match, sort by appointment time.

                return String(
                    first.AppointmentTime || ""
                ).localeCompare(
                    String(
                        second.AppointmentTime || ""
                    )
                );

            }
        );


        // =================================================
        // TODAY'S DATE
        // =================================================

        const now =
            new Date();


        const todayDate =
            now.getFullYear() +
            "-" +
            String(
                now.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                now.getDate()
            ).padStart(2, "0");


        // =================================================
        // CALCULATE COUNTS
        // =================================================

        const todayAppointments =
            dashboardAppointments.filter(
                function (appointment) {

                    return (
                        getAppointmentDateOnly(
                            appointment.AppointmentDate
                        ) === todayDate
                    );

                }
            );


        const upcomingAppointments =
            dashboardAppointments.filter(
                function (appointment) {

                    return (
                        getAppointmentDateOnly(
                            appointment.AppointmentDate
                        ) > todayDate
                    );

                }
            );


        // =================================================
        // UPDATE SUMMARY CARDS
        // =================================================

        if (
            todayCountElement
        ) {

            todayCountElement.textContent =
                todayAppointments.length;

        }


        if (
            upcomingCountElement
        ) {

            upcomingCountElement.textContent =
                upcomingAppointments.length;

        }


        // =================================================
        // CLEAR EXISTING TABLE ROWS
        // =================================================

        if (
            appointmentsTableBody
        ) {

            const rows =
                appointmentsTableBody.querySelectorAll(
                    "tr:not(#noAppointments)"
                );


            rows.forEach(
                function (row) {

                    row.remove();

                }
            );

        }


        // =================================================
        // SHOW NO APPOINTMENTS
        // =================================================

        if (
            dashboardAppointments.length === 0
        ) {

            if (
                noAppointmentsRow
            ) {

                noAppointmentsRow.style.display =
                    "table-row";

            }


            return;

        }


        // =================================================
        // HIDE NO APPOINTMENTS ROW
        // =================================================

        if (
            noAppointmentsRow
        ) {

            noAppointmentsRow.style.display =
                "none";

        }


        // =================================================
        // DISPLAY DASHBOARD APPOINTMENTS
        // =================================================

        if (
            appointmentsTableBody
        ) {

            dashboardAppointments.forEach(
                function (appointment) {

                    const row =
                        createAppointmentRow(
                            appointment
                        );


                    appointmentsTableBody.insertBefore(
                        row,
                        noAppointmentsRow
                    );

                }
            );

        }


        console.log(
            "Doctor appointments loaded:",
            dashboardAppointments.length
        );


        console.log(
            "Total unique patients:",
            uniquePatientIds.size
        );

    }


    catch (error) {

        console.error(
            "Error loading doctor appointments:",
            error
        );


        // =================================================
        // RESET COUNTS
        // =================================================

        if (
            todayCountElement
        ) {

            todayCountElement.textContent =
                "0";

        }


        if (
            upcomingCountElement
        ) {

            upcomingCountElement.textContent =
                "0";

        }


        if (
            totalPatientsCountElement
        ) {

            totalPatientsCountElement.textContent =
                "0";

        }


        // =================================================
        // SHOW EMPTY TABLE MESSAGE
        // =================================================

        if (
            appointmentsTableBody
        ) {

            const rows =
                appointmentsTableBody.querySelectorAll(
                    "tr:not(#noAppointments)"
                );


            rows.forEach(
                function (row) {

                    row.remove();

                }
            );

        }


        if (
            noAppointmentsRow
        ) {

            noAppointmentsRow.style.display =
                "table-row";

            const messageCell =
                noAppointmentsRow.querySelector(
                    "td"
                );


            if (
                messageCell
            ) {

                messageCell.textContent =
                    "Unable to load appointments.";

            }

        }

    }

}


// =======================================================
// MOBILE MENU
// =======================================================
//
// When the mobile menu button is clicked:
//
// 1. Sidebar opens.
// 2. Overlay appears.
// 3. Hamburger changes to X.
// 4. When closed, X changes back to hamburger.
// =======================================================

if (
    menuToggle &&
    sidebar
) {

    menuToggle.addEventListener(
        "click",
        function () {

            // Open / close sidebar

            sidebar.classList.toggle(
                "active"
            );


            // Show / hide overlay

            if (overlay) {

                overlay.classList.toggle(
                    "active"
                );

            }


            // Get menu icon

            const menuIcon =
                menuToggle.querySelector("i");


            // Change hamburger ↔ X

            if (
                sidebar.classList.contains("active")
            ) {

                if (menuIcon) {

                    menuIcon.classList.remove(
                        "bi-list"
                    );

                    menuIcon.classList.add(
                        "bi-x-lg"
                    );

                }

            }

            else {

                if (menuIcon) {

                    menuIcon.classList.remove(
                        "bi-x-lg"
                    );

                    menuIcon.classList.add(
                        "bi-list"
                    );

                }

            }

        }
    );

}


// =======================================================
// CLOSE MOBILE MENU USING OVERLAY
// =======================================================
//
// When the user clicks outside the sidebar,
// the sidebar should close.
// =======================================================

if (
    overlay &&
    sidebar
) {

    overlay.addEventListener(
        "click",
        function () {

            // Close sidebar

            sidebar.classList.remove(
                "active"
            );


            // Hide overlay

            overlay.classList.remove(
                "active"
            );


            // Change X back to hamburger

            const menuIcon =
                menuToggle
                    ? menuToggle.querySelector("i")
                    : null;


            if (menuIcon) {

                menuIcon.classList.remove(
                    "bi-x-lg"
                );

                menuIcon.classList.add(
                    "bi-list"
                );

            }

        }
    );

}


// =======================================================
// CLOSE MOBILE MENU AFTER CLICKING NAVIGATION
// =======================================================
//
// When a doctor clicks a sidebar navigation link
// on mobile, close the sidebar automatically.
// =======================================================

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar nav ul li a"
    );


sidebarLinks.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function () {

                // Only close sidebar on mobile

                if (
                    window.innerWidth <= 900
                ) {

                    if (sidebar) {

                        sidebar.classList.remove(
                            "active"
                        );

                    }


                    if (overlay) {

                        overlay.classList.remove(
                            "active"
                        );

                    }


                    // Change X back to hamburger

                    const menuIcon =
                        menuToggle
                            ? menuToggle.querySelector("i")
                            : null;


                    if (menuIcon) {

                        menuIcon.classList.remove(
                            "bi-x-lg"
                        );

                        menuIcon.classList.add(
                            "bi-list"
                        );

                    }

                }

            }
        );

    }
);


// =======================================================
// LOGOUT
// =======================================================
//
// When the doctor clicks Logout:
//
// 1. Prevent normal "#" link behaviour.
// 2. Remove doctor information from localStorage.
// 3. Redirect to doctor login page.
// =======================================================

if (logoutLink) {

    logoutLink.addEventListener(
        "click",
        function (event) {

            // Prevent "#" from changing the page

            event.preventDefault();


            // Remove logged-in doctor

            localStorage.removeItem(
                "doctor"
            );


            // Redirect to Doctor login

            window.location.href =
                "doctor-login.html";

        }
    );

}


// =======================================================
// HANDLE WINDOW RESIZE
// =======================================================
//
// If the user changes from mobile size
// to desktop size:
//
// Remove the mobile sidebar classes.
// =======================================================

window.addEventListener(
    "resize",
    function () {

        if (
            window.innerWidth > 900
        ) {

            if (sidebar) {

                sidebar.classList.remove(
                    "active"
                );

            }


            if (overlay) {

                overlay.classList.remove(
                    "active"
                );

            }


            // Reset icon to hamburger

            const menuIcon =
                menuToggle
                    ? menuToggle.querySelector("i")
                    : null;


            if (menuIcon) {

                menuIcon.classList.remove(
                    "bi-x-lg"
                );

                menuIcon.classList.add(
                    "bi-list"
                );

            }

        }

    }
);


// =======================================================
// LOAD APPOINTMENTS
// =======================================================
//
// The doctor dashboard loads all appointments belonging
// to the logged-in doctor after the page is ready.
// =======================================================

if (
    loggedInDoctor
) {

    loadDoctorAppointments();

}


// =======================================================
// DASHBOARD INITIALIZATION
// =======================================================
//
// This confirms that doctor.js has loaded correctly.
// =======================================================

console.log(
    "DermCare Doctor Dashboard loaded."
);


// =======================================================
// DEBUG LOG
// =======================================================
//
// This displays the logged-in doctor information
// in the browser console.
//
// It is useful while developing the project.
// =======================================================

if (loggedInDoctor) {

    console.log(
        "Logged-in doctor:",
        loggedInDoctor
    );

}
