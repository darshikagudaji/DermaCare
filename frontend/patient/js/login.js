// =======================================================
// DERMCARE - PATIENT LOGIN JAVASCRIPT
// =======================================================


// =======================================================
// GET LOGIN FORM
// =======================================================

const loginForm =
    document.getElementById("loginForm");


// =======================================================
// GET LOGIN FIELDS
// =======================================================

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");


// =======================================================
// GET ERROR ELEMENTS
// =======================================================

const loginEmailError =
    document.getElementById("loginEmailError");

const loginPasswordError =
    document.getElementById("loginPasswordError");


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
// REMOVE BROWSER DEFAULT VALIDATION
// =======================================================

if (loginForm) {
    loginForm.noValidate = true;
}


// =======================================================
// NOTIFICATION TIMER
// =======================================================

let notificationTimer;


// =======================================================
// SHOW NOTIFICATION
// =======================================================

function showNotification(message, type) {

    if (
        !notification ||
        !notificationIcon ||
        !notificationMessage
    ) {
        return;
    }

    clearTimeout(notificationTimer);

    notificationMessage.textContent =
        message;


    // ===================================================
    // SUCCESS ICON
    // ===================================================

    if (type === "success") {

        notificationIcon.innerHTML =
            '<i class="bi bi-check-circle-fill"></i>';

    }


    // ===================================================
    // ERROR ICON
    // ===================================================

    else {

        notificationIcon.innerHTML =
            '<i class="bi bi-exclamation-circle-fill"></i>';

    }


    // ===================================================
    // SET NOTIFICATION TYPE
    // ===================================================

    notification.className =
        "notification " + type;


    // ===================================================
    // SHOW NOTIFICATION
    // ===================================================

    notification.classList.add("show");


    // ===================================================
    // HIDE AFTER 4 SECONDS
    // ===================================================

    notificationTimer =
        setTimeout(function () {

            notification.classList.remove("show");

        }, 4000);
}


// =======================================================
// HIDE NOTIFICATION
// =======================================================

function hideNotification() {

    if (!notification) {
        return;
    }

    clearTimeout(notificationTimer);

    notification.classList.remove("show");
}


// =======================================================
// CLEAR FIELD ERRORS
// =======================================================

function clearErrors() {

    if (loginEmailError) {
        loginEmailError.textContent = "";
    }

    if (loginPasswordError) {
        loginPasswordError.textContent = "";
    }

    if (loginEmail) {
        loginEmail.classList.remove("input-error");
    }

    if (loginPassword) {
        loginPassword.classList.remove("input-error");
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
        errorElement.textContent =
            message;
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
// PASSWORD SHOW / HIDE
// =======================================================

const passwordEye =
    document.getElementById(
        "loginPasswordEye"
    );


if (passwordEye && loginPassword) {

    passwordEye.addEventListener(
        "click",
        function () {

            const icon =
                passwordEye.querySelector("i");


            // =============================================
            // SHOW PASSWORD
            // =============================================

            if (
                loginPassword.type ===
                "password"
            ) {

                loginPassword.type =
                    "text";

                if (icon) {

                    icon.classList.remove(
                        "bi-eye"
                    );

                    icon.classList.add(
                        "bi-eye-slash"
                    );
                }

                passwordEye.setAttribute(
                    "aria-label",
                    "Hide password"
                );
            }


            // =============================================
            // HIDE PASSWORD
            // =============================================

            else {

                loginPassword.type =
                    "password";

                if (icon) {

                    icon.classList.remove(
                        "bi-eye-slash"
                    );

                    icon.classList.add(
                        "bi-eye"
                    );
                }

                passwordEye.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }
        }
    );
}


// =======================================================
// MOBILE HAMBURGER / SIDEBAR
// SAME AS APPOINTMENT HISTORY
// =======================================================

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");


// =======================================================
// UPDATE HAMBURGER / X ICON
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


    // ===================================================
    // SIDEBAR OPEN = X ICON
    // ===================================================

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
    }


    // ===================================================
    // SIDEBAR CLOSED = HAMBURGER ICON
    // ===================================================

    else {

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
// OPEN / CLOSE MOBILE SIDEBAR
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


            // =============================================
            // CHANGE HAMBURGER TO X / X TO HAMBURGER
            // =============================================

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


    // ===================================================
    // CHANGE X BACK TO HAMBURGER
    // ===================================================

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
// CLOSE WHEN CLICKING MOBILE NAVIGATION LINK
// =======================================================

if (sidebar) {

    sidebar
        .querySelectorAll("a")
        .forEach(function (link) {

            link.addEventListener(
                "click",
                closeMobileMenu
            );
        });
}


// =======================================================
// CLOSE WITH ESCAPE KEY
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
// CLOSE WHEN RETURNING TO DESKTOP
// =======================================================

window.addEventListener(
    "resize",
    function () {

        if (window.innerWidth > 768) {

            closeMobileMenu();
        }
    }
);


// =======================================================
// LOGIN FORM SUBMIT
// =======================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =================================================
            // CLEAR OLD ERRORS
            // =================================================

            clearErrors();


            // =================================================
            // HIDE OLD NOTIFICATION
            // =================================================

            hideNotification();


            // =================================================
            // GET FORM VALUES
            // =================================================

            const emailValue =
                loginEmail.value.trim();

            const passwordValue =
                loginPassword.value;


            // =================================================
            // VALIDATION FLAG
            // =================================================

            let hasErrors = false;


            // =================================================
            // EMAIL VALIDATION
            // =================================================

            if (!emailValue) {

                showError(
                    loginEmail,
                    loginEmailError,
                    "Please enter your email."
                );

                hasErrors = true;
            }

            else if (
                !isValidEmail(emailValue)
            ) {

                showError(
                    loginEmail,
                    loginEmailError,
                    "Please enter a valid email address."
                );

                hasErrors = true;
            }


            // =================================================
            // PASSWORD VALIDATION
            // =================================================
            // Only check whether password is empty.
            // There is NO 8-character frontend restriction.
            // =================================================

            if (!passwordValue) {

                showError(
                    loginPassword,
                    loginPasswordError,
                    "Please enter your password."
                );

                hasErrors = true;
            }


            // =================================================
            // STOP IF FRONTEND VALIDATION FAILED
            // =================================================

            if (hasErrors) {
                return;
            }


            // =================================================
            // LOGIN DATA
            // =================================================

            const loginData = {

                email:
                    emailValue,

                password:
                    passwordValue
            };


            // =================================================
            // SEND LOGIN REQUEST
            // =================================================

            try {

                const response =
                    await fetch(
                        "https://dermacare-eeca.onrender.com/api/patients/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    loginData
                                )
                        }
                    );


                // =================================================
                // READ SERVER RESPONSE AS TEXT
                // =================================================

                const responseText =
                    await response.text();


                // =================================================
                // CHECK EMPTY RESPONSE
                // =================================================

                if (!responseText) {

                    console.error(
                        "Empty response from server."
                    );

                    showNotification(
                        "No response received from the server.",
                        "error"
                    );

                    return;
                }


                // =================================================
                // CONVERT RESPONSE TO JSON
                // =================================================

                let result;

                try {

                    result =
                        JSON.parse(
                            responseText
                        );

                }

                catch (jsonError) {

                    console.error(
                        "Server returned non-JSON response:",
                        responseText
                    );

                    console.error(
                        "HTTP Status:",
                        response.status
                    );

                    showNotification(
                        "Server returned an invalid response.",
                        "error"
                    );

                    return;
                }


                // =================================================
                // LOGIN SUCCESSFUL
                // =================================================

                if (response.ok) {

                    showNotification(
                        result.message ||
                        "Login successful.",
                        "success"
                    );


                    // =============================================
                    // SAVE PATIENT INFORMATION
                    // =============================================

                    if (result.patient) {

                        localStorage.setItem(
                            "patient",
                            JSON.stringify(
                                result.patient
                            )
                        );
                    }


                    // =============================================
                    // REDIRECT TO PATIENT DASHBOARD
                    // =============================================

                    setTimeout(
                        function () {

                            window.location.href =
                                "patient/dashboard.html";

                        },
                        1500
                    );

                    return;
                }


                // =================================================
                // EMAIL NOT REGISTERED
                // =================================================

                if (
                    result.field ===
                    "email"
                ) {

                    showError(
                        loginEmail,
                        loginEmailError,
                        result.message ||
                        "Email is not registered."
                    );

                    return;
                }


                // =================================================
                // INCORRECT PASSWORD
                // =================================================

                if (
                    result.field ===
                    "password"
                ) {

                    showError(
                        loginPassword,
                        loginPasswordError,
                        result.message ||
                        "Incorrect password."
                    );

                    return;
                }


                // =================================================
                // OTHER BACKEND ERROR
                // =================================================

                showNotification(
                    result.message ||
                    "Login failed.",
                    "error"
                );
            }


            // =================================================
            // CONNECTION / SERVER ERROR
            // =================================================

            catch (error) {

                console.error(
                    "Login Error:",
                    error
                );

                showNotification(
                    "Unable to connect to the server.",
                    "error"
                );
            }
        }
    );
}


// =======================================================
// INITIAL MENU ICON
// =======================================================

updateMenuIcon();