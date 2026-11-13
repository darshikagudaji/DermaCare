
/* =======================================================
   DERMCARE - RECEPTIONIST LOGIN
======================================================= */

const API_BASE_URL = "https://dermacare-eeca.onrender.com/api";

const loginForm = document.getElementById("receptionistLoginForm");
const emailInput = document.getElementById("receptionistEmail");
const passwordInput = document.getElementById("receptionistPassword");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const togglePassword = document.getElementById("passwordToggle");


// =======================================================
// SHOW MESSAGE
// =======================================================

function showMessage(type, message) {

    loginMessage.className = "login-message " + type + " show";

    loginMessage.textContent = message;

}


// =======================================================
// HIDE MESSAGE
// =======================================================

function hideMessage() {

    loginMessage.className = "login-message";

    loginMessage.textContent = "";

}


// =======================================================
// SHOW / HIDE PASSWORD
// =======================================================

togglePassword.addEventListener("click", function () {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    togglePassword.innerHTML = isPassword
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';

    togglePassword.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
    );

});


// =======================================================
// CLEAR MESSAGE WHEN INPUT CHANGES
// =======================================================

emailInput.addEventListener("input", hideMessage);

passwordInput.addEventListener("input", hideMessage);


// =======================================================
// RECEPTIONIST LOGIN
// =======================================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    // ===================================================
    // CHECK REQUIRED FIELDS
    // ===================================================

    if (!email || !password) {

        showMessage(
            "error",
            "Please enter your email and password."
        );

        return;

    }


    // ===================================================
    // DISABLE LOGIN BUTTON
    // ===================================================

    loginButton.disabled = true;

    loginButton.innerHTML =
        '<i class="bi bi-arrow-repeat"></i> Logging in...';


    try {

        // =================================================
        // SEND LOGIN REQUEST
        // =================================================

        const response = await fetch(
            `${API_BASE_URL}/receptionists/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );


        // =================================================
        // READ RESPONSE
        // =================================================

        const data =
            await response.json();


        // =================================================
        // CHECK LOGIN RESULT
        // =================================================

        if (!response.ok || !data.success) {

            showMessage(
                "error",
                data.message || "Login failed. Please try again."
            );

            return;

        }


        // =================================================
        // CHECK RECEPTIONIST INFORMATION
        // =================================================

        if (
            !data.receptionist ||
            !data.receptionist._id
        ) {

            showMessage(
                "error",
                "Login response is missing receptionist information."
            );

            return;

        }


        // =================================================
        // STORE RECEPTIONIST INFORMATION
        // =================================================
        // Do not store the password or password hash.
        // =================================================

        localStorage.setItem(
            "receptionistId",
            data.receptionist._id
        );

        localStorage.setItem(
            "receptionist",
            JSON.stringify(data.receptionist)
        );


        // =================================================
        // LOGIN SUCCESSFUL
        // =================================================

        showMessage(
            "success",
            "Login successful. Opening receptionist dashboard..."
        );


        // =================================================
        // REDIRECT TO RECEPTIONIST DASHBOARD
        // =================================================

        setTimeout(function () {

            window.location.href =
                "receptionist-dashboard.html";

        }, 700);


    }

    catch (error) {

        console.error(
            "Receptionist login error:",
            error
        );

        showMessage(
            "error",
            "Cannot connect to the server. Please make sure the DermCare backend is running."
        );

    }

    finally {

        loginButton.disabled = false;

        loginButton.innerHTML =
            '<i class="bi bi-box-arrow-in-right"></i> Login';

    }

});
