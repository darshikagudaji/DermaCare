// =======================================================
// DERMCARE - PATIENT REGISTRATION JAVASCRIPT
// =======================================================

// =======================================================
// GET FORM
// =======================================================
const registerForm =
    document.getElementById("registerForm");

// =======================================================
// GET ALL FORM FIELDS
// =======================================================
const fullName =
    document.getElementById("fullName");

const email =
    document.getElementById("email");

const mobile =
    document.getElementById("mobile");

const password =
    document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

const dateOfBirth =
    document.getElementById("dateOfBirth");

const bloodGroup =
    document.getElementById("bloodGroup");

const address =
    document.getElementById("address");

// =======================================================
// GET ERROR ELEMENTS
// =======================================================
const fullNameError =
    document.getElementById("fullNameError");

const emailError =
    document.getElementById("emailError");

const mobileError =
    document.getElementById("mobileError");

const passwordError =
    document.getElementById("passwordError");

const confirmPasswordError =
    document.getElementById("confirmPasswordError");

const genderError =
    document.getElementById("genderError");

const dateOfBirthError =
    document.getElementById("dateOfBirthError");

const bloodGroupError =
    document.getElementById("bloodGroupError");

const addressError =
    document.getElementById("addressError");

// =======================================================
// GET NOTIFICATION ELEMENTS
// =======================================================
const notification =
    document.getElementById("notification");

const notificationIcon =
    document.getElementById("notificationIcon");

const notificationMessage =
    document.getElementById("notificationMessage");

// =======================================================
// NOTIFICATION TIMER
// =======================================================
let notificationTimer;

// =======================================================
// DISABLE BROWSER DEFAULT VALIDATION
// =======================================================
if (registerForm) {
    registerForm.noValidate = true;
}

// =======================================================
// SHOW NOTIFICATION
// =======================================================
function showNotification(message, type) {

    if (!notification || !notificationMessage) {
        return;
    }

    clearTimeout(notificationTimer);

    notificationMessage.textContent = message;

    if (notificationIcon) {

        if (type === "success") {

            notificationIcon.innerHTML =
                '<i class="bi bi-check-circle-fill"></i>';

        } else {

            notificationIcon.innerHTML =
                '<i class="bi bi-exclamation-circle-fill"></i>';
        }
    }

    notification.className =
        "notification " + type;

    notification.classList.add("show");

    notificationTimer =
        setTimeout(function () {

            notification.classList.remove("show");

        }, 4000);
}

// =======================================================
// CLEAR ALL FIELD ERRORS
// =======================================================
function clearErrors() {

    if (fullNameError) {
        fullNameError.textContent = "";
    }

    if (emailError) {
        emailError.textContent = "";
    }

    if (mobileError) {
        mobileError.textContent = "";
    }

    if (passwordError) {
        passwordError.textContent = "";
    }

    if (confirmPasswordError) {
        confirmPasswordError.textContent = "";
    }

    if (genderError) {
        genderError.textContent = "";
    }

    if (dateOfBirthError) {
        dateOfBirthError.textContent = "";
    }

    if (bloodGroupError) {
        bloodGroupError.textContent = "";
    }

    if (addressError) {
        addressError.textContent = "";
    }

    if (fullName) {
        fullName.classList.remove("input-error");
    }

    if (email) {
        email.classList.remove("input-error");
    }

    if (mobile) {
        mobile.classList.remove("input-error");
    }

    if (password) {
        password.classList.remove("input-error");
    }

    if (confirmPassword) {
        confirmPassword.classList.remove("input-error");
    }

    if (dateOfBirth) {
        dateOfBirth.classList.remove("input-error");
    }

    if (bloodGroup) {
        bloodGroup.classList.remove("input-error");
    }

    if (address) {
        address.classList.remove("input-error");
    }
}

// =======================================================
// SHOW FIELD ERROR
// =======================================================
function showError(
    field,
    errorElement,
    message
) {

    if (errorElement) {
        errorElement.textContent = message;
    }

    if (field) {
        field.classList.add("input-error");
    }
}

// =======================================================
// EMAIL VALIDATION
// =======================================================
function isValidEmail(emailValue) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(emailValue);
}

// =======================================================
// PHONE VALIDATION
// =======================================================
function isValidPhone(phoneValue) {

    const phonePattern =
        /^[0-9]{10}$/;

    return phonePattern.test(phoneValue);
}

// =======================================================
// PASSWORD SHOW / HIDE
// =======================================================
function setupPasswordToggle(
    inputId,
    buttonId
) {

    const input =
        document.getElementById(inputId);

    const button =
        document.getElementById(buttonId);

    if (!input || !button) {
        return;
    }

    const icon =
        button.querySelector("i");

    // ===================================================
    // INITIAL EYE STATE
    // ===================================================
    if (input.value.length > 0) {

        button.style.display = "flex";

    } else {

        button.style.display = "none";
    }

    // ===================================================
    // SHOW EYE WHEN USER TYPES
    // ===================================================
    input.addEventListener(
        "input",
        function () {

            if (input.value.length > 0) {

                button.style.display = "flex";

            } else {

                button.style.display = "none";

                input.type = "password";

                if (icon) {
                    icon.className =
                        "bi bi-eye";
                }

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }
        }
    );

    // ===================================================
    // SHOW / HIDE PASSWORD
    // ===================================================
    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            if (input.type === "password") {

                input.type = "text";

                if (icon) {
                    icon.className =
                        "bi bi-eye-slash";
                }

                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type = "password";

                if (icon) {
                    icon.className =
                        "bi bi-eye";
                }

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

            input.focus();
        }
    );
}

// =======================================================
// SETUP PASSWORD EYE BUTTONS
// =======================================================
setupPasswordToggle(
    "password",
    "passwordEye"
);

setupPasswordToggle(
    "confirmPassword",
    "confirmPasswordEye"
);

// =======================================================
// MOBILE HAMBURGER MENU
// =======================================================
const menuToggle =
    document.getElementById("menuToggle");

const mobileSidebar =
    document.getElementById("mobileSidebar");

const mobileOverlay =
    document.getElementById("mobileOverlay");

// =======================================================
// CLOSE MOBILE MENU
// =======================================================
function closeMobileMenu() {

    if (mobileSidebar) {
        mobileSidebar.classList.remove("active");
    }

    if (mobileOverlay) {
        mobileOverlay.classList.remove("active");
    }

    if (menuToggle) {

        const icon =
            menuToggle.querySelector("i");

        if (icon) {

            icon.classList.remove("bi-x-lg");
            icon.classList.add("bi-list");
        }

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
// HAMBURGER CLICK
// =======================================================
if (menuToggle && mobileSidebar) {

    menuToggle.addEventListener(
        "click",
        function () {

            const isOpen =
                mobileSidebar.classList.toggle("active");

            if (mobileOverlay) {

                mobileOverlay.classList.toggle(
                    "active",
                    isOpen
                );
            }

            const icon =
                menuToggle.querySelector("i");

            // =================================================
            // MENU OPEN - SHOW X
            // =================================================
            if (isOpen) {

                if (icon) {

                    icon.classList.remove("bi-list");
                    icon.classList.add("bi-x-lg");
                }

                menuToggle.setAttribute(
                    "aria-label",
                    "Close menu"
                );

                menuToggle.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

            // =================================================
            // MENU CLOSED - SHOW HAMBURGER
            // =================================================
            else {

                closeMobileMenu();
            }
        }
    );
}

// =======================================================
// CLOSE MENU WHEN OVERLAY IS CLICKED
// =======================================================
if (mobileOverlay) {

    mobileOverlay.addEventListener(
        "click",
        closeMobileMenu
    );
}

// =======================================================
// CLOSE MENU WHEN NAVIGATION LINK IS CLICKED
// =======================================================
if (mobileSidebar) {

    const mobileLinks =
        mobileSidebar.querySelectorAll(".mobile-nav a");

    mobileLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                closeMobileMenu
            );
        }
    );
}

// =======================================================
// CLOSE MENU WITH ESCAPE KEY
// =======================================================
document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {
            closeMobileMenu();
        }
    }
);

// =======================================================
// CLOSE MENU WHEN RETURNING TO DESKTOP
// =======================================================
window.addEventListener(
    "resize",
    function () {

        if (window.innerWidth > 1024) {
            closeMobileMenu();
        }
    }
);

// =======================================================
// REGISTRATION FORM
// =======================================================
if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            // ===================================================
            // CLEAR PREVIOUS ERRORS
            // ===================================================
            clearErrors();

            // ===================================================
            // GET FORM VALUES
            // ===================================================
            const fullNameValue =
                fullName.value.trim();

            const emailValue =
                email.value.trim().toLowerCase();

            const mobileValue =
                mobile.value.trim();

            const passwordValue =
                password.value;

            const confirmPasswordValue =
                confirmPassword.value;

            const dateOfBirthValue =
                dateOfBirth.value;

            const bloodGroupValue =
                bloodGroup.value;

            const addressValue =
                address.value.trim();

            // ===================================================
            // GET GENDER
            // ===================================================
            const genderElement =
                document.querySelector(
                    'input[name="gender"]:checked'
                );

            const genderValue =
                genderElement
                    ? genderElement.value
                    : "";

            // ===================================================
            // ERROR FLAG
            // ===================================================
            let hasErrors = false;

            // ===================================================
            // FULL NAME
            // ===================================================
            if (!fullNameValue) {

                showError(
                    fullName,
                    fullNameError,
                    "Please enter your full name"
                );

                hasErrors = true;

            } else if (fullNameValue.length < 3) {

                showError(
                    fullName,
                    fullNameError,
                    "Full name must contain at least 3 characters"
                );

                hasErrors = true;
            }

            // ===================================================
            // EMAIL
            // ===================================================
            if (!emailValue) {

                showError(
                    email,
                    emailError,
                    "Please enter your email"
                );

                hasErrors = true;

            } else if (!isValidEmail(emailValue)) {

                showError(
                    email,
                    emailError,
                    "Please enter a valid email address"
                );

                hasErrors = true;
            }

            // ===================================================
            // PHONE
            // ===================================================
            if (!mobileValue) {

                showError(
                    mobile,
                    mobileError,
                    "Please enter your phone number"
                );

                hasErrors = true;

            } else if (!isValidPhone(mobileValue)) {

                showError(
                    mobile,
                    mobileError,
                    "Please enter a valid 10-digit phone number"
                );

                hasErrors = true;
            }

            // ===================================================
            // PASSWORD
            // ===================================================
            if (!passwordValue) {

                showError(
                    password,
                    passwordError,
                    "Please enter a password"
                );

                hasErrors = true;

            } else if (passwordValue.length < 6) {

                showError(
                    password,
                    passwordError,
                    "Password must be at least 6 characters"
                );

                hasErrors = true;
            }

            // ===================================================
            // CONFIRM PASSWORD
            // ===================================================
            if (
                passwordValue &&
                confirmPasswordValue &&
                passwordValue !== confirmPasswordValue
            ) {

                showError(
                    confirmPassword,
                    confirmPasswordError,
                    "Passwords do not match"
                );

                hasErrors = true;
            }

            // ===================================================
            // GENDER
            // ===================================================
            if (!genderValue) {

                if (genderError) {

                    genderError.textContent =
                        "Please select your gender";
                }

                hasErrors = true;
            }

            // ===================================================
            // DATE OF BIRTH
            // ===================================================
            if (!dateOfBirthValue) {

                showError(
                    dateOfBirth,
                    dateOfBirthError,
                    "Please select your date of birth"
                );

                hasErrors = true;
            }

            // ===================================================
            // BLOOD GROUP
            // ===================================================
            if (!bloodGroupValue) {

                showError(
                    bloodGroup,
                    bloodGroupError,
                    "Please select your blood group"
                );

                hasErrors = true;
            }

            // ===================================================
            // ADDRESS
            // ===================================================
            if (!addressValue) {

                showError(
                    address,
                    addressError,
                    "Please enter your address"
                );

                hasErrors = true;
            }

            // ===================================================
            // STOP IF VALIDATION FAILED
            // ===================================================
            if (hasErrors) {
                return;
            }

            // ===================================================
            // CREATE PATIENT DATA
            // ===================================================
            const patientData = {

                fullName:
                    fullNameValue,

                email:
                    emailValue,

                password:
                    passwordValue,

                mobileNo:
                    mobileValue,

                dateOfBirth:
                    dateOfBirthValue,

                gender:
                    genderValue,

                bloodGroup:
                    bloodGroupValue,

                address:
                    addressValue
            };

            // ===================================================
            // GET REGISTER BUTTON
            // ===================================================
            const submitButton =
                registerForm.querySelector(
                    'button[type="submit"]'
                );

            const originalButtonText =
                submitButton
                    ? submitButton.textContent.trim()
                    : "Create Account";

            // ===================================================
            // DISABLE BUTTON
            // ===================================================
            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Creating Account...";
            }

            // ===================================================
            // SEND DATA TO BACKEND
            // ===================================================
            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/patients/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    patientData
                                )
                        }
                    );

                // =================================================
                // READ BACKEND RESPONSE
                // =================================================
                const result =
                    await response.json();

                console.log(
                    "Registration response:",
                    result
                );

                // =================================================
                // BACKEND ERROR
                // =================================================
                if (!response.ok) {

                    if (
                        result.message &&
                        result.message
                            .toLowerCase()
                            .includes(
                                "email already registered"
                            )
                    ) {

                        showError(
                            email,
                            emailError,
                            "Email already registered"
                        );

                    } else {

                        showNotification(
                            result.message ||
                            "Registration failed",
                            "error"
                        );
                    }

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            originalButtonText;
                    }

                    return;
                }

                // =================================================
                // GET PATIENT ID
                // =================================================
                const patientId =
                    result.patient &&
                    result.patient.id
                        ? result.patient.id.toString()
                        : null;

                console.log(
                    "Registered Patient ID:",
                    patientId
                );

                // =================================================
                // CHECK PATIENT ID
                // =================================================
                if (!patientId) {

                    console.error(
                        "Patient ID was not returned by backend:",
                        result
                    );

                    showNotification(
                        "Registration successful, but patient ID was not returned.",
                        "error"
                    );

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            originalButtonText;
                    }

                    return;
                }

                // =================================================
                // CREATE PATIENT OBJECT
                // =================================================
                const patient = {

                    id:
                        patientId,

                    fullName:
                        result.patient.fullName ||
                        fullNameValue,

                    email:
                        result.patient.email ||
                        emailValue,

                    mobileNo:
                        result.patient.mobileNo ||
                        mobileValue,

                    dateOfBirth:
                        result.patient.dateOfBirth ||
                        dateOfBirthValue,

                    gender:
                        result.patient.gender ||
                        genderValue,

                    bloodGroup:
                        result.patient.bloodGroup ||
                        bloodGroupValue,

                    address:
                        result.patient.address ||
                        addressValue
                };

                console.log(
                    "Patient object:",
                    patient
                );

                // =================================================
                // SAVE PATIENT OBJECT
                // =================================================
                localStorage.setItem(
                    "patient",
                    JSON.stringify(patient)
                );

                // =================================================
                // SAVE PATIENT ID
                // =================================================
                localStorage.setItem(
                    "patientId",
                    patientId
                );

                // =================================================
                // SAVE PATIENT EMAIL
                // =================================================
                localStorage.setItem(
                    "patientEmail",
                    patient.email
                );

                // =================================================
                // SAVE PATIENT NAME
                // =================================================
                localStorage.setItem(
                    "patientName",
                    patient.fullName
                );

                // =================================================
                // SAVE LOGIN STATE
                // =================================================
                localStorage.setItem(
                    "patientLoggedIn",
                    "true"
                );

                // =================================================
                // SAVE COMPLETE PATIENT DATA
                // =================================================
                localStorage.setItem(
                    "patientData",
                    JSON.stringify(patient)
                );

                // =================================================
                // REGISTRATION SUCCESS
                // =================================================
                showNotification(
                    "Patient registered successfully",
                    "success"
                );

                // =================================================
                // REDIRECT TO PATIENT DASHBOARD
                // =================================================
                setTimeout(
                    function () {

                        window.location.href =
                            "patient/dashboard.html";

                    },
                    1200
                );
            }

            // ===================================================
            // SERVER / NETWORK ERROR
            // ===================================================
            catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );

                showNotification(
                    "Unable to connect to the server",
                    "error"
                );

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText;
                }
            }
        }
    );
}