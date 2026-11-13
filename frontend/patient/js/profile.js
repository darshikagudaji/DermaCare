// =======================================================
// PATIENT PROFILE JAVASCRIPT
// =======================================================

// =======================================================
// API BASE URL
// =======================================================
const API_BASE_URL =
    "https://dermacare-eeca.onrender.com/api/patients";

// =======================================================
// GET PROFILE HTML ELEMENTS
// =======================================================
const profileForm =
    document.getElementById("profileForm");

const fullNameInput =
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const mobileInput =
    document.getElementById("mobile");

const dobInput =
    document.getElementById("dob");

const genderInput =
    document.getElementById("gender");

const bloodGroupInput =
    document.getElementById("bloodGroup");

const addressInput =
    document.getElementById("address");

const editProfileButton =
    document.getElementById("editProfile");

const saveProfileButton =
    document.getElementById("saveProfile");

// =======================================================
// PROFILE MESSAGE ELEMENTS
// =======================================================
const profileMessage =
    document.getElementById("profileMessage");

const profileMessageText =
    document.getElementById("profileMessageText");

const profileMessageIcon =
    document.getElementById("profileMessageIcon");

// =======================================================
// PASSWORD ELEMENTS
// =======================================================
const changePasswordButton =
    document.getElementById("changePasswordButton");

const changePasswordFormContainer =
    document.getElementById("changePasswordFormContainer");

const changePasswordForm =
    document.getElementById("changePasswordForm");

const cancelPasswordButton =
    document.getElementById("cancelPasswordButton");

const updatePasswordButton =
    document.getElementById("updatePasswordButton");

const currentPasswordInput =
    document.getElementById("currentPassword");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

// =======================================================
// PASSWORD TOGGLE BUTTONS
// =======================================================
const toggleCurrentPassword =
    document.getElementById("toggleCurrentPassword");

const toggleNewPassword =
    document.getElementById("toggleNewPassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

// =======================================================
// GET LOGGED-IN PATIENT
// =======================================================
let patient = null;

try {
    patient = JSON.parse(
        localStorage.getItem("patient")
    );
} catch (error) {
    console.error(
        "Unable to read patient from localStorage:",
        error
    );

    patient = null;
}

// =======================================================
// CHECK PATIENT LOGIN
// =======================================================
if (!patient || !patient.id) {

    alert("Please login first.");

    window.location.href =
        "../login.html";

} else {

    console.log(
        "Logged-in patient:",
        patient
    );

    loadPatientProfile();
}

// =======================================================
// CREATE FIELD ERROR
// =======================================================
function createFieldError(input, errorId) {

    if (!input) {
        return null;
    }

    let errorElement =
        document.getElementById(errorId);

    if (!errorElement) {

        errorElement =
            document.createElement("small");

        errorElement.id =
            errorId;

        errorElement.className =
            "field-error";

        input.parentNode.insertBefore(
            errorElement,
            input.nextSibling
        );
    }

    return errorElement;
}

// =======================================================
// CREATE PROFILE ERRORS
// =======================================================
createFieldError(
    fullNameInput,
    "fullNameError"
);

createFieldError(
    emailInput,
    "emailError"
);

createFieldError(
    mobileInput,
    "mobileError"
);

createFieldError(
    dobInput,
    "dobError"
);

createFieldError(
    genderInput,
    "genderError"
);

createFieldError(
    bloodGroupInput,
    "bloodGroupError"
);

createFieldError(
    addressInput,
    "addressError"
);

// =======================================================
// LOAD PATIENT PROFILE
// =======================================================
async function loadPatientProfile() {

    try {

        console.log(
            "Loading patient profile for ID:",
            patient.id
        );

        const response =
            await fetch(
                `${API_BASE_URL}/profile/${patient.id}`
            );

        const result =
            await response.json();

        console.log(
            "Profile API response:",
            result
        );

        if (!response.ok) {

            showProfileMessage(
                result.message ||
                "Unable to load profile.",
                "error"
            );

            return;
        }

        if (result.patient) {

            displayPatientProfile(
                result.patient
            );

        } else {

            showProfileMessage(
                "Patient profile data was not found.",
                "error"
            );
        }

    } catch (error) {

        console.error(
            "Error loading patient profile:",
            error
        );

        showProfileMessage(
            "Unable to connect to the server.",
            "error"
        );
    }
}

// =======================================================
// DISPLAY PATIENT PROFILE
// =======================================================
function displayPatientProfile(patientData) {

    if (fullNameInput) {

        fullNameInput.value =
            patientData.FullName ||
            patientData.fullName ||
            "";
    }

    if (emailInput) {

        emailInput.value =
            patientData.Email ||
            patientData.email ||
            "";
    }

    if (mobileInput) {

        mobileInput.value =
            patientData["Mobile No"] ||
            patientData.mobileNo ||
            "";
    }

    if (dobInput) {

        const dateValue =
            patientData.DateOfBirth ||
            patientData.dateOfBirth;

        dobInput.value =
            dateValue
                ? formatDate(dateValue)
                : "";
    }

    if (genderInput) {

        genderInput.value =
            patientData.Gender ||
            patientData.gender ||
            "";
    }

    if (bloodGroupInput) {

        bloodGroupInput.value =
            patientData["Blood Group"] ||
            patientData.bloodGroup ||
            "";
    }

    if (addressInput) {

        addressInput.value =
            patientData.Address ||
            patientData.address ||
            "";
    }

    clearAllFieldErrors();
}

// =======================================================
// FORMAT DATE
// =======================================================
function formatDate(dateValue) {

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// =======================================================
// EDIT PROFILE
// =======================================================
if (editProfileButton) {

    editProfileButton.addEventListener(
        "click",
        function () {

            hideProfileMessage();

            clearAllFieldErrors();

            enableProfileEditing();
        }
    );
}

// =======================================================
// ENABLE PROFILE EDITING
// =======================================================
function enableProfileEditing() {

    if (fullNameInput) {
        fullNameInput.disabled = false;
    }

    if (emailInput) {
        emailInput.disabled = false;
    }

    if (mobileInput) {
        mobileInput.disabled = false;
    }

    if (dobInput) {
        dobInput.disabled = false;
    }

    if (genderInput) {
        genderInput.disabled = false;
    }

    if (bloodGroupInput) {
        bloodGroupInput.disabled = false;
    }

    if (addressInput) {
        addressInput.disabled = false;
    }

    if (editProfileButton) {

        editProfileButton.style.display =
            "none";
    }

    if (saveProfileButton) {

        saveProfileButton.style.display =
            "inline-block";
    }

    if (fullNameInput) {
        fullNameInput.focus();
    }
}

// =======================================================
// SAVE PROFILE
// =======================================================
if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await updatePatientProfile();
        }
    );
}

// =======================================================
// VALIDATE PATIENT PROFILE
// =======================================================
function validatePatientProfile(data) {

    clearAllFieldErrors();

    // FULL NAME
    if (!data.fullName) {

        showFieldError(
            fullNameInput,
            "fullNameError",
            "Full Name is required."
        );

        fullNameInput.focus();

        return false;
    }

    const namePattern =
        /^[A-Za-z]+(?:\s+[A-Za-z]+)+$/;

    if (
        data.fullName.length < 2 ||
        !namePattern.test(data.fullName)
    ) {

        showFieldError(
            fullNameInput,
            "fullNameError",
            "Please enter a valid full name."
        );

        fullNameInput.focus();

        return false;
    }

    // EMAIL
    if (!data.email) {

        showFieldError(
            emailInput,
            "emailError",
            "Email is required."
        );

        emailInput.focus();

        return false;
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(data.email)) {

        showFieldError(
            emailInput,
            "emailError",
            "Please enter a valid email address."
        );

        emailInput.focus();

        return false;
    }

    // MOBILE
    if (!data.mobileNo) {

        showFieldError(
            mobileInput,
            "mobileError",
            "Mobile number is required."
        );

        mobileInput.focus();

        return false;
    }

    const mobilePattern =
        /^[0-9]{10}$/;

    if (!mobilePattern.test(data.mobileNo)) {

        showFieldError(
            mobileInput,
            "mobileError",
            "Mobile number must be exactly 10 digits."
        );

        mobileInput.focus();

        return false;
    }

    // DATE OF BIRTH
    if (!data.dateOfBirth) {

        showFieldError(
            dobInput,
            "dobError",
            "Date of Birth is required."
        );

        dobInput.focus();

        return false;
    }

    // GENDER
    if (!data.gender) {

        showFieldError(
            genderInput,
            "genderError",
            "Gender is required."
        );

        genderInput.focus();

        return false;
    }

    // BLOOD GROUP
    if (!data.bloodGroup) {

        showFieldError(
            bloodGroupInput,
            "bloodGroupError",
            "Blood Group is required."
        );

        bloodGroupInput.focus();

        return false;
    }

    // ADDRESS
    if (!data.address) {

        showFieldError(
            addressInput,
            "addressError",
            "Address is required."
        );

        addressInput.focus();

        return false;
    }

    return true;
}

// =======================================================
// SHOW FIELD ERROR
// =======================================================
function showFieldError(
    input,
    errorId,
    message
) {

    const errorElement =
        createFieldError(
            input,
            errorId
        );

    if (errorElement) {

        errorElement.textContent =
            message;
    }

    if (input) {

        input.classList.add(
            "input-error"
        );
    }
}

// =======================================================
// CLEAR FIELD ERROR
// =======================================================
function clearFieldError(
    input,
    errorId
) {

    if (!input) {
        return;
    }

    const errorElement =
        document.getElementById(
            errorId
        );

    if (errorElement) {

        errorElement.textContent =
            "";
    }

    input.classList.remove(
        "input-error"
    );
}

// =======================================================
// CLEAR ALL PROFILE ERRORS
// =======================================================
function clearAllFieldErrors() {

    clearFieldError(
        fullNameInput,
        "fullNameError"
    );

    clearFieldError(
        emailInput,
        "emailError"
    );

    clearFieldError(
        mobileInput,
        "mobileError"
    );

    clearFieldError(
        dobInput,
        "dobError"
    );

    clearFieldError(
        genderInput,
        "genderError"
    );

    clearFieldError(
        bloodGroupInput,
        "bloodGroupError"
    );

    clearFieldError(
        addressInput,
        "addressError"
    );
}

// =======================================================
// UPDATE PATIENT PROFILE
// =======================================================
async function updatePatientProfile() {

    try {

        const updatedData = {

            fullName:
                fullNameInput.value.trim(),

            email:
                emailInput.value.trim(),

            mobileNo:
                mobileInput.value.trim(),

            dateOfBirth:
                dobInput.value,

            gender:
                genderInput.value.trim(),

            bloodGroup:
                bloodGroupInput.value.trim(),

            address:
                addressInput.value.trim()
        };

        const isValid =
            validatePatientProfile(
                updatedData
            );

        if (!isValid) {

            console.log(
                "Profile validation failed."
            );

            return;
        }

        const response =
            await fetch(
                `${API_BASE_URL}/profile/${patient.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            updatedData
                        )
                }
            );

        const result =
            await response.json();

        if (!response.ok) {

            showProfileMessage(
                result.message ||
                "Unable to update profile.",
                "error"
            );

            return;
        }

        if (result.patient) {

            localStorage.setItem(
                "patient",
                JSON.stringify(
                    result.patient
                )
            );

            patient =
                result.patient;

            displayPatientProfile(
                result.patient
            );
        }

        disableProfileEditing();

        showProfileMessage(
            "Profile updated successfully!",
            "success"
        );

    } catch (error) {

        console.error(
            "Error updating patient profile:",
            error
        );

        showProfileMessage(
            "Unable to connect to the server.",
            "error"
        );
    }
}

// =======================================================
// DISABLE PROFILE EDITING
// =======================================================
function disableProfileEditing() {

    if (fullNameInput) {
        fullNameInput.disabled = true;
    }

    if (emailInput) {
        emailInput.disabled = true;
    }

    if (mobileInput) {
        mobileInput.disabled = true;
    }

    if (dobInput) {
        dobInput.disabled = true;
    }

    if (genderInput) {
        genderInput.disabled = true;
    }

    if (bloodGroupInput) {
        bloodGroupInput.disabled = true;
    }

    if (addressInput) {
        addressInput.disabled = true;
    }

    if (editProfileButton) {

        editProfileButton.style.display =
            "inline-block";
    }

    if (saveProfileButton) {

        saveProfileButton.style.display =
            "none";
    }
}

// =======================================================
// SHOW PROFILE MESSAGE
// =======================================================
function showProfileMessage(
    message,
    type
) {

    if (
        !profileMessage ||
        !profileMessageText
    ) {
        return;
    }

    profileMessageText.textContent =
        message;

    profileMessage.style.display =
        "flex";

    if (type === "success") {

        profileMessage.className =
            "profile-message success";

        if (profileMessageIcon) {

            profileMessageIcon.className =
                "bi bi-check-circle-fill";
        }

    } else {

        profileMessage.className =
            "profile-message error";

        if (profileMessageIcon) {

            profileMessageIcon.className =
                "bi bi-exclamation-circle-fill";
        }
    }

    clearTimeout(
        window.profileMessageTimer
    );

    window.profileMessageTimer =
        setTimeout(
            function () {

                hideProfileMessage();

            },
            4000
        );
}

// =======================================================
// HIDE PROFILE MESSAGE
// =======================================================
function hideProfileMessage() {

    if (!profileMessage) {
        return;
    }

    profileMessage.style.display =
        "none";
}

// =======================================================
// OPEN CHANGE PASSWORD FORM
// =======================================================
if (changePasswordButton) {

    changePasswordButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            hideProfileMessage();

            clearPasswordErrors();

            if (changePasswordFormContainer) {

                changePasswordFormContainer.style.display =
                    "block";
            }

            currentPasswordInput.value = "";
            newPasswordInput.value = "";
            confirmPasswordInput.value = "";

            resetPasswordToggle(
                currentPasswordInput,
                toggleCurrentPassword
            );

            resetPasswordToggle(
                newPasswordInput,
                toggleNewPassword
            );

            resetPasswordToggle(
                confirmPasswordInput,
                toggleConfirmPassword
            );

            currentPasswordInput.focus();
        }
    );
}

// =======================================================
// CANCEL CHANGE PASSWORD
// =======================================================
if (cancelPasswordButton) {

    cancelPasswordButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            clearPasswordErrors();

            currentPasswordInput.value = "";
            newPasswordInput.value = "";
            confirmPasswordInput.value = "";

            resetPasswordToggle(
                currentPasswordInput,
                toggleCurrentPassword
            );

            resetPasswordToggle(
                newPasswordInput,
                toggleNewPassword
            );

            resetPasswordToggle(
                confirmPasswordInput,
                toggleConfirmPassword
            );

            if (changePasswordFormContainer) {

                changePasswordFormContainer.style.display =
                    "none";
            }
        }
    );
}

// =======================================================
// CHANGE PASSWORD FORM SUBMIT
// =======================================================
if (changePasswordForm) {

    changePasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await changePatientPassword();
        }
    );
}

// =======================================================
// VALIDATE CHANGE PASSWORD
// =======================================================
function validateChangePassword() {

    clearPasswordErrors();

    const currentPassword =
        currentPasswordInput.value.trim();

    const newPassword =
        newPasswordInput.value.trim();

    const confirmPassword =
        confirmPasswordInput.value.trim();

    // CURRENT PASSWORD REQUIRED
    if (!currentPassword) {

        showPasswordError(
            currentPasswordInput,
            "currentPasswordError",
            "Current password is required."
        );

        currentPasswordInput.focus();

        return false;
    }

    // NEW PASSWORD REQUIRED
    if (!newPassword) {

        showPasswordError(
            newPasswordInput,
            "newPasswordError",
            "New password is required."
        );

        newPasswordInput.focus();

        return false;
    }

    // NEW PASSWORD LENGTH
    if (newPassword.length < 6) {

        showPasswordError(
            newPasswordInput,
            "newPasswordError",
            "New password must be at least 6 characters."
        );

        newPasswordInput.focus();

        return false;
    }

    // CONFIRM PASSWORD REQUIRED
    if (!confirmPassword) {

        showPasswordError(
            confirmPasswordInput,
            "confirmPasswordError",
            "Please confirm your new password."
        );

        confirmPasswordInput.focus();

        return false;
    }

    // PASSWORD MATCH
    if (newPassword !== confirmPassword) {

        showPasswordError(
            confirmPasswordInput,
            "confirmPasswordError",
            "New password and confirm password do not match."
        );

        confirmPasswordInput.focus();

        return false;
    }

    // SAME PASSWORD
    if (currentPassword === newPassword) {

        showPasswordError(
            newPasswordInput,
            "newPasswordError",
            "New password must be different from current password."
        );

        newPasswordInput.focus();

        return false;
    }

    return true;
}

// =======================================================
// SHOW PASSWORD ERROR
// =======================================================
function showPasswordError(
    input,
    errorId,
    message
) {

    const errorElement =
        document.getElementById(
            errorId
        );

    if (errorElement) {

        errorElement.textContent =
            message;
    }

    if (input) {

        input.classList.add(
            "input-error"
        );
    }
}

// =======================================================
// CLEAR PASSWORD ERRORS
// =======================================================
function clearPasswordErrors() {

    const inputs = [
        currentPasswordInput,
        newPasswordInput,
        confirmPasswordInput
    ];

    const errorIds = [
        "currentPasswordError",
        "newPasswordError",
        "confirmPasswordError"
    ];

    inputs.forEach(
        function (input) {

            if (input) {

                input.classList.remove(
                    "input-error"
                );
            }
        }
    );

    errorIds.forEach(
        function (errorId) {

            const error =
                document.getElementById(
                    errorId
                );

            if (error) {

                error.textContent =
                    "";
            }
        }
    );
}

// =======================================================
// CHANGE PATIENT PASSWORD
// =======================================================
async function changePatientPassword() {

    try {

        const currentPassword =
            currentPasswordInput.value.trim();

        const newPassword =
            newPasswordInput.value.trim();

        const confirmPassword =
            confirmPasswordInput.value.trim();

        // FRONTEND VALIDATION
        const isValid =
            validateChangePassword();

        if (!isValid) {

            console.log(
                "Password validation failed."
            );

            return;
        }

        // DISABLE BUTTON
        if (updatePasswordButton) {

            updatePasswordButton.disabled =
                true;

            updatePasswordButton.innerHTML =
                '<i class="bi bi-hourglass-split"></i> Updating...';
        }

        // SEND REQUEST TO BACKEND
        const response =
            await fetch(
                `${API_BASE_URL}/profile/${patient.id}/password`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            currentPassword:
                                currentPassword,

                            newPassword:
                                newPassword,

                            confirmPassword:
                                confirmPassword
                        })
                }
            );

        // READ RESPONSE
        const result =
            await response.json();

        console.log(
            "Change password response:",
            result
        );

        // BACKEND ERROR
        if (!response.ok) {

            if (
                result.field ===
                "currentPassword"
            ) {

                showPasswordError(
                    currentPasswordInput,
                    "currentPasswordError",
                    result.message ||
                    "Current password is incorrect."
                );

                currentPasswordInput.focus();

                return;
            }

            if (
                result.field ===
                "confirmPassword"
            ) {

                showPasswordError(
                    confirmPasswordInput,
                    "confirmPasswordError",
                    result.message ||
                    "New password and confirm password do not match."
                );

                confirmPasswordInput.focus();

                return;
            }

            if (
                result.field ===
                "newPassword"
            ) {

                showPasswordError(
                    newPasswordInput,
                    "newPasswordError",
                    result.message ||
                    "Invalid new password."
                );

                newPasswordInput.focus();

                return;
            }

            showProfileMessage(
                result.message ||
                "Unable to change password.",
                "error"
            );

            return;
        }

        // PASSWORD UPDATED SUCCESSFULLY
        showProfileMessage(
            result.message ||
            "Password changed successfully!",
            "success"
        );

        // CLEAR FORM
        currentPasswordInput.value = "";
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";

        clearPasswordErrors();

        // RESET PASSWORD EYES
        resetPasswordToggle(
            currentPasswordInput,
            toggleCurrentPassword
        );

        resetPasswordToggle(
            newPasswordInput,
            toggleNewPassword
        );

        resetPasswordToggle(
            confirmPasswordInput,
            toggleConfirmPassword
        );

        // HIDE PASSWORD FORM
        if (changePasswordFormContainer) {

            changePasswordFormContainer.style.display =
                "none";
        }

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        showProfileMessage(
            "Unable to connect to the server.",
            "error"
        );

    } finally {

        // RESTORE BUTTON
        if (updatePasswordButton) {

            updatePasswordButton.disabled =
                false;

            updatePasswordButton.innerHTML =
                '<i class="bi bi-check-circle-fill"></i> <span>Update Password</span>';
        }
    }
}

// =======================================================
// PASSWORD VISIBILITY TOGGLE
// =======================================================
function setupPasswordToggle(
    input,
    toggleButton
) {

    if (!input || !toggleButton) {
        return;
    }

    toggleButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            if (
                input.type ===
                "password"
            ) {

                input.type =
                    "text";

                toggleButton.innerHTML =
                    '<i class="bi bi-eye-slash"></i>';

                toggleButton.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type =
                    "password";

                toggleButton.innerHTML =
                    '<i class="bi bi-eye"></i>';

                toggleButton.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

            input.focus();
        }
    );
}

// =======================================================
// RESET PASSWORD TOGGLE
// =======================================================
function resetPasswordToggle(
    input,
    toggleButton
) {

    if (!input || !toggleButton) {
        return;
    }

    input.type =
        "password";

    toggleButton.innerHTML =
        '<i class="bi bi-eye"></i>';

    toggleButton.setAttribute(
        "aria-label",
        "Show password"
    );
}

// =======================================================
// CLEAR CURRENT PASSWORD ERROR WHEN TYPING
// =======================================================
if (currentPasswordInput) {

    currentPasswordInput.addEventListener(
        "input",
        function () {

            clearSinglePasswordError(
                currentPasswordInput,
                "currentPasswordError"
            );
        }
    );
}

// =======================================================
// CLEAR NEW PASSWORD ERROR WHEN TYPING
// =======================================================
if (newPasswordInput) {

    newPasswordInput.addEventListener(
        "input",
        function () {

            clearSinglePasswordError(
                newPasswordInput,
                "newPasswordError"
            );

            clearSinglePasswordError(
                confirmPasswordInput,
                "confirmPasswordError"
            );
        }
    );
}

// =======================================================
// CLEAR CONFIRM PASSWORD ERROR WHEN TYPING
// =======================================================
if (confirmPasswordInput) {

    confirmPasswordInput.addEventListener(
        "input",
        function () {

            clearSinglePasswordError(
                confirmPasswordInput,
                "confirmPasswordError"
            );
        }
    );
}

// =======================================================
// CLEAR SINGLE PASSWORD ERROR
// =======================================================
function clearSinglePasswordError(
    input,
    errorId
) {

    if (input) {

        input.classList.remove(
            "input-error"
        );
    }

    const errorElement =
        document.getElementById(
            errorId
        );

    if (errorElement) {

        errorElement.textContent =
            "";
    }
}

// =======================================================
// INITIALIZE PASSWORD EYES
// =======================================================
setupPasswordToggle(
    currentPasswordInput,
    toggleCurrentPassword
);

setupPasswordToggle(
    newPasswordInput,
    toggleNewPassword
);

setupPasswordToggle(
    confirmPasswordInput,
    toggleConfirmPassword
);

// =======================================================
// INITIAL PROFILE STATE
// =======================================================
disableProfileEditing();

// =======================================================
// INITIAL PASSWORD STATE
// =======================================================
if (changePasswordFormContainer) {

    changePasswordFormContainer.style.display =
        "none";
}


// =======================================================
// PATIENT PROFILE - HAMBURGER + X MENU
// ONLY MOBILE SIDEBAR FUNCTIONALITY
// =======================================================

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");


// =======================================================
// UPDATE HAMBURGER ICON
// =======================================================
function updateMenuIcon() {

    if (!menuToggle) {
        return;
    }

    const icon =
        menuToggle.querySelector("i");

    if (!icon) {
        return;
    }

    if (
        sidebar &&
        sidebar.classList.contains("active")
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


// =======================================================
// OPEN / CLOSE SIDEBAR
// =======================================================
if (menuToggle && sidebar) {

    menuToggle.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "active"
            );

            if (overlay) {

                overlay.classList.toggle(
                    "active"
                );
            }

            updateMenuIcon();
        }
    );
}


// =======================================================
// CLOSE MOBILE MENU
// =======================================================
function closeMobileMenu() {

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

    updateMenuIcon();
}


// =======================================================
// CLOSE WHEN CLICKING OVERLAY
// =======================================================
if (overlay) {

    overlay.addEventListener(
        "click",
        closeMobileMenu
    );
}


// =======================================================
// CLOSE WHEN CLICKING SIDEBAR LINK
// =======================================================
if (sidebar) {

    const sidebarLinks =
        sidebar.querySelectorAll(
            "nav a"
        );

    sidebarLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    closeMobileMenu();
                }
            );
        }
    );
}


// =======================================================
// CLOSE WITH ESCAPE KEY
// =======================================================
document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeMobileMenu();
        }
    }
);


// =======================================================
// CLOSE WHEN MOVING TO DESKTOP
// =======================================================
window.addEventListener(
    "resize",
    function () {

        if (
            window.innerWidth >
            1024
        ) {

            closeMobileMenu();
        }
    }
);


// =======================================================
// INITIAL HAMBURGER STATE
// =======================================================
updateMenuIcon();