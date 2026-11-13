// =======================================================
// DERMCARE - RECEPTIONIST VIEW DOCTOR DETAILS JAVASCRIPT
// PURPOSE:
// 1. Get doctor ID from URL
// 2. Fetch selected doctor from backend
// 3. Display selected doctor details
// 4. Handle mobile sidebar
// 5. Provide Edit Doctor navigation
// =======================================================


// =======================================================
// API SETTINGS
// =======================================================

const API_URL =
    "https://dermacare-eeca.onrender.com/api/doctors";

const BACKEND_URL =
    "https://dermacare-eeca.onrender.com";


// =======================================================
// GET HTML ELEMENTS
// =======================================================

const sidebar =
    document.getElementById("sidebar");

const menuToggle =
    document.getElementById("menuToggle");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const loadingMessage =
    document.getElementById("loadingMessage");

const errorMessage =
    document.getElementById("errorMessage");

const errorMessageText =
    document.getElementById("errorMessageText");

const doctorDetailsContainer =
    document.getElementById("doctorDetailsContainer");

const editDoctorButton =
    document.getElementById("editDoctorButton");


// =======================================================
// GET DOCTOR ID FROM URL
// Example:
// viewdoctor-details.html?id=68xxxxxxxx
// =======================================================

function getDoctorIdFromURL() {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    return urlParams.get("id");

}


// =======================================================
// MOBILE SIDEBAR
// =======================================================

if (
    menuToggle &&
    sidebar &&
    sidebarOverlay
) {

    menuToggle.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );

            sidebarOverlay.classList.toggle(
                "show"
            );

        }
    );


    sidebarOverlay.addEventListener(
        "click",
        function () {

            sidebar.classList.remove(
                "mobile-open"
            );

            sidebarOverlay.classList.remove(
                "show"
            );

        }
    );

}


// =======================================================
// CLOSE MOBILE SIDEBAR WHEN MENU LINK IS CLICKED
// =======================================================

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar-menu a"
    );


sidebarLinks.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function () {

                if (
                    window.innerWidth <= 650
                ) {

                    sidebar.classList.remove(
                        "mobile-open"
                    );

                    sidebarOverlay.classList.remove(
                        "show"
                    );

                }

            }
        );

    }
);


// =======================================================
// CREATE DOCTOR IMAGE URL
// =======================================================

function getDoctorImageURL(imagePath) {

    if (!imagePath) {

        return null;

    }


    // ---------------------------------------------------
    // Full image URL
    // ---------------------------------------------------

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {

        return imagePath;

    }


    // ---------------------------------------------------
    // Image path beginning with /
    // ---------------------------------------------------

    if (
        imagePath.startsWith("/")
    ) {

        return BACKEND_URL + imagePath;

    }


    // ---------------------------------------------------
    // Normal backend upload path
    // ---------------------------------------------------

    return BACKEND_URL + "/" + imagePath;

}


// =======================================================
// SHOW LOADING
// =======================================================

function showLoading() {

    if (loadingMessage) {

        loadingMessage.style.display =
            "flex";

    }


    if (doctorDetailsContainer) {

        doctorDetailsContainer.style.display =
            "none";

    }


    if (errorMessage) {

        errorMessage.classList.remove(
            "show"
        );

    }

}


// =======================================================
// HIDE LOADING
// =======================================================

function hideLoading() {

    if (loadingMessage) {

        loadingMessage.style.display =
            "none";

    }

}


// =======================================================
// SHOW ERROR
// =======================================================

function showError(message) {

    hideLoading();


    if (doctorDetailsContainer) {

        doctorDetailsContainer.style.display =
            "none";

    }


    if (errorMessageText) {

        errorMessageText.textContent =
            message;

    }


    if (errorMessage) {

        errorMessage.classList.add(
            "show"
        );

    }

}


// =======================================================
// DISPLAY WORKING DAYS
// =======================================================

function displayWorkingDays(workingDays) {

    const workingDaysContainer =
        document.getElementById(
            "workingDays"
        );


    if (!workingDaysContainer) {

        return;

    }


    workingDaysContainer.innerHTML =
        "";


    // ---------------------------------------------------
    // No working days
    // ---------------------------------------------------

    if (
        !workingDays ||
        !Array.isArray(workingDays) ||
        workingDays.length === 0
    ) {

        workingDaysContainer.innerHTML =
            `<span class="day-tag">Not Set</span>`;

        return;

    }


    // ---------------------------------------------------
    // Display working days
    // ---------------------------------------------------

    workingDays.forEach(
        function (day) {

            const dayTag =
                document.createElement(
                    "span"
                );


            dayTag.className =
                "day-tag";


            dayTag.textContent =
                day;


            workingDaysContainer.appendChild(
                dayTag
            );

        }
    );

}


// =======================================================
// DISPLAY DOCTOR DETAILS
// =======================================================

function displayDoctor(doctor) {

    hideLoading();


    if (errorMessage) {

        errorMessage.classList.remove(
            "show"
        );

    }


    if (doctorDetailsContainer) {

        doctorDetailsContainer.style.display =
            "block";

    }


    // ===================================================
    // DOCTOR NAME
    // ===================================================

    const doctorName =
        document.getElementById(
            "doctorName"
        );


    if (doctorName) {

        let name =
            doctor.fullName ||
            doctor.FullName ||
            "Doctor";


        // Remove existing Dr. prefix
        name =
            name.replace(
                /^Dr\.?\s*/i,
                ""
            );


        doctorName.textContent =
            "Dr. " + name;

    }


    // ===================================================
    // SPECIALIZATION
    // ===================================================

    const specialization =
        document.getElementById(
            "doctorSpecialization"
        );


    if (specialization) {

        specialization.textContent =
            doctor.specialization ||
            doctor.Specialization ||
            "Not Available";

    }


    // ===================================================
    // QUALIFICATION
    // ===================================================

    const qualification =
        document.getElementById(
            "doctorQualification"
        );


    if (qualification) {

        qualification.textContent =
            doctor.qualification ||
            doctor.Qualification ||
            "Not Available";

    }


    // ===================================================
    // EXPERIENCE
    // ===================================================

    const experience =
        document.getElementById(
            "doctorExperience"
        );


    if (experience) {

        const experienceValue =
            doctor.experience ??
            doctor.Experience;


        if (
            experienceValue !== undefined &&
            experienceValue !== null &&
            experienceValue !== ""
        ) {

            experience.textContent =
                `${experienceValue} Years`;

        } else {

            experience.textContent =
                "Not Available";

        }

    }


    // ===================================================
    // CONSULTATION FEE
    // IMPORTANT:
    // HTML ID = doctorFee
    // ===================================================

    const consultationFee =
        document.getElementById(
            "doctorFee"
        );


    if (consultationFee) {

        const fee =
            doctor.consultationFee ??
            doctor.ConsultationFee;


        if (
            fee !== undefined &&
            fee !== null &&
            fee !== ""
        ) {

            consultationFee.textContent =
                `₹${fee}`;

        } else {

            consultationFee.textContent =
                "Not Available";

        }

    }


    // ===================================================
    // MOBILE NUMBER
    // ===================================================

    const mobile =
        document.getElementById(
            "doctorMobile"
        );


    if (mobile) {

        mobile.textContent =
            doctor.mobileNo ||
            doctor["Mobile No"] ||
            "Not Available";

    }


    // ===================================================
    // EMAIL
    // ===================================================

    const email =
        document.getElementById(
            "doctorEmail"
        );


    if (email) {

        email.textContent =
            doctor.email ||
            doctor.Email ||
            "Not Available";

    }


    // ===================================================
    // GENDER
    // ===================================================

    const gender =
        document.getElementById(
            "doctorGender"
        );


    if (gender) {

        gender.textContent =
            doctor.gender ||
            "Not Available";

    }


    // ===================================================
    // AVAILABILITY
    // IMPORTANT:
    // HTML ID = availabilityBadge
    // Receptionist controls this value.
    // ===================================================

    const availabilityBadge =
        document.getElementById(
            "availabilityBadge"
        );


    if (availabilityBadge) {

        const availability =
            doctor.availability ||
            doctor.Availability ||
            "Not Available";


        // ------------------------------------------------
        // Display actual availability
        // ------------------------------------------------

        availabilityBadge.textContent =
            availability;


        // ------------------------------------------------
        // Remove previous classes
        // ------------------------------------------------

        availabilityBadge.classList.remove(
            "available",
            "not-available"
        );


        // ------------------------------------------------
        // Available
        // ------------------------------------------------

        if (
            availability.toLowerCase() ===
            "available"
        ) {

            availabilityBadge.classList.add(
                "available"
            );

        }


        // ------------------------------------------------
        // Not Available
        // ------------------------------------------------

        else {

            availabilityBadge.classList.add(
                "not-available"
            );

        }

    }


    // ===================================================
    // DOCTOR IMAGE
    // ===================================================

    const doctorImage =
        document.getElementById(
            "doctorImage"
        );

    const doctorDefaultImage =
        document.getElementById(
            "doctorDefaultImage"
        );


    const imagePath =
        doctor.doctorImage ||
        doctor.DoctorImage;


    if (
        doctorImage &&
        doctorDefaultImage
    ) {

        const imageURL =
            getDoctorImageURL(
                imagePath
            );


        // ------------------------------------------------
        // Doctor image available
        // ------------------------------------------------

        if (imageURL) {

            doctorImage.src =
                imageURL;

            doctorImage.style.display =
                "block";

            doctorDefaultImage.style.display =
                "none";


            // ------------------------------------------------
            // Image loading error
            // ------------------------------------------------

            doctorImage.onerror =
                function () {

                    doctorImage.style.display =
                        "none";

                    doctorDefaultImage.style.display =
                        "flex";

                };

        }


        // ------------------------------------------------
        // No image
        // ------------------------------------------------

        else {

            doctorImage.style.display =
                "none";

            doctorDefaultImage.style.display =
                "flex";

        }

    }


    // ===================================================
    // WORKING DAYS
    // ===================================================

    displayWorkingDays(
        doctor.workingDays ||
        doctor.WorkingDays ||
        []
    );


    // ===================================================
    // ABOUT DOCTOR
    // ===================================================

    const aboutDoctor =
        document.getElementById(
            "aboutDoctor"
        );


    if (aboutDoctor) {

        aboutDoctor.textContent =
            doctor.aboutDoctor ||
            doctor.AboutDoctor ||
            "No information available.";

    }


    // ===================================================
    // EDIT DOCTOR BUTTON
    // ===================================================

    if (editDoctorButton) {

        const doctorId =
            doctor._id ||
            doctor.id;


        if (doctorId) {

            editDoctorButton.href =
                `edit-doctor.html?id=${encodeURIComponent(doctorId)}`;

        }

    }

}


// =======================================================
// LOAD DOCTOR DETAILS
// =======================================================

async function loadDoctorDetails() {

    const doctorId =
        getDoctorIdFromURL();


    // ===================================================
    // CHECK DOCTOR ID
    // ===================================================

    if (!doctorId) {

        showError(
            "Doctor ID is missing. Please go back to Manage Doctors."
        );

        return;

    }


    showLoading();


    try {

        // =================================================
        // FETCH SELECTED DOCTOR
        // =================================================

        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(doctorId)}`
            );


        // =================================================
        // CHECK SERVER RESPONSE
        // =================================================

        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        // =================================================
        // CONVERT RESPONSE TO JSON
        // =================================================

        const responseData =
            await response.json();


        // =================================================
        // CHECK API RESPONSE
        // =================================================

        if (
            !responseData.success ||
            !responseData.doctor
        ) {

            throw new Error(
                responseData.message ||
                "Doctor details could not be found."
            );

        }


        // =================================================
        // DISPLAY SELECTED DOCTOR
        // =================================================

        displayDoctor(
            responseData.doctor
        );


    } catch (error) {

        console.error(
            "Error loading doctor details:",
            error
        );


        showError(
            "Unable to load doctor details. Please try again."
        );

    }

}


// =======================================================
// ESCAPE HTML
// =======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =======================================================
// LOGOUT
// =======================================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            localStorage.removeItem(
                "receptionist"
            );

            localStorage.removeItem(
                "receptionistData"
            );


            window.location.href =
                "../login.html";

        }
    );

}


// =======================================================
// LOAD PAGE
// =======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDoctorDetails();

    }
);