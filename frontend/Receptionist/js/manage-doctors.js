
// =======================================================
// DERMCARE - RECEPTIONIST MANAGE DOCTORS JAVASCRIPT
// =======================================================



// =======================================================
// BACKEND API URL
// =======================================================

const API_URL =
    "https://dermacare-eeca.onrender.com/api/doctors";



// =======================================================
// BACKEND BASE URL
// =======================================================

const BACKEND_URL =
    "https://dermacare-eeca.onrender.com";





// =======================================================
// GET HTML ELEMENTS
// =======================================================

const menuToggle =
    document.getElementById("menuToggle");



const sidebar =
    document.getElementById("sidebar");



const overlay =
    document.getElementById("overlay");



const doctorsContainer =
    document.getElementById("doctorsContainer");



const loadingMessage =
    document.getElementById("loadingMessage");





// =======================================================
// MOBILE SIDEBAR
// =======================================================

if (
    menuToggle &&
    sidebar &&
    overlay
) {

    menuToggle.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );



            overlay.classList.toggle(
                "show"
            );



            const menuIcon =
                menuToggle.querySelector("i");



            if (
                sidebar.classList.contains(
                    "mobile-open"
                )
            ) {

                if (menuIcon) {

                    menuIcon.className =
                        "bi bi-x-lg";

                }



                menuToggle.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

            else {

                if (menuIcon) {

                    menuIcon.className =
                        "bi bi-list";

                }



                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );





    // ===================================================
    // CLOSE SIDEBAR WHEN OVERLAY IS CLICKED
    // ===================================================

    overlay.addEventListener(
        "click",
        function () {

            closeMobileSidebar();

        }
    );

}





// =======================================================
// CLOSE MOBILE SIDEBAR FUNCTION
// =======================================================

function closeMobileSidebar() {

    if (
        !sidebar ||
        !overlay ||
        !menuToggle
    ) {

        return;

    }



    sidebar.classList.remove(
        "mobile-open"
    );



    overlay.classList.remove(
        "show"
    );



    const menuIcon =
        menuToggle.querySelector("i");



    if (menuIcon) {

        menuIcon.className =
            "bi bi-list";

    }



    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

}





// =======================================================
// CLOSE SIDEBAR WHEN SCREEN BECOMES DESKTOP
// =======================================================

window.addEventListener(
    "resize",
    function () {

        if (
            window.innerWidth > 650
        ) {

            closeMobileSidebar();

        }

    }
);





// =======================================================
// LOAD ALL DOCTORS
// =======================================================

async function loadDoctors() {

    try {

        console.log(
            "Loading doctors from:",
            API_URL
        );





        // ===================================================
        // SHOW LOADING MESSAGE
        // ===================================================

        if (loadingMessage) {

            loadingMessage.style.display =
                "flex";

        }





        // ===================================================
        // CLEAR OLD CONTENT
        // ===================================================

        if (doctorsContainer) {

            doctorsContainer.innerHTML =
                "";

        }





        // ===================================================
        // FETCH DOCTORS FROM BACKEND
        // ===================================================

        const response =
            await fetch(API_URL);





        // ===================================================
        // CONVERT RESPONSE TO JSON
        // ===================================================

        const responseData =
            await response.json();





        console.log(
            "Doctors API Response:",
            responseData
        );





        // ===================================================
        // CHECK RESPONSE
        // ===================================================

        if (!response.ok) {

            throw new Error(
                responseData.message ||
                "Unable to load doctors."
            );

        }





        // ===================================================
        // CHECK BACKEND SUCCESS RESPONSE
        // ===================================================

        if (
            responseData.success === false
        ) {

            throw new Error(
                responseData.message ||
                "Unable to load doctors."
            );

        }





        // ===================================================
        // CHECK BACKEND RESPONSE FORMAT
        // ===================================================

        let doctors = [];





        // ===================================================
        // BACKEND DIRECTLY RETURNS ARRAY
        // ===================================================

        if (
            Array.isArray(
                responseData
            )
        ) {

            doctors =
                responseData;

        }





        // ===================================================
        // BACKEND RETURNS:
        //
        // {
        //     success: true,
        //     count: ...,
        //     doctors: [...]
        // }
        // ===================================================

        else if (
            Array.isArray(
                responseData.doctors
            )
        ) {

            doctors =
                responseData.doctors;

        }





        // ===================================================
        // BACKEND RETURNS:
        //
        // {
        //     data: [...]
        // }
        // ===================================================

        else if (
            Array.isArray(
                responseData.data
            )
        ) {

            doctors =
                responseData.data;

        }





        // ===================================================
        // HIDE LOADING MESSAGE
        // ===================================================

        if (loadingMessage) {

            loadingMessage.style.display =
                "none";

        }





        // ===================================================
        // CHECK IF NO DOCTORS EXIST
        // ===================================================

        if (
            doctors.length === 0
        ) {

            showNoDoctorsMessage();

            return;

        }





        // ===================================================
        // DISPLAY EVERY DOCTOR
        // ===================================================

        doctors.forEach(
            function (doctor) {

                createDoctorCard(
                    doctor
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Error loading doctors:",
            error
        );





        // ===================================================
        // HIDE LOADING MESSAGE
        // ===================================================

        if (loadingMessage) {

            loadingMessage.style.display =
                "none";

        }





        // ===================================================
        // SHOW ERROR MESSAGE
        // ===================================================

        showErrorMessage(
            error.message
        );

    }

}





// =======================================================
// CREATE DOCTOR CARD
// =======================================================

function createDoctorCard(doctor) {





    // ===================================================
    // CREATE MAIN CARD
    // ===================================================

    const doctorCard =
        document.createElement("div");



    doctorCard.className =
        "doctor-item";





    // ===================================================
    // DOCTOR ID
    //
    // Backend formatDoctor() returns both:
    //
    // _id
    // id
    // ===================================================

    const doctorId =
        doctor._id ||
        doctor.id ||
        "";





    // ===================================================
    // DOCTOR NAME
    //
    // Supports:
    //
    // FullName
    // fullName
    // ===================================================

    const doctorName =
        doctor.FullName ||
        doctor.fullName ||
        "Doctor Name";





    // ===================================================
    // SPECIALIZATION
    // ===================================================

    const specialization =
        doctor.Specialization ||
        doctor.specialization ||
        "Dermatologist";





    // ===================================================
    // QUALIFICATION
    // ===================================================

    const qualification =
        doctor.Qualification ||
        doctor.qualification ||
        "Not Available";





    // ===================================================
    // EXPERIENCE
    // ===================================================

    const experience =
        doctor.Experience ??
        doctor.experience ??
        "Not Available";





    // ===================================================
    // CONSULTATION FEE
    // ===================================================

    const consultationFee =
        doctor.ConsultationFee ??
        doctor.consultationFee ??
        "Not Available";





    // ===================================================
    // MOBILE NUMBER
    // ===================================================

    const mobileNo =
        doctor["Mobile No"] ||
        doctor.MobileNo ||
        doctor.mobileNo ||
        doctor.mobile ||
        "Not Available";





    // ===================================================
    // EMAIL
    // ===================================================

    const email =
        doctor.Email ||
        doctor.email ||
        "Not Available";





    // ===================================================
    // WORKING DAYS
    // ===================================================

    const workingDays =
        doctor.WorkingDays ||
        doctor.workingDays ||
        [];





    // ===================================================
    // AVAILABILITY
    // ===================================================

    const availability =
        doctor.Availability ||
        doctor.availability ||
        "Available";





    // ===================================================
    // CHECK AVAILABILITY
    // ===================================================

    const isAvailable =
        availability === "Available";



    const availabilityClass =
        isAvailable
            ? "available"
            : "not-available";



    const availabilityIcon =
        isAvailable
            ? "bi bi-check-circle-fill"
            : "bi bi-x-circle-fill";



    const availabilityText =
        isAvailable
            ? "Available"
            : "Not Available";





    // ===================================================
    // DOCTOR PROFILE IMAGE
    // ===================================================

    const doctorImage =
        doctor.DoctorImage ||
        doctor.doctorImage ||
        doctor.profileImage ||
        "";





    let profileImageHTML;





    // ===================================================
    // CHECK IF IMAGE EXISTS
    // ===================================================

    if (
        doctorImage &&
        String(doctorImage).trim() !== ""
    ) {

        let imageURL =
            String(doctorImage).trim();





        // =================================================
        // IMAGE ALREADY HAS FULL URL
        // =================================================

        if (
            imageURL.startsWith("http://") ||
            imageURL.startsWith("https://")
        ) {

            // Use URL directly

        }





        // =================================================
        // IMAGE PATH STARTS WITH uploads/
        // =================================================

        else if (
            imageURL.startsWith(
                "uploads/"
            )
        ) {

            imageURL =
                BACKEND_URL +
                "/" +
                imageURL;

        }





        // =================================================
        // IMAGE PATH STARTS WITH /uploads/
        // =================================================

        else if (
            imageURL.startsWith(
                "/uploads/"
            )
        ) {

            imageURL =
                BACKEND_URL +
                imageURL;

        }





        // =================================================
        // ONLY FILENAME OR PARTIAL PATH EXISTS
        // =================================================

        else {

            imageURL =
                BACKEND_URL +
                "/uploads/" +
                imageURL.replace(
                    /^\/+/,
                    ""
                );

        }





        // =================================================
        // CREATE PROFILE IMAGE HTML
        // =================================================

        profileImageHTML = `

            <img
                src="${imageURL}"
                alt="${escapeHTML(doctorName)}"
                class="doctor-image"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <div
                class="doctor-default-image"
                style="display: none;"
            >

                <i class="bi bi-person"></i>

            </div>

        `;

    }





    // ===================================================
    // DEFAULT IMAGE
    // ===================================================

    else {

        profileImageHTML = `

            <div class="doctor-default-image">

                <i class="bi bi-person"></i>

            </div>

        `;

    }





    // ===================================================
    // CREATE WORKING DAYS HTML
    // ===================================================

    let workingDaysHTML =
        "";





    if (
        Array.isArray(workingDays) &&
        workingDays.length > 0
    ) {

        workingDays.forEach(
            function (day) {

                workingDaysHTML += `

                    <span class="working-day-tag">

                        ${escapeHTML(
                            String(day)
                        )}

                    </span>

                `;

            }
        );

    }





    // ===================================================
    // NO WORKING DAYS
    // ===================================================

    else {

        workingDaysHTML = `

            <span class="working-day-tag">

                Not Set

            </span>

        `;

    }





    // ===================================================
    // REMOVE DUPLICATE DR. PREFIX
    // ===================================================

    const displayDoctorName =
        String(doctorName).replace(
            /^Dr\.?\s*/i,
            ""
        );





    // ===================================================
    // INSERT DOCTOR CARD HTML
    // ===================================================

    doctorCard.innerHTML = `

        <!-- ===========================================
             DOCTOR IMAGE
        ============================================ -->

        <div class="doctor-image-section">

            <div
                class="availability-badge ${availabilityClass}"
            >

                <i class="${availabilityIcon}"></i>

                <span>
                    ${availabilityText}
                </span>

            </div>

            ${profileImageHTML}

        </div>


        <!-- ===========================================
             DOCTOR INFORMATION
        ============================================ -->

        <div class="doctor-info">

            <h3 class="doctor-name">

                Dr. ${escapeHTML(
                    displayDoctorName
                )}

            </h3>


            <p class="doctor-specialization">

                ${escapeHTML(
                    String(specialization)
                )}

            </p>


            <div class="doctor-details">

                <div class="doctor-detail">

                    <i class="bi bi-mortarboard-fill"></i>

                    <span>

                        <strong>
                            Qualification:
                        </strong>

                        ${escapeHTML(
                            String(qualification)
                        )}

                    </span>

                </div>


                <div class="doctor-detail">

                    <i class="bi bi-briefcase-fill"></i>

                    <span>

                        <strong>
                            Experience:
                        </strong>

                        ${escapeHTML(
                            String(experience)
                        )} Years

                    </span>

                </div>


                <div class="doctor-detail">

                    <i class="bi bi-currency-rupee"></i>

                    <span>

                        <strong>
                            Fee:
                        </strong>

                        ₹${escapeHTML(
                            String(consultationFee)
                        )}

                    </span>

                </div>


                <div class="doctor-detail">

                    <i class="bi bi-telephone-fill"></i>

                    <span>

                        ${escapeHTML(
                            String(mobileNo)
                        )}

                    </span>

                </div>


                <div class="doctor-detail">

                    <i class="bi bi-envelope-fill"></i>

                    <span>

                        ${escapeHTML(
                            String(email)
                        )}

                    </span>

                </div>

            </div>


            <div class="doctor-working-days">

                <h4>

                    <i class="bi bi-calendar-week"></i>

                    Working Days

                </h4>


                <div class="working-days-list">

                    ${workingDaysHTML}

                </div>

            </div>


            <div class="doctor-actions">

                <a
                    href="viewdoctor-details.html?id=${encodeURIComponent(doctorId)}"
                    class="view-details-button"
                >

                    <i class="bi bi-eye-fill"></i>

                    View

                </a>


                <a
                    href="edit-doctor.html?id=${encodeURIComponent(doctorId)}"
                    class="edit-doctor-button"
                >

                    <i class="bi bi-pencil-square"></i>

                    Edit

                </a>


                <button
                    type="button"
                    class="delete-doctor-button"
                    data-doctor-id="${escapeHTML(doctorId)}"
                    data-doctor-name="${escapeHTML(
                        displayDoctorName
                    )}"
                >

                    <i class="bi bi-trash3-fill"></i>

                    Delete

                </button>

            </div>

        </div>

    `;





    // ===================================================
    // GET DELETE BUTTON
    // ===================================================

    const deleteButton =
        doctorCard.querySelector(
            ".delete-doctor-button"
        );





    // ===================================================
    // DELETE BUTTON CLICK
    // ===================================================

    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            function () {

                deleteDoctor(
                    doctorId,
                    displayDoctorName
                );

            }
        );

    }





    // ===================================================
    // ADD CARD TO CONTAINER
    // ===================================================

    if (doctorsContainer) {

        doctorsContainer.appendChild(
            doctorCard
        );

    }

}





// =======================================================
// DELETE DOCTOR
// =======================================================

async function deleteDoctor(
    doctorId,
    doctorName
) {

    if (!doctorId) {

        alert(
            "Doctor ID not found. Unable to delete doctor."
        );

        return;

    }





    try {

        const deleteButtons =
            document.querySelectorAll(
                ".delete-doctor-button"
            );



        deleteButtons.forEach(
            function (button) {

                button.disabled =
                    true;

            }
        );





        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(doctorId)}`,
                {
                    method: "DELETE"
                }
            );





        const responseData =
            await response.json();





        console.log(
            "Delete Doctor Response:",
            responseData
        );





        if (!response.ok) {

            throw new Error(
                responseData.message ||
                "Unable to delete doctor."
            );

        }





        if (
            responseData.success === false
        ) {

            throw new Error(
                responseData.message ||
                "Unable to delete doctor."
            );

        }





        showSuccessMessage(
            "Dr. " +
            doctorName +
            " has been deleted successfully."
        );





        await loadDoctors();

    }

    catch (error) {

        console.error(
            "Error deleting doctor:",
            error
        );





        alert(
            error.message ||
            "Unable to delete doctor. Please try again."
        );





        const deleteButtons =
            document.querySelectorAll(
                ".delete-doctor-button"
            );



        deleteButtons.forEach(
            function (button) {

                button.disabled =
                    false;

            }
        );

    }

}





// =======================================================
// SHOW SUCCESS MESSAGE
// =======================================================

function showSuccessMessage(
    message
) {

    const successMessage =
        document.getElementById(
            "successMessage"
        );



    const successMessageText =
        document.getElementById(
            "successMessageText"
        );



    if (
        !successMessage ||
        !successMessageText
    ) {

        console.warn(
            "Success message elements not found."
        );

        return;

    }



    successMessageText.textContent =
        message;



    successMessage.classList.add(
        "show"
    );





    // ===================================================
    // HIDE MESSAGE AFTER FEW SECONDS
    // ===================================================

    setTimeout(
        function () {

            successMessage.classList.remove(
                "show"
            );

        },
        4000
    );

}





// =======================================================
// CHECK EDIT DOCTOR SUCCESS MESSAGE
// =======================================================
//
// The Edit Doctor page stores the success message in
// sessionStorage before redirecting to this page.
//
// This function reads that message and displays it.
// =======================================================

function checkDoctorUpdateSuccess() {

    const updateSuccessMessage =
        sessionStorage.getItem(
            "doctorUpdateSuccess"
        );



    // ===================================================
    // NO UPDATE MESSAGE
    // ===================================================

    if (!updateSuccessMessage) {

        return;

    }



    // ===================================================
    // SHOW SUCCESS MESSAGE
    // ===================================================

    showSuccessMessage(
        updateSuccessMessage
    );



    // ===================================================
    // REMOVE MESSAGE SO IT DOES NOT APPEAR AGAIN
    // ===================================================

    sessionStorage.removeItem(
        "doctorUpdateSuccess"
    );

}





// =======================================================
// SHOW NO DOCTORS MESSAGE
// =======================================================

function showNoDoctorsMessage() {

    if (!doctorsContainer) {

        return;

    }



    doctorsContainer.innerHTML = `

        <div
            class="empty-doctors-message"
            style="display: flex;"
        >

            <i class="bi bi-person-x"></i>

            <h3>
                No Doctors Found
            </h3>

            <p>
                No doctors have been added to the clinic yet.
            </p>

            <a
                href="add-doctor.html"
                class="empty-add-button"
            >

                <i class="bi bi-person-plus-fill"></i>

                Add Doctor

            </a>

        </div>

    `;

}





// =======================================================
// SHOW ERROR MESSAGE
// =======================================================

function showErrorMessage(
    errorMessage = ""
) {

    if (!doctorsContainer) {

        return;

    }



    doctorsContainer.innerHTML = `

        <div
            class="empty-doctors-message"
            style="display: flex;"
        >

            <i class="bi bi-exclamation-circle"></i>

            <h3>
                Unable to Load Doctors
            </h3>

            <p>

                ${
                    errorMessage
                        ? escapeHTML(errorMessage)
                        : "Please make sure the backend server is running and try again."
                }

            </p>

            <button
                type="button"
                class="retry-button"
                id="retryLoadDoctors"
            >

                Try Again

            </button>

        </div>

    `;





    // ===================================================
    // GET RETRY BUTTON
    // ===================================================

    const retryButton =
        document.getElementById(
            "retryLoadDoctors"
        );





    // ===================================================
    // RETRY LOADING DOCTORS
    // ===================================================

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            function () {

                loadDoctors();

            }
        );

    }

}





// =======================================================
// ESCAPE HTML
// =======================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");



    div.textContent =
        value === undefined ||
        value === null
            ? ""
            : String(value);



    return div.innerHTML;

}





// =======================================================
// LOAD DOCTORS WHEN PAGE OPENS
// =======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // =================================================
        // FIRST CHECK FOR EDIT DOCTOR SUCCESS MESSAGE
        // =================================================

        checkDoctorUpdateSuccess();


        // =================================================
        // THEN LOAD DOCTORS
        // =================================================

        loadDoctors();

    }
);
