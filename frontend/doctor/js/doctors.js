// =======================================================
// DERMCARE - VIEW DOCTORS HOME PAGE JAVASCRIPT
// PURPOSE: Display all doctors from MongoDB
// =======================================================





// =======================================================
// API URL
// =======================================================

// Backend server is running on port 5000.

const API_URL =
    "http://localhost:5000/api/doctors";





// =======================================================
// GET DOCTORS CONTAINER
// =======================================================

// This is the HTML element where
// all doctor cards will be displayed.

const doctorsContainer =
    document.getElementById("doctorsContainer");





// =======================================================
// CHECK DOCTORS CONTAINER
// =======================================================

if (!doctorsContainer) {

    console.error(
        "Doctors container not found."
    );

}





// =======================================================
// LOAD DOCTORS
// =======================================================

async function loadDoctors() {

    // ---------------------------------------------------
    // Show loading message
    // ---------------------------------------------------

    doctorsContainer.innerHTML = `

        <div class="loading-message">

            <i class="bi bi-hourglass-split"></i>

            <p>
                Loading doctors...
            </p>

        </div>

    `;



    try {

        // ---------------------------------------------------
        // SEND REQUEST TO BACKEND
        // ---------------------------------------------------

        const response =
            await fetch(API_URL);



        // ---------------------------------------------------
        // CHECK RESPONSE
        // ---------------------------------------------------

        if (!response.ok) {

            throw new Error(
                "Failed to load doctors."
            );

        }



        // ---------------------------------------------------
        // CONVERT RESPONSE TO JSON
        // ---------------------------------------------------

        const data =
            await response.json();



        console.log(
            "Doctors API Response:",
            data
        );



        // ---------------------------------------------------
        // CHECK SUCCESS
        // ---------------------------------------------------

        if (
            !data.success ||
            !Array.isArray(data.doctors)
        ) {

            throw new Error(
                "Invalid doctors data received."
            );

        }



        // ---------------------------------------------------
        // CHECK IF DOCTORS ARE AVAILABLE
        // ---------------------------------------------------

        if (data.doctors.length === 0) {

            doctorsContainer.innerHTML = `

                <div class="error-message">

                    <i class="bi bi-person-x"></i>

                    <h3>
                        No Doctors Available
                    </h3>

                    <p>
                        There are currently no doctors
                        available in the clinic.
                    </p>

                </div>

            `;

            return;

        }



        // ---------------------------------------------------
        // CLEAR LOADING MESSAGE
        // ---------------------------------------------------

        doctorsContainer.innerHTML = "";



        // ---------------------------------------------------
        // DISPLAY EACH DOCTOR
        // ---------------------------------------------------

        data.doctors.forEach(
            function (doctor) {

                const doctorCard =
                    createDoctorCard(doctor);

                doctorsContainer.appendChild(
                    doctorCard
                );

            }
        );



    } catch (error) {

        // ---------------------------------------------------
        // CONSOLE ERROR
        // ---------------------------------------------------

        console.error(
            "Error loading doctors:",
            error
        );



        // ---------------------------------------------------
        // DISPLAY ERROR MESSAGE
        // ---------------------------------------------------

        doctorsContainer.innerHTML = `

            <div class="error-message">

                <i class="bi bi-exclamation-circle"></i>

                <h3>
                    Unable to Load Doctors
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}





// =======================================================
// CREATE DOCTOR CARD
// =======================================================

function createDoctorCard(doctor) {



    // ---------------------------------------------------
    // CREATE MAIN CARD
    // ---------------------------------------------------

    const card =
        document.createElement("div");

    card.className =
        "doctor-card";



    // ---------------------------------------------------
    // DOCTOR AVAILABILITY
    // ---------------------------------------------------

    // The Receptionist changes the doctor's
    // availability from Manage Doctors.
    //
    // The backend returns the saved value.
    //
    // Support both:
    // doctor.availability
    // and
    // doctor.Availability
    //
    // This keeps the page compatible with
    // the existing backend response.

    const availability =
        doctor.availability ||
        doctor.Availability ||
        "Available";



    const isAvailable =
        availability === "Available";



    const availabilityClass =
        isAvailable
            ? "available"
            : "not-available";



    const availabilityText =
        isAvailable
            ? "Available"
            : "Not Available";



    // ---------------------------------------------------
    // DOCTOR IMAGE
    // ---------------------------------------------------

    let doctorImage =
        "";



    if (
        doctor.doctorImage &&
        doctor.doctorImage.trim() !== ""
    ) {

        // Backend stores the image path
        // such as:
        //
        // uploads/doctors/image.png

        doctorImage =
            `http://localhost:5000/${doctor.doctorImage}`;

    }



    // ---------------------------------------------------
    // IMAGE HTML
    // ---------------------------------------------------

    let imageHTML;



    if (doctorImage) {

        imageHTML = `

            <img
                src="${doctorImage}"
                alt="${escapeHTML(
                    doctor.fullName || "Doctor"
                )}"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <i
                class="bi bi-person-badge default-doctor-icon"
                style="display:none;"
            ></i>

        `;

    } else {

        imageHTML = `

            <i
                class="bi bi-person-badge default-doctor-icon"
            ></i>

        `;

    }



    // ---------------------------------------------------
    // DOCTOR INFORMATION
    // ---------------------------------------------------

    const doctorName =
        doctor.fullName ||
        "Doctor";



    const specialization =
        doctor.specialization ||
        "Dermatologist";



    const experience =
        doctor.experience ||
        "Not Available";



    const consultationFee =
        doctor.consultationFee !== undefined &&
        doctor.consultationFee !== null
            ? doctor.consultationFee
            : "Not Available";



    // ---------------------------------------------------
    // CREATE CARD HTML
    // ---------------------------------------------------

    card.innerHTML = `

        <!-- ============================================
             DOCTOR AVAILABILITY
        ============================================= -->

        <div class="doctor-availability ${availabilityClass}">

            <i class="${
                isAvailable
                    ? "bi bi-check-circle-fill"
                    : "bi bi-x-circle-fill"
            }"></i>

            <span>
                ${availabilityText}
            </span>

        </div>



        <!-- ============================================
             DOCTOR IMAGE
        ============================================= -->

        <div class="doctor-image">

            ${imageHTML}

        </div>



        <!-- ============================================
             DOCTOR INFORMATION
        ============================================= -->

        <div class="doctor-info">



            <!-- Doctor Name -->

            <h3>
                ${escapeHTML(doctorName)}
            </h3>



            <!-- Specialization -->

            <h4>

                <i class="bi bi-person-badge"></i>

                ${escapeHTML(specialization)}

            </h4>



            <!-- Experience -->

            <p>

                <i class="bi bi-briefcase"></i>

                Experience :

                ${escapeHTML(
                    String(experience)
                )}

            </p>



            <!-- Consultation Fee -->

            <div class="consultation-fee">

                <span class="fee-label">

                    <i class="bi bi-currency-rupee"></i>

                    Consultation Fee

                </span>



                <span class="fee-amount">

                    ${
                        consultationFee ===
                        "Not Available"

                            ? "Not Available"

                            : "₹" +
                              escapeHTML(
                                  String(
                                      consultationFee
                                  )
                              )
                    }

                </span>

            </div>



            <!-- Book Appointment -->

            <a
                href="../login.html"
                class="book-btn"
            >

                <i class="bi bi-calendar-check"></i>

                Book Appointment

            </a>



        </div>

    `;



    return card;

}





// =======================================================
// ESCAPE HTML
// =======================================================

// This function protects the page from
// unwanted HTML being inserted through
// doctor information stored in the database.

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}





// =======================================================
// MOBILE HAMBURGER MENU
// =======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const menuToggle =
            document.getElementById("menuToggle");

        const mobileSidebar =
            document.getElementById("mobileSidebar");

        const sidebarOverlay =
            document.getElementById("sidebarOverlay");



        // ---------------------------------------------------
        // CHECK MOBILE MENU ELEMENTS
        // ---------------------------------------------------

        if (
            !menuToggle ||
            !mobileSidebar ||
            !sidebarOverlay
        ) {

            console.error(
                "Mobile menu elements not found."
            );

            return;

        }



        // ---------------------------------------------------
        // OPEN / CLOSE HAMBURGER
        // ---------------------------------------------------

        menuToggle.addEventListener(
            "click",
            function () {

                mobileSidebar.classList.toggle(
                    "mobile-open"
                );

                sidebarOverlay.classList.toggle(
                    "mobile-open"
                );



                // Change hamburger icon to X

                if (
                    mobileSidebar.classList.contains(
                        "mobile-open"
                    )
                ) {

                    menuToggle.innerHTML =
                        '<i class="bi bi-x-lg"></i>';

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                } else {

                    menuToggle.innerHTML =
                        '<i class="bi bi-list"></i>';

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );



        // ---------------------------------------------------
        // CLOSE WHEN OVERLAY IS CLICKED
        // ---------------------------------------------------

        sidebarOverlay.addEventListener(
            "click",
            function () {

                closeMobileMenu();

            }
        );



        // ---------------------------------------------------
        // CLOSE AFTER NAVIGATION CLICK
        // ---------------------------------------------------

        const mobileLinks =
            mobileSidebar.querySelectorAll("a");



        mobileLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        closeMobileMenu();

                    }
                );

            }
        );



        // ---------------------------------------------------
        // CLOSE WITH ESCAPE KEY
        // ---------------------------------------------------

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    mobileSidebar.classList.contains(
                        "mobile-open"
                    )
                ) {

                    closeMobileMenu();

                }

            }
        );



        // ---------------------------------------------------
        // CLOSE ON DESKTOP SCREEN
        // ---------------------------------------------------

        window.addEventListener(
            "resize",
            function () {

                if (window.innerWidth > 768) {

                    closeMobileMenu();

                }

            }
        );



        // ---------------------------------------------------
        // CLOSE MOBILE MENU FUNCTION
        // ---------------------------------------------------

        function closeMobileMenu() {

            mobileSidebar.classList.remove(
                "mobile-open"
            );

            sidebarOverlay.classList.remove(
                "mobile-open"
            );

            menuToggle.innerHTML =
                '<i class="bi bi-list"></i>';

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }
);





// =======================================================
// LOAD DOCTORS WHEN PAGE LOADS
// =======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDoctors();

    }
);