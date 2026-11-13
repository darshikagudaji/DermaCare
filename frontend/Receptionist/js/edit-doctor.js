
// =======================================================
// DERMCARE - RECEPTIONIST EDIT DOCTOR JAVASCRIPT
// FILE: receptionist/js/edit-doctor.js
// =======================================================


// =======================================================
// BACKEND API URL
// =======================================================
const API_URL =
    "http://localhost:5000/api/doctors";


// =======================================================
// BACKEND SERVER URL
// =======================================================
const SERVER_URL =
    "http://localhost:5000";


// =======================================================
// GET URL PARAMETERS
// =======================================================
const urlParams =
    new URLSearchParams(
        window.location.search
    );


const doctorId =
    urlParams.get("id");


// =======================================================
// GET PAGE ELEMENTS
// =======================================================
const editDoctorForm =
    document.getElementById(
        "editDoctorForm"
    );


const editDoctorCard =
    document.getElementById(
        "editDoctorCard"
    );


const loadingMessage =
    document.getElementById(
        "loadingMessage"
    );


const successMessage =
    document.getElementById(
        "successMessage"
    );


const successMessageText =
    document.getElementById(
        "successMessageText"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


const errorMessageText =
    document.getElementById(
        "errorMessageText"
    );


const saveDoctorButton =
    document.getElementById(
        "saveDoctorButton"
    );


// =======================================================
// FORM INPUTS
// =======================================================
const fullNameInput =
    document.getElementById(
        "fullName"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const mobileNoInput =
    document.getElementById(
        "mobileNo"
    );


// =======================================================
// GENDER INPUT
// =======================================================
const genderInput =
    document.getElementById(
        "gender"
    );


const specializationInput =
    document.getElementById(
        "specialization"
    );


const qualificationInput =
    document.getElementById(
        "qualification"
    );


const experienceInput =
    document.getElementById(
        "experience"
    );


const consultationFeeInput =
    document.getElementById(
        "consultationFee"
    );


const availabilityInput =
    document.getElementById(
        "availability"
    );


const aboutDoctorInput =
    document.getElementById(
        "aboutDoctor"
    );


// =======================================================
// DOCTOR IMAGE ELEMENTS
// =======================================================
const doctorImageInput =
    document.getElementById(
        "doctorImage"
    );


const doctorImagePreview =
    document.getElementById(
        "doctorImagePreview"
    );


const doctorDefaultImage =
    document.getElementById(
        "doctorDefaultImage"
    );


// =======================================================
// MOBILE SIDEBAR ELEMENTS
// =======================================================
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


// =======================================================
// CURRENT DOCTOR DATA
// =======================================================
let currentDoctor =
    null;


// =======================================================
// CHECK DOCTOR ID
// =======================================================
if (!doctorId) {

    loadingMessage.style.display =
        "none";


    editDoctorCard.style.display =
        "none";


    showError(
        "Doctor information was not found."
    );

}


// =======================================================
// CLEAR FIELD ERROR
// =======================================================
// Kept for compatibility with existing page code.
// No automatic field validation is performed while
// editing the doctor.
// =======================================================
function clearFieldError(
    inputElement
) {

    if (!inputElement) {

        return;

    }


    const formGroup =
        inputElement.closest(
            ".form-group"
        );


    if (formGroup) {

        const errorElement =
            formGroup.querySelector(
                ".field-error"
            );


        if (errorElement) {

            errorElement.remove();

        }

    }


    inputElement.classList.remove(
        "input-error"
    );

}


// =======================================================
// CLEAR ALL FIELD ERRORS
// =======================================================
function clearAllFieldErrors() {

    const fieldErrors =
        document.querySelectorAll(
            ".field-error"
        );


    fieldErrors.forEach(
        (error) => {

            error.remove();

        }
    );


    const invalidInputs =
        document.querySelectorAll(
            ".input-error"
        );


    invalidInputs.forEach(
        (input) => {

            input.classList.remove(
                "input-error"
            );

        }
    );

}


// =======================================================
// LOAD DOCTOR INFORMATION
// =======================================================
async function loadDoctorInformation() {

    try {

        // ===================================================
        // SHOW LOADING
        // ===================================================
        loadingMessage.style.display =
            "flex";


        editDoctorCard.classList.remove(
            "show"
        );


        hideMessages();


        // ===================================================
        // FETCH DOCTOR DATA
        // ===================================================
        const response =
            await fetch(
                `${API_URL}/${doctorId}`
            );


        // ===================================================
        // CHECK RESPONSE
        // ===================================================
        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => null);


            throw new Error(
                errorData?.message ||
                "Unable to load doctor information."
            );

        }


        // ===================================================
        // GET RESPONSE DATA
        // ===================================================
        const data =
            await response.json();


        // ===================================================
        // CHECK DOCTOR DATA
        // ===================================================
        if (!data.doctor) {

            throw new Error(
                "Doctor information was not found."
            );

        }


        // ===================================================
        // STORE CURRENT DOCTOR
        // ===================================================
        currentDoctor =
            data.doctor;


        // ===================================================
        // FILL FORM
        // ===================================================
        fillDoctorForm(
            currentDoctor
        );


        // ===================================================
        // HIDE LOADING
        // ===================================================
        loadingMessage.style.display =
            "none";


        // ===================================================
        // SHOW FORM
        // ===================================================
        editDoctorCard.classList.add(
            "show"
        );

    }
    catch (error) {

        console.error(
            "Error loading doctor:",
            error
        );


        loadingMessage.style.display =
            "none";


        editDoctorCard.style.display =
            "none";


        showError(
            error.message ||
            "Unable to load doctor information."
        );

    }

}


// =======================================================
// FILL DOCTOR FORM
// =======================================================
function fillDoctorForm(doctor) {

    // ===================================================
    // BASIC INFORMATION
    // ===================================================
    fullNameInput.value =
        doctor.fullName || "";


    emailInput.value =
        doctor.email || "";


    mobileNoInput.value =
        doctor.mobileNo || "";


    // ===================================================
    // GENDER
    // ===================================================
    if (genderInput) {

        genderInput.value =
            doctor.gender || "";

    }


    // ===================================================
    // SPECIALIZATION
    // ===================================================
    specializationInput.value =
        doctor.specialization || "";


    // ===================================================
    // QUALIFICATION
    // ===================================================
    qualificationInput.value =
        doctor.qualification || "";


    // ===================================================
    // EXPERIENCE
    // ===================================================
    experienceInput.value =
        doctor.experience ?? "";


    // ===================================================
    // CONSULTATION FEE
    // ===================================================
    consultationFeeInput.value =
        doctor.consultationFee ?? "";


    // ===================================================
    // ABOUT DOCTOR
    // ===================================================
    aboutDoctorInput.value =
        doctor.aboutDoctor || "";


    // ===================================================
    // AVAILABILITY
    // ===================================================
    if (
        doctor.availability ===
        "Not Available"
    ) {

        availabilityInput.value =
            "Not Available";

    }
    else {

        availabilityInput.value =
            "Available";

    }


    // ===================================================
    // WORKING DAYS
    // ===================================================
    const workingDayCheckboxes =
        document.querySelectorAll(
            'input[name="WorkingDays"]'
        );


    // ===================================================
    // FIRST UNCHECK ALL DAYS
    // ===================================================
    workingDayCheckboxes.forEach(
        (checkbox) => {

            checkbox.checked =
                false;

        }
    );


    // ===================================================
    // CHECK SAVED WORKING DAYS
    // ===================================================
    if (
        Array.isArray(
            doctor.workingDays
        )
    ) {

        workingDayCheckboxes.forEach(
            (checkbox) => {

                if (
                    doctor.workingDays.includes(
                        checkbox.value
                    )
                ) {

                    checkbox.checked =
                        true;

                }

            }
        );

    }


    // ===================================================
    // DOCTOR IMAGE
    // ===================================================
    displayDoctorImage(
        doctor.doctorImage
    );

}


// =======================================================
// DISPLAY DOCTOR IMAGE
// =======================================================
function displayDoctorImage(imagePath) {

    // ===================================================
    // NO IMAGE
    // ===================================================
    if (!imagePath) {

        doctorImagePreview.removeAttribute(
            "src"
        );


        doctorImagePreview.classList.remove(
            "show"
        );


        doctorDefaultImage.classList.remove(
            "hide"
        );


        return;

    }


    // ===================================================
    // CLEAN IMAGE PATH
    // ===================================================
    const cleanImagePath =
        imagePath.replace(
            /^\/+/,
            ""
        );


    // ===================================================
    // CREATE FULL IMAGE URL
    // ===================================================
    const imageURL =
        `${SERVER_URL}/${cleanImagePath}`;


    // ===================================================
    // DISPLAY IMAGE
    // ===================================================
    doctorImagePreview.src =
        imageURL;


    doctorImagePreview.classList.add(
        "show"
    );


    doctorDefaultImage.classList.add(
        "hide"
    );

}


// =======================================================
// IMAGE LOAD ERROR
// =======================================================
doctorImagePreview.addEventListener(
    "error",
    function () {

        doctorImagePreview.classList.remove(
            "show"
        );


        doctorDefaultImage.classList.remove(
            "hide"
        );

    }
);


// =======================================================
// PREVIEW NEW IMAGE
// =======================================================
doctorImageInput.addEventListener(
    "change",
    function () {

        const selectedFile =
            this.files[0];


        // ===================================================
        // NO FILE SELECTED
        // ===================================================
        if (!selectedFile) {

            return;

        }


        // ===================================================
        // VALIDATE IMAGE TYPE
        // ===================================================
        if (
            !selectedFile.type.startsWith(
                "image/"
            )
        ) {

            showError(
                "Please select a valid image file."
            );


            doctorImageInput.value =
                "";


            return;

        }


        // ===================================================
        // CREATE IMAGE PREVIEW
        // ===================================================
        const imagePreviewURL =
            URL.createObjectURL(
                selectedFile
            );


        doctorImagePreview.src =
            imagePreviewURL;


        doctorImagePreview.classList.add(
            "show"
        );


        doctorDefaultImage.classList.add(
            "hide"
        );


        hideMessages();

    }
);


// =======================================================
// UPDATE DOCTOR
// =======================================================
editDoctorForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ===================================================
        // CLEAR OLD FIELD ERRORS
        // ===================================================
        clearAllFieldErrors();


        // ===================================================
        // CHECK DOCTOR ID
        // ===================================================
        if (!doctorId) {

            showError(
                "Doctor ID is missing."
            );


            return;

        }


        // ===================================================
        // IMPORTANT:
        // NO FIELD VALIDATION HERE
        //
        // Receptionist can edit only the field required.
        // Empty fields will NOT show validation messages.
        // ===================================================


        // ===================================================
        // HIDE OLD TOP MESSAGES
        // ===================================================
        hideMessages();


        // ===================================================
        // GET WORKING DAYS
        // ===================================================
        const selectedWorkingDays =
            [];


        const checkedDays =
            document.querySelectorAll(
                'input[name="WorkingDays"]:checked'
            );


        checkedDays.forEach(
            (checkbox) => {

                selectedWorkingDays.push(
                    checkbox.value
                );

            }
        );


        // ===================================================
        // CREATE FORM DATA
        // ===================================================
        const formData =
            new FormData();


        // ===================================================
        // ADD BASIC INFORMATION
        // ===================================================
        formData.append(
            "fullName",
            fullNameInput.value.trim()
        );


        formData.append(
            "email",
            emailInput.value.trim()
        );


        formData.append(
            "mobileNo",
            mobileNoInput.value.trim()
        );


        // ===================================================
        // ADD GENDER
        // ===================================================
        formData.append(
            "gender",
            genderInput.value
        );


        // ===================================================
        // ADD SPECIALIZATION
        // ===================================================
        formData.append(
            "specialization",
            specializationInput.value.trim()
        );


        // ===================================================
        // ADD QUALIFICATION
        // ===================================================
        formData.append(
            "qualification",
            qualificationInput.value.trim()
        );


        // ===================================================
        // ADD EXPERIENCE
        // ===================================================
        formData.append(
            "experience",
            experienceInput.value
        );


        // ===================================================
        // ADD CONSULTATION FEE
        // ===================================================
        formData.append(
            "consultationFee",
            consultationFeeInput.value
        );


        // ===================================================
        // ADD AVAILABILITY
        // ===================================================
        formData.append(
            "availability",
            availabilityInput.value
        );


        // ===================================================
        // ADD ABOUT DOCTOR
        // ===================================================
        formData.append(
            "aboutDoctor",
            aboutDoctorInput.value.trim()
        );


        // ===================================================
        // ADD WORKING DAYS
        // ===================================================
        formData.append(
            "workingDays",
            JSON.stringify(
                selectedWorkingDays
            )
        );


        // ===================================================
        // ADD IMAGE ONLY IF NEW IMAGE SELECTED
        // ===================================================
        if (
            doctorImageInput.files.length > 0
        ) {

            formData.append(
                "DoctorImage",
                doctorImageInput.files[0]
            );

        }


        try {

            // ===================================================
            // DISABLE SAVE BUTTON
            // ===================================================
            saveDoctorButton.disabled =
                true;


            saveDoctorButton.innerHTML =
                `
                    <i class="bi bi-arrow-repeat"></i>
                    Saving...
                `;


            // ===================================================
            // SEND UPDATE REQUEST
            // ===================================================
            const response =
                await fetch(
                    `${API_URL}/${doctorId}`,
                    {

                        method:
                            "PUT",

                        body:
                            formData

                    }
                );


            // ===================================================
            // GET RESPONSE
            // ===================================================
            const data =
                await response.json();


            // ===================================================
            // CHECK RESPONSE
            // ===================================================
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update doctor information."
                );

            }


            // ===================================================
            // UPDATE CURRENT DOCTOR DATA
            // ===================================================
            currentDoctor =
                data.doctor;


            // ===================================================
            // UPDATE IMAGE
            // ===================================================
            displayDoctorImage(
                currentDoctor.doctorImage
            );


            // ===================================================
            // CLEAR IMAGE INPUT
            // ===================================================
            doctorImageInput.value =
                "";


            // ===================================================
            // SAVE SUCCESS MESSAGE
            // ===================================================
            sessionStorage.setItem(
                "doctorUpdateSuccess",
                "Doctor information updated successfully."
            );


            // ===================================================
            // REDIRECT TO MANAGE DOCTORS PAGE
            // ===================================================
            window.location.href =
                "manage-doctors.html";

        }
        catch (error) {

            console.error(
                "Error updating doctor:",
                error
            );


            // ===================================================
            // KEEP EXISTING ERROR HANDLING
            // ===================================================
            showError(
                error.message ||
                "Unable to update doctor information."
            );

        }
        finally {

            saveDoctorButton.disabled =
                false;


            saveDoctorButton.innerHTML =
                `
                    <i class="bi bi-check-circle-fill"></i>
                    Save Changes
                `;

        }

    }
);


// =======================================================
// SHOW SUCCESS MESSAGE
// =======================================================
function showSuccess(message) {

    successMessageText.textContent =
        message;


    successMessage.classList.add(
        "show"
    );


    errorMessage.classList.remove(
        "show"
    );

}


// =======================================================
// SHOW ERROR MESSAGE
// =======================================================
function showError(message) {

    errorMessageText.textContent =
        message;


    errorMessage.classList.add(
        "show"
    );


    successMessage.classList.remove(
        "show"
    );


    window.scrollTo(
        {

            top:
                0,

            behavior:
                "smooth"

        }
    );

}


// =======================================================
// HIDE MESSAGES
// =======================================================
function hideMessages() {

    successMessage.classList.remove(
        "show"
    );


    errorMessage.classList.remove(
        "show"
    );

}


// =======================================================
// MOBILE SIDEBAR
// =======================================================
if (
    menuToggle &&
    sidebar &&
    overlay
) {

    // ===================================================
    // OPEN / CLOSE SIDEBAR
    // ===================================================
    menuToggle.addEventListener(
        "click",
        function () {

            const isOpen =
                sidebar.classList.toggle(
                    "mobile-open"
                );


            overlay.classList.toggle(
                "show",
                isOpen
            );


            menuToggle.setAttribute(
                "aria-expanded",
                isOpen
            );

        }
    );


    // ===================================================
    // CLOSE SIDEBAR
    // ===================================================
    overlay.addEventListener(
        "click",
        function () {

            sidebar.classList.remove(
                "mobile-open"
            );


            overlay.classList.remove(
                "show"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );

}


// =======================================================
// LOAD DOCTOR WHEN PAGE OPENS
// =======================================================
if (doctorId) {

    // ===================================================
    // LOAD DOCTOR INFORMATION
    // ===================================================
    loadDoctorInformation();

}
