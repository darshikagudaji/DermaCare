// =======================================================
// DERMCARE - DOCTOR LOGIN JAVASCRIPT
// =======================================================


// =======================================================
// 1. GET DOCTOR LOGIN FORM
// =======================================================

const doctorLoginForm =
    document.getElementById(
        "doctorLoginForm"
    );


// =======================================================
// 2. GET LOGIN INPUTS
// =======================================================

const doctorEmail =
    document.getElementById(
        "doctorEmail"
    );


const doctorPassword =
    document.getElementById(
        "doctorPassword"
    );


const passwordToggle =
    document.getElementById(
        "passwordToggle"
    );


// =======================================================
// 3. GET LOGIN MESSAGE AREA
// =======================================================

const loginMessage =
    document.getElementById(
        "loginMessage"
    );


// =======================================================
// 4. GET / CREATE FIELD ERROR ELEMENT
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


    // ===================================================
    // CREATE ERROR ELEMENT IF IT DOES NOT EXIST
    // ===================================================

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
// 5. SHOW FIELD ERROR
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
// 6. CLEAR FIELD ERROR
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
// 7. CLEAR ALL LOGIN ERRORS
// =======================================================

function clearLoginErrors() {

    clearFieldError(
        doctorEmail
    );


    clearFieldError(
        doctorPassword
    );

}


// =======================================================
// 8. VALIDATE EMAIL
// =======================================================

function validateEmail() {

    const email =
        doctorEmail.value.trim();


    // ===================================================
    // EMPTY EMAIL
    // ===================================================

    if (!email) {

        showFieldError(

            doctorEmail,

            "Please enter your email address."

        );


        return false;

    }


    // ===================================================
    // EMAIL FORMAT
    // ===================================================

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            email
        )
    ) {

        showFieldError(

            doctorEmail,

            "Please enter a valid email address."

        );


        return false;

    }


    clearFieldError(
        doctorEmail
    );


    return true;

}


// =======================================================
// 9. VALIDATE PASSWORD
// =======================================================

function validatePassword() {

    const password =
        doctorPassword.value;


    // ===================================================
    // EMPTY PASSWORD
    // ===================================================

    if (!password) {

        showFieldError(

            doctorPassword,

            "Please enter your password."

        );


        return false;

    }


    clearFieldError(
        doctorPassword
    );


    return true;

}


// =======================================================
// 10. VALIDATE COMPLETE LOGIN FORM
// =======================================================

function validateLoginForm() {

    clearLoginErrors();


    const isEmailValid =
        validateEmail();


    const isPasswordValid =
        validatePassword();


    // ===================================================
    // FOCUS FIRST INVALID FIELD
    // ===================================================

    if (!isEmailValid) {

        doctorEmail.focus();

        return false;

    }


    if (!isPasswordValid) {

        doctorPassword.focus();

        return false;

    }


    return true;

}


// =======================================================
// 11. SHOW DOCTOR LOGIN SUCCESS TOAST
// =======================================================

function showSuccessToast(message) {


    // ===================================================
    // REMOVE OLD TOAST
    // ===================================================

    const oldToast =
        document.querySelector(
            ".doctor-success-toast"
        );


    if (oldToast) {

        oldToast.remove();

    }


    // ===================================================
    // CREATE MAIN TOAST
    // ===================================================

    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "doctor-success-toast";


    // ===================================================
    // TOAST INLINE STYLES
    // ===================================================

    toast.style.position =
        "fixed";


    toast.style.top =
        "34px";


    toast.style.left =
        "50%";


    toast.style.width =
        "700px";


    toast.style.maxWidth =
        "calc(100vw - 40px)";


    toast.style.minHeight =
        "86px";


    toast.style.padding =
        "18px 26px";


    toast.style.background =
        "linear-gradient(135deg, #2F67AF 0%, #2860A6 100%)";


    toast.style.border =
        "none";


    toast.style.borderRadius =
        "14px";


    toast.style.boxShadow =
        "0 12px 30px rgba(29, 53, 87, 0.22)";


    toast.style.display =
        "flex";


    toast.style.alignItems =
        "center";


    toast.style.justifyContent =
        "flex-start";


    toast.style.gap =
        "14px";


    toast.style.overflow =
        "hidden";


    toast.style.transform =
        "translateX(-50%)";


    toast.style.zIndex =
        "999999";


    toast.style.animation =
        "doctorToastSlideDown 0.35s ease";


    // ===================================================
    // WHITE CIRCULAR ICON BADGE
    // ===================================================

    const iconBadge =
        document.createElement(
            "div"
        );


    iconBadge.style.width =
        "30px";


    iconBadge.style.height =
        "30px";


    iconBadge.style.minWidth =
        "30px";


    iconBadge.style.borderRadius =
        "50%";


    iconBadge.style.background =
        "#F4F7FB";


    iconBadge.style.display =
        "flex";


    iconBadge.style.alignItems =
        "center";


    iconBadge.style.justifyContent =
        "center";


    // ===================================================
    // BLUE CHECKMARK
    // ===================================================

    const icon =
        document.createElement(
            "i"
        );


    icon.className =
        "bi bi-check-lg";


    icon.style.color =
        "#2F67AF";


    icon.style.fontSize =
        "18px";


    icon.style.fontWeight =
        "700";


    icon.style.lineHeight =
        "1";


    iconBadge.appendChild(
        icon
    );


    // ===================================================
    // MESSAGE TEXT
    // ===================================================

    const messageElement =
        document.createElement(
            "div"
        );


    messageElement.textContent =
        message;


    messageElement.style.color =
        "#FFFFFF";


    messageElement.style.fontSize =
        "17px";


    messageElement.style.fontWeight =
        "700";


    messageElement.style.lineHeight =
        "1.4";


    messageElement.style.flex =
        "1";


    // ===================================================
    // LIME GREEN PROGRESS BAR
    // ===================================================

    const progressBar =
        document.createElement(
            "div"
        );


    progressBar.className =
        "doctor-toast-progress";


    progressBar.style.position =
        "absolute";


    progressBar.style.left =
        "0";


    progressBar.style.bottom =
        "0";


    progressBar.style.width =
        "100%";


    progressBar.style.height =
        "5px";


    progressBar.style.background =
        "#A8D52D";


    progressBar.style.zIndex =
        "10";


    progressBar.style.transformOrigin =
        "left center";


    progressBar.style.transform =
        "scaleX(1)";


    // ===================================================
    // ADD ELEMENTS TO TOAST
    // ===================================================

    toast.appendChild(
        iconBadge
    );


    toast.appendChild(
        messageElement
    );


    toast.appendChild(
        progressBar
    );


    // ===================================================
    // ADD TO PAGE
    // ===================================================

    document.body.appendChild(
        toast
    );


    // ===================================================
    // START PROGRESS ANIMATION
    // ===================================================

    setTimeout(
        function () {

            progressBar.style.transition =
                "transform 5s linear";


            progressBar.style.transform =
                "scaleX(0)";

        },
        50
    );


    // ===================================================
    // AUTO REMOVE TOAST
    // ===================================================

    setTimeout(
        function () {

            toast.style.transition =
                "opacity 0.25s ease, transform 0.25s ease";


            toast.style.opacity =
                "0";


            toast.style.transform =
                "translate(-50%, -20px)";


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

        },
        5000
    );

}


// =======================================================
// 12. SHOW / HIDE PASSWORD
// =======================================================

if (
    passwordToggle &&
    doctorPassword
) {

    passwordToggle.addEventListener(

        "click",

        function () {


            // =================================================
            // SHOW PASSWORD
            // =================================================

            if (
                doctorPassword.type ===
                "password"
            ) {

                doctorPassword.type =
                    "text";


                passwordToggle.innerHTML =
                    '<i class="bi bi-eye-slash"></i>';


                passwordToggle.setAttribute(

                    "aria-label",

                    "Hide password"

                );

            }


            // =================================================
            // HIDE PASSWORD
            // =================================================

            else {

                doctorPassword.type =
                    "password";


                passwordToggle.innerHTML =
                    '<i class="bi bi-eye"></i>';


                passwordToggle.setAttribute(

                    "aria-label",

                    "Show password"

                );

            }

        }

    );

}


// =======================================================
// 13. DOCTOR LOGIN
// =======================================================

if (doctorLoginForm) {

    doctorLoginForm.addEventListener(

        "submit",

        async function (event) {


            // =================================================
            // PREVENT NORMAL FORM SUBMISSION
            // =================================================

            event.preventDefault();


            // =================================================
            // VALIDATE FORM
            // =================================================

            if (
                !validateLoginForm()
            ) {

                return;

            }


            // =================================================
            // GET FORM VALUES
            // =================================================

            const email =
                doctorEmail.value.trim();


            const password =
                doctorPassword.value;


            // =================================================
            // GET LOGIN BUTTON
            // =================================================

            const loginButton =
                doctorLoginForm.querySelector(
                    ".login-btn"
                );


            // =================================================
            // DISABLE BUTTON
            // =================================================

            if (loginButton) {

                loginButton.disabled =
                    true;


                loginButton.innerHTML =
                    '<i class="bi bi-arrow-repeat"></i> Logging in...';

            }


            try {


                // =============================================
                // SEND LOGIN REQUEST
                // =============================================

                const response =
                    await fetch(

                        "https://dermacare-eeca.onrender.com/api/doctors/login",

                        {

                            method:
                                "POST",


                            headers:

                                {

                                    "Content-Type":
                                        "application/json"

                                },


                            body:

                                JSON.stringify(

                                    {

                                        email:
                                            email,


                                        password:
                                            password

                                    }

                                )

                        }

                    );


                // =============================================
                // GET RESPONSE DATA
                // =============================================

                const data =
                    await response.json();


                console.log(
                    "Doctor login response:",
                    data
                );


                // =============================================
                // LOGIN FAILED
                // =============================================

                if (!response.ok) {

                    const message =
                        data.message ||
                        "Doctor login failed.";


                    // =========================================
                    // EMAIL ERROR
                    // =========================================

                    if (
                        data.field ===
                        "email"
                    ) {

                        showFieldError(

                            doctorEmail,

                            message

                        );


                        doctorEmail.focus();

                    }


                    // =========================================
                    // PASSWORD ERROR
                    // =========================================

                    else if (
                        data.field ===
                        "password"
                    ) {

                        showFieldError(

                            doctorPassword,

                            message

                        );


                        doctorPassword.focus();

                    }


                    // =========================================
                    // GENERAL ERROR
                    // =========================================

                    else {

                        showFieldError(

                            doctorPassword,

                            message

                        );


                        doctorPassword.focus();

                    }


                    // =========================================
                    // ENABLE LOGIN BUTTON
                    // =========================================

                    if (loginButton) {

                        loginButton.disabled =
                            false;


                        loginButton.innerHTML =
                            '<i class="bi bi-box-arrow-in-right"></i> Login';

                    }


                    return;

                }


                // =============================================
                // LOGIN SUCCESS
                // =============================================

                if (data.doctor) {


                    // =========================================
                    // SAVE DOCTOR DATA
                    // =========================================

                    localStorage.setItem(

                        "doctor",

                        JSON.stringify(
                            data.doctor
                        )

                    );


                    // =========================================
                    // SHOW SUCCESS TOAST
                    // =========================================

                    showSuccessToast(
                        "Doctor login successful."
                    );


                    // =========================================
                    // CHANGE BUTTON
                    // =========================================

                    if (loginButton) {

                        loginButton.disabled =
                            true;


                        loginButton.innerHTML =
                            '<i class="bi bi-check-circle"></i> Login Successful';

                    }


                    // =========================================
                    // REDIRECT TO DASHBOARD
                    // =========================================

                    setTimeout(

                        function () {

                            window.location.href =
                                "dashboard.html";

                        },

                        1500

                    );


                    return;

                }


                // =============================================
                // UNEXPECTED RESPONSE
                // =============================================

                showFieldError(

                    doctorPassword,

                    "Login failed. Doctor data was not received."

                );


                if (loginButton) {

                    loginButton.disabled =
                        false;


                    loginButton.innerHTML =
                        '<i class="bi bi-box-arrow-in-right"></i> Login';

                }

            }


            // =================================================
            // SERVER / CONNECTION ERROR
            // =================================================

            catch (error) {

                console.error(
                    "Doctor login error:",
                    error
                );


                showFieldError(

                    doctorPassword,

                    "Unable to connect to the server. Please try again."

                );


                if (loginButton) {

                    loginButton.disabled =
                        false;


                    loginButton.innerHTML =
                        '<i class="bi bi-box-arrow-in-right"></i> Login';

                }

            }

        }

    );

}


// =======================================================
// 14. EMAIL VALIDATION WHILE TYPING
// =======================================================

if (doctorEmail) {

    doctorEmail.addEventListener(

        "input",

        function () {

            clearFieldError(
                doctorEmail
            );

        }

    );


    doctorEmail.addEventListener(

        "blur",

        function () {

            if (
                doctorEmail.value.trim()
            ) {

                validateEmail();

            }

        }

    );

}


// =======================================================
// 15. PASSWORD VALIDATION WHILE TYPING
// =======================================================

if (doctorPassword) {

    doctorPassword.addEventListener(

        "input",

        function () {

            clearFieldError(
                doctorPassword
            );

        }

    );

}