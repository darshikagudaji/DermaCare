
// =======================================================
// DERMCARE - FORGOT PASSWORD JAVASCRIPT
// FILE: frontend/patient/js/forgot-password.js
// =======================================================

document.addEventListener("DOMContentLoaded", function () {

    // ===================================================
    // GET HTML ELEMENTS
    // ===================================================

    const forgotPasswordForm =
        document.getElementById("forgotPasswordForm");

    const emailInput =
        document.getElementById("email");

    const newPasswordInput =
        document.getElementById("newPassword");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const emailError =
        document.getElementById("emailError");

    const newPasswordError =
        document.getElementById("newPasswordError");

    const confirmPasswordError =
        document.getElementById("confirmPasswordError");

    const message =
        document.getElementById("message");

    const submitButton =
        document.getElementById("submitButton");


    // ===================================================
    // CHECK REQUIRED HTML ELEMENTS
    // ===================================================

    if (
        !forgotPasswordForm ||
        !emailInput ||
        !newPasswordInput ||
        !confirmPasswordInput ||
        !message ||
        !submitButton
    ) {

        console.error(
            "Forgot Password: Required HTML elements were not found."
        );

        return;

    }


    // ===================================================
    // DISPLAY FIELD ERROR
    // ===================================================

    function showFieldError(element, text) {

        if (element) {
            element.textContent = text;
        }

    }


    // ===================================================
    // CLEAR ALL ERRORS AND MESSAGES
    // ===================================================

    function clearErrors() {

        showFieldError(emailError, "");
        showFieldError(newPasswordError, "");
        showFieldError(confirmPasswordError, "");

        message.textContent = "";
        message.style.color = "";

    }


    // ===================================================
    // PASSWORD VISIBILITY TOGGLE
    // ===================================================

    document.querySelectorAll(".password-toggle").forEach(
        function (toggleButton) {

            toggleButton.addEventListener("click", function () {

                const targetId =
                    this.getAttribute("data-target");

                const passwordField =
                    document.getElementById(targetId);

                if (!passwordField) {
                    return;
                }

                const eyeIcon =
                    this.querySelector("i");

                if (passwordField.type === "password") {

                    passwordField.type = "text";

                    if (eyeIcon) {
                        eyeIcon.classList.remove("bi-eye");
                        eyeIcon.classList.add("bi-eye-slash");
                    }

                } else {

                    passwordField.type = "password";

                    if (eyeIcon) {
                        eyeIcon.classList.remove("bi-eye-slash");
                        eyeIcon.classList.add("bi-eye");
                    }

                }

            });

        }
    );


    // ===================================================
    // CLEAR FIELD ERRORS WHEN USER TYPES
    // ===================================================

    emailInput.addEventListener("input", function () {
        showFieldError(emailError, "");
    });

    newPasswordInput.addEventListener("input", function () {
        showFieldError(newPasswordError, "");
    });

    confirmPasswordInput.addEventListener("input", function () {
        showFieldError(confirmPasswordError, "");
    });


    // ===================================================
    // RESET PASSWORD FORM SUBMISSION
    // ===================================================

    forgotPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        clearErrors();


        // ===================================================
        // GET FORM VALUES
        // ===================================================

        const email =
            emailInput.value.trim().toLowerCase();

        const newPassword =
            newPasswordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // ===================================================
        // VALIDATE EMAIL
        // ===================================================

        if (!email) {

            showFieldError(
                emailError,
                "Please enter your registered email address."
            );

            emailInput.focus();

            return;

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            showFieldError(
                emailError,
                "Please enter a valid email address."
            );

            emailInput.focus();

            return;

        }


        // ===================================================
        // VALIDATE NEW PASSWORD
        // ===================================================

        if (!newPassword) {

            showFieldError(
                newPasswordError,
                "Please enter your new password."
            );

            newPasswordInput.focus();

            return;

        }


        if (newPassword.length < 8) {

            showFieldError(
                newPasswordError,
                "Password must be at least 8 characters."
            );

            newPasswordInput.focus();

            return;

        }


        // ===================================================
        // VALIDATE CONFIRM PASSWORD
        // ===================================================

        if (!confirmPassword) {

            showFieldError(
                confirmPasswordError,
                "Please confirm your new password."
            );

            confirmPasswordInput.focus();

            return;

        }


        if (newPassword !== confirmPassword) {

            showFieldError(
                confirmPasswordError,
                "Passwords do not match."
            );

            confirmPasswordInput.focus();

            return;

        }


        // ===================================================
        // PREVENT MULTIPLE SUBMISSIONS
        // ===================================================

        submitButton.disabled = true;

        const originalButtonText =
            submitButton.textContent;

        submitButton.textContent = "Resetting Password...";


        // ===================================================
        // SEND REQUEST TO BACKEND
        // ===================================================

        try {

            const response = await fetch(
                "http://localhost:5000/api/patients/forgot-password",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        email: email,

                        newPassword: newPassword,

                        confirmPassword: confirmPassword

                    })

                }
            );


            // ===================================================
            // READ BACKEND RESPONSE
            // ===================================================

            const data = await response.json();


            // ===================================================
            // HANDLE BACKEND VALIDATION ERRORS
            // ===================================================

            if (!response.ok) {

                if (data.field === "email") {

                    showFieldError(
                        emailError,
                        data.message || "Email was not found."
                    );

                } else if (data.field === "newPassword") {

                    showFieldError(
                        newPasswordError,
                        data.message || "Please check your new password."
                    );

                } else if (data.field === "confirmPassword") {

                    showFieldError(
                        confirmPasswordError,
                        data.message || "Passwords do not match."
                    );

                } else {

                    message.textContent =
                        data.message || "Unable to reset password.";

                    message.style.color = "#dc2626";

                }

                return;

            }


            // ===================================================
            // PASSWORD RESET SUCCESSFUL
            // ===================================================

            message.textContent =
                data.message ||
                "Password updated successfully. You can now log in.";

            message.style.color = "#15803d";

            forgotPasswordForm.reset();


        } catch (error) {

            // ===================================================
            // CONNECTION ERROR
            // ===================================================

            console.error(
                "Forgot Password request error:",
                error
            );

            message.textContent =
                "Unable to connect to the server. Please check that the DermCare backend is running.";

            message.style.color = "#dc2626";

        } finally {

            // ===================================================
            // RESTORE SUBMIT BUTTON
            // ===================================================

            submitButton.disabled = false;

            submitButton.textContent =
                originalButtonText;

        }

    });

});
