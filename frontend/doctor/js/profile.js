// =======================================================
// DERMCARE - DOCTOR PROFILE JAVASCRIPT
// FILE: doctor/js/profile.js
// =======================================================


// =======================================================
// 1. API URL
// =======================================================

const API_URL =
    "http://localhost:5000/api";


// =======================================================
// 2. DEFAULT DOCTOR IMAGE
// =======================================================

const DEFAULT_DOCTOR_IMAGE =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg"
             width="300"
             height="300"
             viewBox="0 0 300 300">

            <rect
                width="300"
                height="300"
                fill="#EEF4FF"
            />

            <circle
                cx="150"
                cy="115"
                r="55"
                fill="#94A3B8"
            />

            <path
                d="M55 275c8-61 46-91 95-91s87 30 95 91"
                fill="#94A3B8"
            />

            <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="#D6E2EF"
                stroke-width="4"
            />

        </svg>
    `);


// =======================================================
// 3. ALL WORKING DAYS
// =======================================================

const ALL_WORKING_DAYS = [

    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"

];


// =======================================================
// 4. GET LOGGED-IN DOCTOR
// =======================================================

let loggedInDoctor = null;

try {

    loggedInDoctor =
        JSON.parse(
            localStorage.getItem("doctor")
        );

}

catch (error) {

    console.error(
        "Unable to read doctor login data:",
        error
    );

}


// =======================================================
// 5. CHECK DOCTOR LOGIN
// =======================================================

if (
    !loggedInDoctor ||
    !(
        loggedInDoctor._id ||
        loggedInDoctor.id
    )
) {

    window.location.href =
        "doctor-login.html";

}


// =======================================================
// 6. GET DOCTOR ID
// =======================================================

const doctorId =
    loggedInDoctor?._id ||
    loggedInDoctor?.id;


// =======================================================
// 7. GET MAIN HTML ELEMENTS
// =======================================================

const profileForm =
    document.getElementById(
        "profileForm"
    );


const passwordForm =
    document.getElementById(
        "passwordForm"
    );


const editProfileButton =
    document.getElementById(
        "editProfileButton"
    );


const cancelButton =
    document.getElementById(
        "cancelButton"
    );


const formActions =
    document.getElementById(
        "formActions"
    );


const saveButton =
    document.getElementById(
        "saveButton"
    );


const profileImageInput =
    document.getElementById(
        "profileImageInput"
    );


const profileImage =
    document.getElementById(
        "profileImage"
    );


// =======================================================
// 8. PROFILE INPUTS
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


const qualificationInput =
    document.getElementById(
        "qualification"
    );


const specializationInput =
    document.getElementById(
        "specialization"
    );


const experienceInput =
    document.getElementById(
        "experience"
    );


const consultationFeeInput =
    document.getElementById(
        "consultationFee"
    );


const aboutDoctorInput =
    document.getElementById(
        "aboutDoctor"
    );


const workingDaysContainer =
    document.getElementById(
        "workingDays"
    );


// =======================================================
// 9. PROFILE HEADER ELEMENTS
// =======================================================

const profileDoctorName =
    document.getElementById(
        "profileDoctorName"
    );


const profileSpecialization =
    document.getElementById(
        "profileSpecialization"
    );


// =======================================================
// 10. SIDEBAR ELEMENTS
// =======================================================

const sidebar =
    document.getElementById(
        "sidebar"
    );


const overlay =
    document.getElementById(
        "overlay"
    );


const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const logoutLink =
    document.getElementById(
        "logoutLink"
    );


// =======================================================
// 11. OPTIONAL SIDEBAR DOCTOR ELEMENTS
// =======================================================

const sidebarDoctorName =
    document.getElementById(
        "sidebarDoctorName"
    );


const sidebarDoctorImage =
    document.getElementById(
        "sidebarDoctorImage"
    );


const headerDoctorName =
    document.getElementById(
        "headerDoctorName"
    );


// =======================================================
// 12. PASSWORD INPUTS
// =======================================================

const currentPassword =
    document.getElementById(
        "currentPassword"
    );


const newPassword =
    document.getElementById(
        "newPassword"
    );


const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );


// =======================================================
// 13. ORIGINAL PROFILE DATA
// =======================================================

let originalProfileData = null;


// =======================================================
// 14. GET / CREATE FIELD ERROR ELEMENT
// =======================================================

function getErrorElement(input) {

    if (!input) {

        return null;

    }

    const errorId =
        input.id + "Error";

    let errorElement =
        document.getElementById(
            errorId
        );

    if (!errorElement) {

        errorElement =
            document.createElement(
                "small"
            );

        errorElement.id =
            errorId;

        errorElement.className =
            "field-error";

        errorElement.style.display =
            "none";

        const fieldContainer =
            input.parentElement;

        if (
            fieldContainer &&
            fieldContainer.parentElement
        ) {

            fieldContainer.parentElement.insertBefore(
                errorElement,
                fieldContainer.nextSibling
            );

        }

    }

    return errorElement;

}


// =======================================================
// 15. SHOW FIELD ERROR
// =======================================================

function showFieldError(
    input,
    message
) {

    if (!input) {

        return;

    }

    const errorElement =
        getErrorElement(
            input
        );

    if (errorElement) {

        errorElement.textContent =
            message;

        errorElement.style.display =
            "block";

    }

    input.classList.add(
        "input-error"
    );

}


// =======================================================
// 16. CLEAR FIELD ERROR
// =======================================================

function clearFieldError(input) {

    if (!input) {

        return;

    }

    const errorElement =
        document.getElementById(
            input.id + "Error"
        );

    if (errorElement) {

        errorElement.textContent =
            "";

        errorElement.style.display =
            "none";

    }

    input.classList.remove(
        "input-error"
    );

}


// =======================================================
// 17. CLEAR PROFILE ERRORS
// =======================================================

function clearProfileErrors() {

    const fields = [

        fullNameInput,
        emailInput,
        mobileNoInput,
        genderInput,
        qualificationInput,
        specializationInput,
        experienceInput,
        consultationFeeInput,
        aboutDoctorInput

    ];

    fields.forEach(
        function (field) {

            clearFieldError(
                field
            );

        }
    );


    const workingDaysError =
        document.getElementById(
            "workingDaysError"
        );

    if (workingDaysError) {

        workingDaysError.textContent =
            "";

        workingDaysError.style.display =
            "none";

    }

}


// =======================================================
// 18. CLEAR PASSWORD ERRORS
// =======================================================

function clearPasswordErrors() {

    const fields = [

        currentPassword,
        newPassword,
        confirmPassword

    ];

    fields.forEach(
        function (field) {

            clearFieldError(
                field
            );

        }
    );

}


// =======================================================
// 19. SUCCESS TOAST
// =======================================================

function showSuccessToast(message) {

    const oldToast =
        document.querySelector(
            ".doctor-success-toast"
        );

    if (oldToast) {

        oldToast.remove();

    }


    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "doctor-success-toast";


    const iconBadge =
        document.createElement(
            "div"
        );

    iconBadge.className =
        "doctor-toast-icon";


    const icon =
        document.createElement(
            "i"
        );

    icon.className =
        "bi bi-check-lg";


    iconBadge.appendChild(
        icon
    );


    const messageElement =
        document.createElement(
            "div"
        );

    messageElement.className =
        "doctor-toast-message";

    messageElement.textContent =
        message;


    const closeButton =
        document.createElement(
            "button"
        );

    closeButton.className =
        "doctor-toast-close";

    closeButton.type =
        "button";

    closeButton.innerHTML =
        "&times;";


    const progressBar =
        document.createElement(
            "div"
        );

    progressBar.className =
        "doctor-toast-progress";


    toast.appendChild(
        iconBadge
    );

    toast.appendChild(
        messageElement
    );

    toast.appendChild(
        closeButton
    );

    toast.appendChild(
        progressBar
    );


    document.body.appendChild(
        toast
    );


    let toastRemoved =
        false;


    function removeToast() {

        if (toastRemoved) {

            return;

        }

        toastRemoved =
            true;


        toast.style.transition =
            "opacity 0.25s ease, transform 0.25s ease";

        toast.style.opacity =
            "0";

        toast.style.transform =
            "translateX(30px)";


        setTimeout(
            function () {

                if (
                    toast &&
                    toast.parentNode
                ) {

                    toast.remove();

                }

            },
            250
        );

    }


    closeButton.addEventListener(
        "click",
        removeToast
    );


    setTimeout(
        function () {

            progressBar.style.transition =
                "transform 5s linear";

            progressBar.style.transform =
                "scaleX(0)";

        },
        50
    );


    setTimeout(
        removeToast,
        5000
    );

}


// =======================================================
// 20. GET DOCTOR IMAGE URL
// =======================================================

function getDoctorImageUrl(imagePath) {

    if (!imagePath) {

        return DEFAULT_DOCTOR_IMAGE;

    }

    if (
        imagePath.startsWith(
            "data:"
        )
    ) {

        return imagePath;

    }

    if (
        imagePath.startsWith(
            "http://"
        ) ||
        imagePath.startsWith(
            "https://"
        )
    ) {

        return imagePath;

    }

    const cleanPath =
        String(imagePath)
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");

    return (
        "http://localhost:5000/" +
        cleanPath
    );

}


// =======================================================
// 21. CREATE WORKING DAYS CHECKBOXES
// =======================================================

function createWorkingDaysCheckboxes(
    selectedDays = [],
    disabled = true
) {

    if (!workingDaysContainer) {

        return;

    }


    workingDaysContainer.innerHTML =
        "";


    ALL_WORKING_DAYS.forEach(
        function (day) {

            const label =
                document.createElement(
                    "label"
                );

            label.className =
                "working-day-option";


            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.name =
                "workingDays";

            checkbox.value =
                day;

            checkbox.checked =
                selectedDays.includes(
                    day
                );

            checkbox.disabled =
                disabled;


            const span =
                document.createElement(
                    "span"
                );

            span.textContent =
                day;


            label.appendChild(
                checkbox
            );

            label.appendChild(
                span
            );


            workingDaysContainer.appendChild(
                label
            );

        }
    );

}


// =======================================================
// 22. DISPLAY WORKING DAYS
// ONLY SELECTED DAYS IN NORMAL MODE
// =======================================================

function displayWorkingDays(
    workingDays
) {

    if (!workingDaysContainer) {

        return;

    }


    workingDaysContainer.innerHTML =
        "";


    if (
        !Array.isArray(
            workingDays
        ) ||
        workingDays.length === 0
    ) {

        const emptySpan =
            document.createElement(
                "span"
            );

        emptySpan.className =
            "working-day-empty";

        emptySpan.textContent =
            "Not available";

        workingDaysContainer.appendChild(
            emptySpan
        );

        return;

    }


    ALL_WORKING_DAYS.forEach(
        function (day) {

            if (
                workingDays.includes(
                    day
                )
            ) {

                const daySpan =
                    document.createElement(
                        "span"
                    );

                daySpan.className =
                    "working-day";

                daySpan.textContent =
                    day;

                workingDaysContainer.appendChild(
                    daySpan
                );

            }

        }
    );

}


// =======================================================
// 23. GET SELECTED WORKING DAYS
// =======================================================

function getSelectedWorkingDays() {

    if (!workingDaysContainer) {

        return [];

    }


    const selectedCheckboxes =
        workingDaysContainer.querySelectorAll(
            'input[name="workingDays"]:checked'
        );


    return Array.from(
        selectedCheckboxes
    ).map(
        function (checkbox) {

            return checkbox.value;

        }
    );

}


// =======================================================
// 24. DISPLAY DOCTOR DATA
// =======================================================

function displayDoctorData(
    doctor
) {

    if (!doctor) {

        return;

    }


    const fullName =
        doctor.fullName ||
        doctor.FullName ||
        "Doctor";


    const email =
        doctor.email ||
        doctor.Email ||
        "";


    const mobileNo =
        doctor.mobileNo ||
        doctor["Mobile No"] ||
        "";


    // ===================================================
    // GET GENDER FROM DATABASE
    // ===================================================

    const gender =
        doctor.gender ||
        doctor.Gender ||
        "";


    const qualification =
        doctor.qualification ||
        doctor.Qualification ||
        "";


    const specialization =
        doctor.specialization ||
        doctor.Specialization ||
        "Dermatologist";


    const experience =
        doctor.experience ??
        doctor.Experience ??
        "";


    const consultationFee =
        doctor.consultationFee ??
        doctor.ConsultationFee ??
        "";


    const aboutDoctor =
        doctor.aboutDoctor ||
        doctor.AboutDoctor ||
        doctor.about ||
        "";


    const workingDays =
        Array.isArray(
            doctor.workingDays
        )
            ? doctor.workingDays
            : Array.isArray(
                doctor.WorkingDays
            )
                ? doctor.WorkingDays
                : [];


    const doctorImage =
        doctor.doctorImage ||
        doctor.DoctorImage ||
        doctor.profileImage ||
        doctor.ProfileImage ||
        null;


    if (fullNameInput) {

        fullNameInput.value =
            fullName;

    }


    if (emailInput) {

        emailInput.value =
            email;

    }


    if (mobileNoInput) {

        mobileNoInput.value =
            mobileNo;

    }


    // ===================================================
    // SET GENDER FROM DATABASE
    // ===================================================

    if (genderInput) {

        genderInput.value =
            gender;

    }


    if (qualificationInput) {

        qualificationInput.value =
            qualification;

    }


    if (specializationInput) {

        specializationInput.value =
            specialization;

    }


    if (experienceInput) {

        experienceInput.value =
            experience;

    }


    if (consultationFeeInput) {

        consultationFeeInput.value =
            consultationFee;

    }


    if (aboutDoctorInput) {

        aboutDoctorInput.value =
            aboutDoctor;

    }


    // ===================================================
    // NORMAL VIEW = ONLY SELECTED DAYS
    // ===================================================

    displayWorkingDays(
        workingDays
    );


    const imageUrl =
        getDoctorImageUrl(
            doctorImage
        );


    if (profileImage) {

        profileImage.src =
            imageUrl;

    }


    if (sidebarDoctorImage) {

        sidebarDoctorImage.src =
            imageUrl;

    }


    if (profileDoctorName) {

        profileDoctorName.textContent =
            fullName;

    }


    if (profileSpecialization) {

        profileSpecialization.textContent =
            specialization;

    }


    if (sidebarDoctorName) {

        sidebarDoctorName.textContent =
            fullName;

    }


    if (headerDoctorName) {

        headerDoctorName.textContent =
            fullName;

    }


    const updatedDoctor = {

        ...loggedInDoctor,

        ...doctor,

        _id:
            doctor._id ||
            doctor.id ||
            loggedInDoctor._id,

        id:
            doctor.id ||
            doctor._id ||
            loggedInDoctor.id,

        fullName:
            fullName,

        email:
            email,

        mobileNo:
            mobileNo,

        gender:
            gender,

        qualification:
            qualification,

        specialization:
            specialization,

        experience:
            experience,

        consultationFee:
            consultationFee,

        workingDays:
            workingDays,

        doctorImage:
            doctorImage,

        aboutDoctor:
            aboutDoctor

    };


    localStorage.setItem(
        "doctor",
        JSON.stringify(
            updatedDoctor
        )
    );


    loggedInDoctor =
        updatedDoctor;

}


// =======================================================
// 25. LOAD DOCTOR PROFILE
// =======================================================

async function loadDoctorProfile() {

    if (!doctorId) {

        console.error(
            "Doctor ID not found."
        );

        return;

    }


    if (loggedInDoctor) {

        originalProfileData =
            JSON.parse(
                JSON.stringify(
                    loggedInDoctor
                )
            );

        displayDoctorData(
            loggedInDoctor
        );

    }


    try {

        const response =
            await fetch(
                `${API_URL}/doctors/${doctorId}`
            );


        const data =
            await response.json();


        console.log(
            "Doctor profile response:",
            data
        );


        if (!response.ok) {

            if (loggedInDoctor) {

                console.warn(
                    "Using doctor profile from localStorage."
                );

                return;

            }

            throw new Error(
                data.message ||
                "Unable to load doctor profile."
            );

        }


        if (
            !data.success ||
            !data.doctor
        ) {

            if (loggedInDoctor) {

                return;

            }

            throw new Error(
                "Doctor profile could not be loaded."
            );

        }


        originalProfileData =
            JSON.parse(
                JSON.stringify(
                    data.doctor
                )
            );


        displayDoctorData(
            data.doctor
        );


        console.log(
            "Doctor profile loaded successfully."
        );

    }

    catch (error) {

        console.error(
            "Load doctor profile error:",
            error
        );

    }

}


// =======================================================
// 26. ENABLE EDIT MODE
// =======================================================

function enableEditMode() {

    clearProfileErrors();


    const editableFields = [

        fullNameInput,
        emailInput,
        mobileNoInput,
        genderInput,
        qualificationInput,
        specializationInput,
        experienceInput,
        consultationFeeInput,
        aboutDoctorInput

    ];


    editableFields.forEach(
        function (field) {

            if (field) {

                field.disabled =
                    false;

            }

        }
    );


    // ===================================================
    // EDIT MODE = SHOW ALL 7 DAYS
    // ===================================================

    const savedWorkingDays =
        originalProfileData?.workingDays ||
        loggedInDoctor?.workingDays ||
        [];


    createWorkingDaysCheckboxes(
        savedWorkingDays,
        false
    );


    if (formActions) {

        formActions.style.display =
            "flex";

    }


    if (editProfileButton) {

        editProfileButton.style.display =
            "none";

    }

}


// =======================================================
// 27. DISABLE EDIT MODE
// =======================================================

function disableEditMode() {

    const editableFields = [

        fullNameInput,
        emailInput,
        mobileNoInput,
        genderInput,
        qualificationInput,
        specializationInput,
        experienceInput,
        consultationFeeInput,
        aboutDoctorInput

    ];


    editableFields.forEach(
        function (field) {

            if (field) {

                field.disabled =
                    true;

            }

        }
    );


    // ===================================================
    // NORMAL MODE = DISPLAY ONLY SELECTED DAYS
    // ===================================================

    const selectedDays =
        loggedInDoctor?.workingDays ||
        originalProfileData?.workingDays ||
        [];


    displayWorkingDays(
        selectedDays
    );


    if (formActions) {

        formActions.style.display =
            "none";

    }


    if (editProfileButton) {

        editProfileButton.style.display =
            "inline-flex";

    }

}


// =======================================================
// 28. VALIDATE PROFILE
// =======================================================

function validateProfile() {

    clearProfileErrors();


    const fullName =
        fullNameInput.value.trim();

    const email =
        emailInput.value.trim();

    const mobileNo =
        mobileNoInput.value.trim();

    const gender =
        genderInput.value;

    const qualification =
        qualificationInput.value.trim();

    const specialization =
        specializationInput.value.trim();

    const experience =
        experienceInput.value.trim();

    const consultationFee =
        consultationFeeInput.value.trim();

    const aboutDoctor =
        aboutDoctorInput.value.trim();

    const selectedWorkingDays =
        getSelectedWorkingDays();


    if (fullName.length < 3) {

        showFieldError(
            fullNameInput,
            "Full name must contain at least 3 characters."
        );

        fullNameInput.focus();

        return false;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            email
        )
    ) {

        showFieldError(
            emailInput,
            "Please enter a valid email address."
        );

        emailInput.focus();

        return false;

    }


    if (
        !/^[6-9][0-9]{9}$/.test(
            mobileNo
        )
    ) {

        showFieldError(
            mobileNoInput,
            "Please enter a valid 10-digit mobile number."
        );

        mobileNoInput.focus();

        return false;

    }


    // ===================================================
    // GENDER VALIDATION
    // ===================================================

    if (!gender) {

        showFieldError(
            genderInput,
            "Please select your gender."
        );

        genderInput.focus();

        return false;

    }


    if (!qualification) {

        showFieldError(
            qualificationInput,
            "Qualification cannot be empty."
        );

        qualificationInput.focus();

        return false;

    }


    if (!specialization) {

        showFieldError(
            specializationInput,
            "Specialization cannot be empty."
        );

        specializationInput.focus();

        return false;

    }


    const experienceNumber =
        Number(experience);


    if (
        experience === "" ||
        Number.isNaN(
            experienceNumber
        ) ||
        experienceNumber < 0 ||
        experienceNumber > 80
    ) {

        showFieldError(
            experienceInput,
            "Please enter experience between 0 and 80 years."
        );

        experienceInput.focus();

        return false;

    }


    const consultationFeeNumber =
        Number(
            consultationFee
        );


    if (
        consultationFee === "" ||
        Number.isNaN(
            consultationFeeNumber
        ) ||
        consultationFeeNumber <= 0
    ) {

        showFieldError(
            consultationFeeInput,
            "Please enter a valid consultation fee."
        );

        consultationFeeInput.focus();

        return false;

    }


    // ===================================================
    // WORKING DAYS VALIDATION
    // ===================================================

    if (
        selectedWorkingDays.length === 0
    ) {

        const workingDaysError =
            document.getElementById(
                "workingDaysError"
            );

        if (workingDaysError) {

            workingDaysError.textContent =
                "Please select at least one working day.";

            workingDaysError.style.display =
                "block";

        }

        return false;

    }


    if (
        aboutDoctor.length < 20
    ) {

        showFieldError(
            aboutDoctorInput,
            "About Doctor should contain at least 20 characters."
        );

        aboutDoctorInput.focus();

        return false;

    }


    return true;

}


// =======================================================
// 29. SAVE DOCTOR PROFILE
// =======================================================

async function saveDoctorProfile(
    event
) {

    event.preventDefault();


    if (!validateProfile()) {

        return;

    }


    try {

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.innerHTML = `
                <i class="bi bi-arrow-repeat"></i>
                <span>Saving...</span>
            `;

        }


        // ===================================================
        // GET SELECTED WORKING DAYS
        // ===================================================

        const selectedWorkingDays =
            getSelectedWorkingDays();


        const formData =
            new FormData();


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
        // SEND GENDER
        // ===================================================

        formData.append(
            "gender",
            genderInput.value
        );


        formData.append(
            "qualification",
            qualificationInput.value.trim()
        );


        formData.append(
            "specialization",
            specializationInput.value.trim()
        );


        formData.append(
            "experience",
            experienceInput.value.trim()
        );


        formData.append(
            "consultationFee",
            consultationFeeInput.value.trim()
        );


        formData.append(
            "aboutDoctor",
            aboutDoctorInput.value.trim()
        );


        // ===================================================
        // SEND WORKING DAYS
        // ===================================================

        formData.append(
            "workingDays",
            JSON.stringify(
                selectedWorkingDays
            )
        );


        if (
            profileImageInput &&
            profileImageInput.files &&
            profileImageInput.files.length > 0
        ) {

            formData.append(
                "profileImage",
                profileImageInput.files[0]
            );

        }


        const response =
            await fetch(
                `${API_URL}/doctors/${doctorId}`,
                {
                    method:
                        "PUT",

                    body:
                        formData
                }
            );


        const data =
            await response.json();


        console.log(
            "Profile update response:",
            data
        );


        if (!response.ok) {

            const message =
                data.message ||
                "Unable to update doctor profile.";


            const lowerMessage =
                message.toLowerCase();


            if (
                lowerMessage.includes(
                    "email"
                )
            ) {

                showFieldError(
                    emailInput,
                    message
                );

                emailInput.focus();

                return;

            }


            if (
                lowerMessage.includes(
                    "mobile"
                )
            ) {

                showFieldError(
                    mobileNoInput,
                    message
                );

                mobileNoInput.focus();

                return;

            }


            showFieldError(
                fullNameInput,
                message
            );

            fullNameInput.focus();

            return;

        }


        if (
            !data.success ||
            !data.doctor
        ) {

            showFieldError(
                fullNameInput,
                data.message ||
                "Profile update failed."
            );

            return;

        }


        displayDoctorData(
            data.doctor
        );


        originalProfileData =
            JSON.parse(
                JSON.stringify(
                    data.doctor
                )
            );


        if (profileImageInput) {

            profileImageInput.value =
                "";

        }


        disableEditMode();


        showSuccessToast(
            "Doctor profile updated successfully."
        );

    }

    catch (error) {

        console.error(
            "Save doctor profile error:",
            error
        );


        showFieldError(
            fullNameInput,
            "Unable to update doctor profile. Please try again."
        );

    }

    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML = `
                <i class="bi bi-check-lg"></i>
                <span>Save Changes</span>
            `;

        }

    }

}


// =======================================================
// 30. CANCEL EDIT
// =======================================================

function cancelEdit() {

    clearProfileErrors();


    if (originalProfileData) {

        displayDoctorData(
            originalProfileData
        );

    }


    if (profileImageInput) {

        profileImageInput.value =
            "";

    }


    disableEditMode();

}


// =======================================================
// 31. PROFILE IMAGE PREVIEW
// =======================================================

function previewProfileImage() {

    if (
        !profileImageInput ||
        !profileImageInput.files ||
        !profileImageInput.files[0]
    ) {

        return;

    }


    const file =
        profileImageInput.files[0];


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        profileImageInput.value =
            "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            if (profileImage) {

                profileImage.src =
                    event.target.result;

            }

        };


    reader.readAsDataURL(
        file
    );

}


// =======================================================
// 32. CHANGE PASSWORD
// =======================================================

async function changeDoctorPassword(
    event
) {

    event.preventDefault();


    clearPasswordErrors();


    const current =
        currentPassword.value.trim();


    const newPass =
        newPassword.value;


    const confirm =
        confirmPassword.value;


    if (!current) {

        showFieldError(
            currentPassword,
            "Please enter your current password."
        );

        currentPassword.focus();

        return;

    }


    if (!newPass) {

        showFieldError(
            newPassword,
            "Please enter a new password."
        );

        newPassword.focus();

        return;

    }


    if (newPass.length < 6) {

        showFieldError(
            newPassword,
            "New password must contain at least 6 characters."
        );

        newPassword.focus();

        return;

    }


    if (current === newPass) {

        showFieldError(
            newPassword,
            "New password must be different from your current password."
        );

        newPassword.focus();

        return;

    }


    if (!confirm) {

        showFieldError(
            confirmPassword,
            "Please confirm your new password."
        );

        confirmPassword.focus();

        return;

    }


    if (newPass !== confirm) {

        showFieldError(
            confirmPassword,
            "Passwords do not match."
        );

        confirmPassword.focus();

        return;

    }


    let changeButton =
        null;


    try {

        changeButton =
            passwordForm.querySelector(
                ".change-password-button"
            );


        if (changeButton) {

            changeButton.disabled =
                true;

            changeButton.innerHTML = `
                <i class="bi bi-arrow-repeat"></i>
                <span>Changing...</span>
            `;

        }


        const response =
            await fetch(
                `${API_URL}/doctors/${doctorId}/change-password`,
                {
                    method:
                        "PUT",

                    headers:
                        {
                            "Content-Type":
                                "application/json"
                        },

                    body:
                        JSON.stringify(
                            {
                                currentPassword:
                                    current,

                                newPassword:
                                    newPass
                            }
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            const message =
                data.message ||
                "Unable to change password.";


            const lowerMessage =
                message.toLowerCase();


            if (
                lowerMessage.includes(
                    "current"
                ) ||
                lowerMessage.includes(
                    "incorrect"
                ) ||
                lowerMessage.includes(
                    "wrong"
                )
            ) {

                showFieldError(
                    currentPassword,
                    message
                );

                currentPassword.focus();

                return;

            }


            showFieldError(
                newPassword,
                message
            );

            newPassword.focus();

            return;

        }


        if (!data.success) {

            showFieldError(
                currentPassword,
                data.message ||
                "Unable to change password."
            );

            return;

        }


        showSuccessToast(
            "Password changed successfully."
        );


        currentPassword.value =
            "";

        newPassword.value =
            "";

        confirmPassword.value =
            "";

        clearPasswordErrors();

    }

    catch (error) {

        console.error(
            "Change password error:",
            error
        );


        showFieldError(
            currentPassword,
            "Unable to change password. Please try again."
        );

    }

    finally {

        if (changeButton) {

            changeButton.disabled =
                false;

            changeButton.innerHTML = `
                <i class="bi bi-key"></i>
                <span>Change Password</span>
            `;

        }

    }

}


// =======================================================
// 33. PASSWORD SHOW / HIDE
// =======================================================

function setupPasswordToggles() {

    const toggleButtons =
        document.querySelectorAll(
            ".password-toggle"
        );


    toggleButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const targetId =
                        button.dataset.target;


                    const input =
                        document.getElementById(
                            targetId
                        );


                    if (!input) {

                        return;

                    }


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";


                        if (icon) {

                            icon.className =
                                "bi bi-eye-slash";

                        }

                    }

                    else {

                        input.type =
                            "password";


                        if (icon) {

                            icon.className =
                                "bi bi-eye";

                        }

                    }

                }
            );

        }
    );

}


// =======================================================
// 34. MOBILE HAMBURGER
// =======================================================

function setupMobileSidebar() {

    if (
        !menuToggle ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


    function openMobileSidebar() {

        sidebar.classList.add(
            "active"
        );

        overlay.classList.add(
            "active"
        );


        const icon =
            menuToggle.querySelector(
                "i"
            );


        if (icon) {

            icon.className =
                "bi bi-x-lg";

        }

    }


    function closeMobileSidebar() {

        sidebar.classList.remove(
            "active"
        );

        overlay.classList.remove(
            "active"
        );


        const icon =
            menuToggle.querySelector(
                "i"
            );


        if (icon) {

            icon.className =
                "bi bi-list";

        }

    }


    menuToggle.addEventListener(
        "click",
        function () {

            if (
                sidebar.classList.contains(
                    "active"
                )
            ) {

                closeMobileSidebar();

            }

            else {

                openMobileSidebar();

            }

        }
    );


    overlay.addEventListener(
        "click",
        closeMobileSidebar
    );

}


// =======================================================
// 35. LOGOUT
// =======================================================

function setupLogout() {

    if (!logoutLink) {

        return;

    }


    logoutLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            localStorage.removeItem(
                "doctor"
            );


            window.location.href =
                "doctor-login.html";

        }
    );

}


// =======================================================
// 36. MOBILE NUMBER INPUT
// =======================================================

function setupMobileNumber() {

    if (!mobileNoInput) {

        return;

    }


    mobileNoInput.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(
                        /[^0-9]/g,
                        ""
                    )
                    .slice(
                        0,
                        10
                    );


            if (
                this.value.length ===
                10
            ) {

                clearFieldError(
                    mobileNoInput
                );

            }

        }
    );

}


// =======================================================
// 37. IMAGE FALLBACK
// =======================================================

function setupImageFallback() {

    if (profileImage) {

        profileImage.addEventListener(
            "error",
            function () {

                this.src =
                    DEFAULT_DOCTOR_IMAGE;

            }
        );

    }

}


// =======================================================
// 38. CLEAR ERROR WHILE TYPING
// =======================================================

function setupFieldErrorClearing() {

    const fields = [

        fullNameInput,
        emailInput,
        mobileNoInput,
        genderInput,
        qualificationInput,
        specializationInput,
        experienceInput,
        consultationFeeInput,
        aboutDoctorInput,
        currentPassword,
        newPassword,
        confirmPassword

    ];


    fields.forEach(
        function (field) {

            if (!field) {

                return;

            }


            const eventName =
                field.tagName === "SELECT"
                    ? "change"
                    : "input";


            field.addEventListener(
                eventName,
                function () {

                    clearFieldError(
                        field
                    );

                }
            );

        }
    );

}


// =======================================================
// 39. EVENT LISTENERS
// =======================================================

if (editProfileButton) {

    editProfileButton.addEventListener(
        "click",
        enableEditMode
    );

}


if (cancelButton) {

    cancelButton.addEventListener(
        "click",
        cancelEdit
    );

}


if (profileForm) {

    profileForm.addEventListener(
        "submit",
        saveDoctorProfile
    );

}


if (passwordForm) {

    passwordForm.addEventListener(
        "submit",
        changeDoctorPassword
    );

}


if (profileImageInput) {

    profileImageInput.addEventListener(
        "change",
        previewProfileImage
    );

}


// =======================================================
// 40. INITIALIZE ALL FUNCTIONS
// =======================================================

setupPasswordToggles();

setupMobileSidebar();

setupLogout();

setupMobileNumber();

setupImageFallback();

setupFieldErrorClearing();


// =======================================================
// 41. DISABLE EDIT MODE INITIALLY
// =======================================================

disableEditMode();


// =======================================================
// 42. LOAD PROFILE FROM MONGODB
// =======================================================

loadDoctorProfile();