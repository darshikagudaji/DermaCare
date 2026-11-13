// =======================================================
// DERMCARE - PATIENT DASHBOARD JAVASCRIPT
// FILE: patient/js/patient.js
// =======================================================


// =======================================================
// BACKEND API
// =======================================================

const API_BASE_URL = "http://127.0.0.1:5000/api";


// =======================================================
// GET LOGGED-IN PATIENT
// =======================================================

let patientData = localStorage.getItem("patient");

if (!patientData) {
    const backupPatientData = localStorage.getItem("patientData");

    if (backupPatientData) {
        patientData = backupPatientData;
        localStorage.setItem("patient", backupPatientData);
    }
}


// =======================================================
// CONVERT PATIENT DATA FROM JSON
// =======================================================

let patient = null;

try {
    if (patientData) {
        patient = JSON.parse(patientData);
    }
} catch (error) {
    console.error("Invalid patient data:", error);

    localStorage.removeItem("patient");
    localStorage.removeItem("patientData");
}


// =======================================================
// CHECK PATIENT LOGIN
// =======================================================

if (!patient || !patient.id) {
    console.error("No valid patient data found in localStorage.");
    window.location.href = "../login.html";
}


// =======================================================
// GET PATIENT PROFILE FROM BACKEND
// =======================================================

const loadPatientProfile = async () => {

    if (!patient || !patient.id) {
        console.error("Patient ID not found.");
        return;
    }

    try {
        console.log("Fetching patient profile from backend...");

        const response = await fetch(
            `${API_BASE_URL}/patients/profile/${patient.id}`
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(
                "Failed to fetch patient profile:",
                data.message
            );
            return;
        }

        if (data.patient) {
            patient = data.patient;

            localStorage.setItem("patient", JSON.stringify(patient));
            localStorage.setItem("patientData", JSON.stringify(patient));

            if (patient.id) {
                localStorage.setItem("patientId", patient.id);
            }

            if (patient.email) {
                localStorage.setItem("patientEmail", patient.email);
            }

            if (patient.fullName) {
                localStorage.setItem("patientName", patient.fullName);
            }

            console.log("Patient profile loaded successfully.");
        }

    } catch (error) {
        console.error("Error fetching patient profile:", error);
    }
};


// =======================================================
// DISPLAY PATIENT NAME
// =======================================================

const displayPatientName = () => {

    const welcomeName = document.getElementById("welcomeName");

    if (welcomeName && patient && patient.fullName) {
        welcomeName.textContent = patient.fullName;
    }
};


// =======================================================
// PATIENT NOTIFICATION BELL
// =======================================================

const notificationCount =
    document.getElementById("notificationCount");


// =======================================================
// UPDATE NOTIFICATION COUNT
// =======================================================

const updateNotificationCount = (notifications) => {

    if (!notificationCount) {
        return;
    }

    const unreadCount = notifications.filter(
        notification => !notification.IsRead
    ).length;

    if (unreadCount > 0) {
        notificationCount.textContent =
            unreadCount > 99 ? "99+" : unreadCount;

        notificationCount.classList.remove("hidden");

    } else {
        notificationCount.textContent = "";
        notificationCount.classList.add("hidden");
    }
};


// =======================================================
// LOAD NOTIFICATIONS FOR DASHBOARD BELL
// =======================================================

const loadPatientNotifications = async () => {

    if (!patient || !patient.id) {
        console.error("Cannot load notifications. Patient ID missing.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/notifications/patient/${patient.id}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load notifications."
            );
        }

        const notifications = data.notifications || [];

        updateNotificationCount(notifications);

        console.log(
            "Dashboard notification count updated:",
            notifications.length
        );

    } catch (error) {
        console.error("Notification loading error:", error);
    }
};


// =======================================================
// LOAD ALL DOCTORS
// =======================================================

const loadDoctors = async () => {

    const doctorContainer =
        document.getElementById("doctorContainer");

    if (!doctorContainer) {
        console.error("Doctor container not found.");
        return;
    }

    doctorContainer.innerHTML = `
        <div class="doctor-loading">
            <i class="bi bi-hourglass-split"></i>
            <p>Loading doctors...</p>
        </div>
    `;

    try {

        console.log("Fetching doctors from backend...");

        const response = await fetch(
            `${API_BASE_URL}/doctors`
        );

        const data = await response.json();

        console.log("Doctors API response:", data);

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to fetch doctors."
            );
        }

        const doctors = data.doctors || [];

        if (doctors.length === 0) {

            doctorContainer.innerHTML = `
                <div class="doctor-message">
                    <i class="bi bi-person-x"></i>
                    <h3>No Doctors Available</h3>
                    <p>
                        There are currently no doctors
                        available in the clinic.
                    </p>
                </div>
            `;

            return;
        }

        doctorContainer.innerHTML = "";

        doctors.forEach(doctor => {
            createDoctorCard(doctorContainer, doctor);
        });

        console.log(
            `${doctors.length} doctor(s) loaded successfully.`
        );

    } catch (error) {

        console.error("Error loading doctors:", error);

        doctorContainer.innerHTML = `
            <div class="doctor-message">
                <i class="bi bi-exclamation-circle"></i>
                <h3>Unable to Load Doctors</h3>
                <p>Please try again later.</p>
                <button type="button" id="retryDoctors">
                    Try Again
                </button>
            </div>
        `;

        const retryButton =
            document.getElementById("retryDoctors");

        if (retryButton) {
            retryButton.addEventListener("click", loadDoctors);
        }
    }
};


// =======================================================
// CREATE DOCTOR CARD
// =======================================================

const createDoctorCard = (doctorContainer, doctor) => {

    const doctorCard = document.createElement("div");

    doctorCard.className = "doctor-card";


    // DOCTOR IMAGE

    let doctorImage = doctor.doctorImage;

    if (doctorImage) {

        if (
            !doctorImage.startsWith("http://") &&
            !doctorImage.startsWith("https://")
        ) {
            doctorImage =
                `http://127.0.0.1:5000/${doctorImage.replace(/^\/+/, "")}`;
        }

    } else {
        doctorImage = "Images/doctor-default.png";
    }


    // DOCTOR INFORMATION

    const doctorName = doctor.fullName || "Doctor";

    const qualification =
        doctor.qualification || "Dermatologist";

    const specialization =
        doctor.specialization || "";

    const experience =
        doctor.experience !== undefined &&
        doctor.experience !== null
            ? `${doctor.experience} Years Experience`
            : "";

    const consultationFee =
        doctor.consultationFee !== undefined &&
        doctor.consultationFee !== null
            ? `₹${Number(doctor.consultationFee).toLocaleString("en-IN")}`
            : "Fee not available";

    const doctorId = doctor.id;


    // AVAILABILITY

    const availability =
        doctor.availability ||
        doctor.Availability ||
        "Available";

    const isAvailable = availability === "Available";

    const availabilityClass =
        isAvailable ? "available" : "not-available";

    const availabilityIcon =
        isAvailable
            ? "bi bi-check-circle-fill"
            : "bi bi-x-circle-fill";

    const availabilityText =
        isAvailable ? "Available" : "Not Available";


    // CREATE CARD HTML

    doctorCard.innerHTML = `

        <div class="doctor-availability ${availabilityClass}">
            <i class="${availabilityIcon}"></i>
            <span>${availabilityText}</span>
        </div>

        <div class="doctor-image">
            <img
                src="${escapeHTML(doctorImage)}"
                alt="${escapeHTML(doctorName)}"
                onerror="this.src='Images/doctor-default.png'"
            >
        </div>

        <div class="doctor-info">

            <h3>${escapeHTML(doctorName)}</h3>

            <h4>
                <i class="bi bi-person-badge"></i>
                ${escapeHTML(qualification)}
            </h4>

            ${
                specialization
                    ? `
                        <p>
                            <i class="bi bi-heart-pulse"></i>
                            ${escapeHTML(specialization)}
                        </p>
                    `
                    : ""
            }

            ${
                experience
                    ? `
                        <p>
                            <i class="bi bi-briefcase"></i>
                            ${escapeHTML(experience)}
                        </p>
                    `
                    : ""
            }

            <div class="consultation-fee">

                <span class="fee-label">
                    <i class="bi bi-currency-rupee"></i>
                    Consultation Fee
                </span>

                <span class="fee-amount">
                    ${escapeHTML(consultationFee)}
                </span>

            </div>

            <a
                href="doctor-booking.html?doctor=${encodeURIComponent(doctorId)}"
                class="book-btn"
            >
                <i class="bi bi-calendar-check"></i>
                View &amp; Book
            </a>

        </div>
    `;

    doctorContainer.appendChild(doctorCard);
};


// =======================================================
// ESCAPE HTML
// =======================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =======================================================
// MOBILE MENU
// =======================================================

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.querySelector(".sidebar");

const overlay =
    document.getElementById("overlay");


// =======================================================
// RESET MOBILE MENU
// =======================================================

const closeMobileMenu = () => {

    if (sidebar) {
        sidebar.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

    if (menuToggle) {

        const icon = menuToggle.querySelector("i");

        if (icon) {
            icon.classList.remove("bi-x-lg");
            icon.classList.add("bi-list");
        }

        menuToggle.setAttribute("aria-label", "Open menu");
        menuToggle.setAttribute("aria-expanded", "false");
    }
};


// =======================================================
// OPEN / CLOSE MOBILE MENU
// =======================================================

if (menuToggle && sidebar) {

    menuToggle.addEventListener("click", () => {

        const isOpen = sidebar.classList.contains("active");

        if (isOpen) {

            closeMobileMenu();

        } else {

            sidebar.classList.add("active");

            if (overlay) {
                overlay.classList.add("active");
            }

            const icon = menuToggle.querySelector("i");

            if (icon) {
                icon.classList.remove("bi-list");
                icon.classList.add("bi-x-lg");
            }

            menuToggle.setAttribute("aria-label", "Close menu");
            menuToggle.setAttribute("aria-expanded", "true");
        }
    });
}


// =======================================================
// CLOSE MOBILE MENU USING OVERLAY
// =======================================================

if (overlay) {

    overlay.addEventListener("click", () => {
        closeMobileMenu();
    });
}


// =======================================================
// CLOSE MENU WHEN SIDEBAR LINK IS CLICKED
// =======================================================

if (sidebar) {

    const sidebarLinks = sidebar.querySelectorAll("a");

    sidebarLinks.forEach(link => {

        link.addEventListener("click", () => {
            closeMobileMenu();
        });
    });
}


// =======================================================
// CLOSE MENU USING ESCAPE KEY
// =======================================================

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeMobileMenu();
    }
});


// =======================================================
// CLOSE MENU WHEN RETURNING TO DESKTOP
// =======================================================

window.addEventListener("resize", () => {

    if (window.innerWidth > 900) {
        closeMobileMenu();
    }
});


// =======================================================
// LOGOUT
// =======================================================

const logoutLink =
    document.getElementById("logoutLink");

if (logoutLink) {

    logoutLink.addEventListener("click", event => {

        event.preventDefault();

        localStorage.removeItem("patient");
        localStorage.removeItem("patientId");
        localStorage.removeItem("patient_id");
        localStorage.removeItem("patientEmail");
        localStorage.removeItem("patientName");
        localStorage.removeItem("patientLoggedIn");
        localStorage.removeItem("patientData");

        window.location.href = "../index.html";
    });
}


// =======================================================
// INITIALIZE PATIENT DASHBOARD
// =======================================================

if (patient && patient.id) {

    loadPatientProfile()
        .then(() => {

            displayPatientName();

            // Get unread notification count for the bell.
            loadPatientNotifications();

        });
}


// =======================================================
// REFRESH NOTIFICATION COUNT WHEN RETURNING
// TO THE DASHBOARD
// =======================================================

window.addEventListener("pageshow", () => {

    if (patient && patient.id) {
        loadPatientNotifications();
    }
});


// =======================================================
// LOAD DOCTORS
// =======================================================

loadDoctors();