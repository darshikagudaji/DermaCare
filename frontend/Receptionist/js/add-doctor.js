
 // =======================================================
// DERMCARE - RECEPTIONIST ADD DOCTOR JAVASCRIPT
// =======================================================


// =======================================================
// PREVENT DUPLICATE INITIALIZATION
// =======================================================

if (window.dermCareAddDoctorInitialized) {

    console.warn("DermCare Add Doctor JavaScript is already initialized.");

} else {

    window.dermCareAddDoctorInitialized = true;


    // ===================================================
    // INITIALIZE PAGE
    // ===================================================

    function initializeAddDoctorPage() {

        // =================================================
        // MOBILE SIDEBAR / HAMBURGER MENU
        // =================================================

        const menuToggle = document.getElementById("menuToggle");
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("overlay");

        function updateMenuIcon() {

            if (!menuToggle) return;

            const icon = menuToggle.querySelector("i");

            if (!icon) return;

            if (sidebar && sidebar.classList.contains("mobile-open")) {

                icon.classList.remove("bi-list");
                icon.classList.add("bi-x-lg");

                menuToggle.setAttribute("aria-label", "Close menu");
                menuToggle.setAttribute("aria-expanded", "true");

            } else {

                icon.classList.remove("bi-x-lg");
                icon.classList.add("bi-list");

                menuToggle.setAttribute("aria-label", "Open menu");
                menuToggle.setAttribute("aria-expanded", "false");
            }
        }


        function closeMobileMenu() {

            if (sidebar) {
                sidebar.classList.remove("mobile-open");
            }

            if (overlay) {
                overlay.classList.remove("show");
            }

            updateMenuIcon();
        }


        if (menuToggle && sidebar) {

            menuToggle.addEventListener("click", function () {

                sidebar.classList.toggle("mobile-open");

                if (overlay) {
                    overlay.classList.toggle("show");
                }

                updateMenuIcon();
            });
        }


        if (overlay) {
            overlay.addEventListener("click", closeMobileMenu);
        }


        if (sidebar) {

            sidebar.querySelectorAll(".sidebar-menu a").forEach(
                function (link) {
                    link.addEventListener("click", closeMobileMenu);
                }
            );
        }


        document.addEventListener("keydown", function (event) {

            if (event.key === "Escape") {
                closeMobileMenu();
            }
        });


        window.addEventListener("resize", function () {

            if (window.innerWidth > 650) {
                closeMobileMenu();
            }
        });


        // =================================================
        // API URL
        // =================================================

        const API_URL = "http://localhost:5000/api/doctors/add";


        // =================================================
        // FORM
        // =================================================

        const addDoctorForm = document.getElementById("addDoctorForm");

        if (!addDoctorForm) {
            console.error("Add Doctor form not found.");
            return;
        }


        // =================================================
        // FORM FIELDS
        // =================================================

        const fullName = document.getElementById("fullName");
        const email = document.getElementById("email");
        const mobileNo = document.getElementById("mobileNo");
        const gender = document.getElementById("gender");
        const password = document.getElementById("password");
        const specialization = document.getElementById("specialization");
        const qualification = document.getElementById("qualification");
        const experience = document.getElementById("experience");
        const consultationFee = document.getElementById("consultationFee");

        const doctorImage = document.getElementById("doctorImage");
        const doctorImagePreview = document.getElementById("doctorImagePreview");
        const imagePlaceholder = document.getElementById("imagePlaceholder");
        const passwordToggle = document.getElementById("passwordToggle");


        // =================================================
        // SUCCESS TOAST ELEMENTS
        // =================================================

        const successMessage = document.getElementById("successMessage");
        const successMessageText = document.getElementById("successMessageText");

        let successToastTimer = null;


        // =================================================
        // HIDE SUCCESS TOAST
        // =================================================

        function hideSuccessMessage() {

            if (successToastTimer !== null) {
                clearTimeout(successToastTimer);
                successToastTimer = null;
            }

            if (!successMessage) return;

            successMessage.classList.remove("show");

            successMessage.style.display = "none";
            successMessage.style.visibility = "hidden";
            successMessage.style.opacity = "0";
        }


        // =================================================
        // SHOW SUCCESS TOAST
        // Compatible with CSS ::after progress bar
        // =================================================

        function showSuccessMessage(message) {

            if (!successMessage) {
                console.error("Success message element not found.");
                return;
            }

            // Clear any previous toast timer
            if (successToastTimer !== null) {
                clearTimeout(successToastTimer);
                successToastTimer = null;
            }

            // Set toast text without removing its HTML structure
            if (successMessageText) {
                successMessageText.textContent = message;
            }


            // ---------------------------------------------
            // Reset toast before showing it again
            // ---------------------------------------------

            successMessage.classList.remove("show");

            successMessage.style.display = "none";
            successMessage.style.visibility = "hidden";
            successMessage.style.opacity = "0";


            // ---------------------------------------------
            // Reset CSS progress animation
            // The CSS ::after bar runs for 4 seconds
            // ---------------------------------------------

            successMessage.style.setProperty("--toast-reset", "0");

            void successMessage.offsetWidth;


            // ---------------------------------------------
            // Show toast immediately
            // No slide-in animation
            // ---------------------------------------------

            successMessage.style.display = "flex";
            successMessage.style.visibility = "visible";
            successMessage.style.opacity = "1";

            successMessage.classList.add("show");


            // ---------------------------------------------
            // Hide toast after 4 seconds
            // ---------------------------------------------

            successToastTimer = setTimeout(function () {

                hideSuccessMessage();

            }, 4000);
        }


        // =================================================
        // SHOW SAVED SUCCESS MESSAGE AFTER PAGE LOAD
        // =================================================

        const savedSuccessMessage = sessionStorage.getItem(
            "dermCareDoctorAddedSuccess"
        );

        if (savedSuccessMessage) {

            sessionStorage.removeItem("dermCareDoctorAddedSuccess");

            setTimeout(function () {
                showSuccessMessage(savedSuccessMessage);
            }, 300);
        }


        // =================================================
        // FIELD ERROR ELEMENTS
        // =================================================

        const errors = {

            fullName: document.getElementById("fullNameError"),
            email: document.getElementById("emailError"),
            mobileNo: document.getElementById("mobileNoError"),
            gender: document.getElementById("genderError"),
            password: document.getElementById("passwordError"),
            specialization: document.getElementById("specializationError"),
            qualification: document.getElementById("qualificationError"),
            experience: document.getElementById("experienceError"),
            consultationFee: document.getElementById("consultationFeeError"),
            doctorImage: document.getElementById("doctorImageError"),
            workingDays: document.getElementById("workingDaysError")
        };


        // =================================================
        // CLEAR ONE FIELD ERROR
        // =================================================

        function clearError(errorElement) {

            if (errorElement) {
                errorElement.textContent = "";
            }
        }


        // =================================================
        // CLEAR ALL FIELD ERRORS
        // =================================================

        function clearAllErrors() {

            Object.values(errors).forEach(function (errorElement) {

                if (errorElement) {
                    errorElement.textContent = "";
                }
            });
        }


        // =================================================
        // PASSWORD SHOW / HIDE
        // =================================================

        if (passwordToggle && password) {

            passwordToggle.addEventListener("click", function () {

                const icon = passwordToggle.querySelector("i");

                if (password.type === "password") {

                    password.type = "text";

                    if (icon) {
                        icon.classList.remove("bi-eye");
                        icon.classList.add("bi-eye-slash");
                    }

                    passwordToggle.setAttribute("aria-label", "Hide password");

                } else {

                    password.type = "password";

                    if (icon) {
                        icon.classList.remove("bi-eye-slash");
                        icon.classList.add("bi-eye");
                    }

                    passwordToggle.setAttribute("aria-label", "Show password");
                }
            });
        }


        // =================================================
        // MOBILE NUMBER - ONLY NUMBERS
        // =================================================

        if (mobileNo) {

            mobileNo.addEventListener("input", function () {

                mobileNo.value = mobileNo.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

                clearError(errors.mobileNo);
            });
        }


        // =================================================
        // INPUT ERROR CLEARING
        // =================================================

        function addInputClearListener(input, errorElement) {

            if (!input) return;

            input.addEventListener("input", function () {
                clearError(errorElement);
            });
        }


        addInputClearListener(fullName, errors.fullName);
        addInputClearListener(email, errors.email);
        addInputClearListener(password, errors.password);
        addInputClearListener(specialization, errors.specialization);
        addInputClearListener(qualification, errors.qualification);
        addInputClearListener(experience, errors.experience);
        addInputClearListener(consultationFee, errors.consultationFee);


        // =================================================
        // GENDER ERROR CLEARING
        // =================================================

        if (gender) {

            gender.addEventListener("change", function () {
                clearError(errors.gender);
            });
        }


        // =================================================
        // IMAGE PREVIEW + VALIDATION
        // =================================================

        if (doctorImage) {

            doctorImage.addEventListener("change", function () {

                clearError(errors.doctorImage);

                const file = doctorImage.files[0];

                if (!file) {

                    if (doctorImagePreview) {
                        doctorImagePreview.src = "";
                        doctorImagePreview.style.display = "none";
                    }

                    if (imagePlaceholder) {
                        imagePlaceholder.style.display = "flex";
                    }

                    return;
                }


                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                if (!allowedTypes.includes(file.type)) {

                    if (errors.doctorImage) {
                        errors.doctorImage.textContent =
                            "Please select a JPG, JPEG, PNG or WEBP image.";
                    }

                    doctorImage.value = "";
                    return;
                }


                const maxSize = 5 * 1024 * 1024;

                if (file.size > maxSize) {

                    if (errors.doctorImage) {
                        errors.doctorImage.textContent =
                            "Image size must not exceed 5 MB.";
                    }

                    doctorImage.value = "";
                    return;
                }


                const reader = new FileReader();

                reader.onload = function (event) {

                    if (doctorImagePreview) {
                        doctorImagePreview.src = event.target.result;
                        doctorImagePreview.style.display = "block";
                    }

                    if (imagePlaceholder) {
                        imagePlaceholder.style.display = "none";
                    }
                };

                reader.readAsDataURL(file);
            });
        }


        // =================================================
        // WORKING DAYS
        // =================================================

        const workingDayCheckboxes = document.querySelectorAll(
            'input[name="workingDays"]'
        );

        workingDayCheckboxes.forEach(function (checkbox) {

            checkbox.addEventListener("change", function () {
                clearError(errors.workingDays);
            });
        });


        // =================================================
        // SCROLL TO FIRST FIELD ERROR
        // =================================================

        function scrollToFirstError() {

            const firstError = Array.from(
                addDoctorForm.querySelectorAll(".field-error")
            ).find(function (errorElement) {
                return errorElement.textContent.trim() !== "";
            });

            if (firstError) {

                firstError.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        }


        // =================================================
        // FORM SUBMIT
        // =================================================

        addDoctorForm.addEventListener("submit", async function (event) {

            event.preventDefault();
            event.stopPropagation();

            clearAllErrors();


            // =================================================
            // GET FORM VALUES
            // =================================================

            const fullNameValue = fullName.value.trim();
            const emailValue = email.value.trim();
            const mobileValue = mobileNo.value.trim();
            const genderValue = gender.value.trim();
            const passwordValue = password.value;
            const specializationValue = specialization.value.trim();
            const qualificationValue = qualification.value.trim();
            const experienceValue = experience.value.trim();
            const consultationFeeValue = consultationFee.value.trim();


            // =================================================
            // GET WORKING DAYS
            // =================================================

            const workingDays = Array.from(workingDayCheckboxes)
                .filter(function (checkbox) {
                    return checkbox.checked;
                })
                .map(function (checkbox) {
                    return checkbox.value;
                });


            // =================================================
            // VALIDATION
            // =================================================

            let isValid = true;


            if (!fullNameValue) {

                if (errors.fullName) {
                    errors.fullName.textContent =
                        "Please enter doctor's full name.";
                }

                isValid = false;
            }


            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailValue) {

                if (errors.email) {
                    errors.email.textContent = "Please enter doctor's email.";
                }

                isValid = false;

            } else if (!emailPattern.test(emailValue)) {

                if (errors.email) {
                    errors.email.textContent = "Please enter a valid email address.";
                }

                isValid = false;
            }


            const mobilePattern = /^[6-9]\d{9}$/;

            if (!mobileValue) {

                if (errors.mobileNo) {
                    errors.mobileNo.textContent = "Please enter mobile number.";
                }

                isValid = false;

            } else if (!mobilePattern.test(mobileValue)) {

                if (errors.mobileNo) {
                    errors.mobileNo.textContent =
                        "Please enter a valid 10-digit mobile number.";
                }

                isValid = false;
            }


            if (!genderValue) {

                if (errors.gender) {
                    errors.gender.textContent = "Please select gender.";
                }

                isValid = false;
            }


            if (!passwordValue) {

                if (errors.password) {
                    errors.password.textContent = "Please enter a password.";
                }

                isValid = false;

            } else if (passwordValue.length < 6) {

                if (errors.password) {
                    errors.password.textContent =
                        "Password must be at least 6 characters.";
                }

                isValid = false;
            }


            if (!specializationValue) {

                if (errors.specialization) {
                    errors.specialization.textContent =
                        "Please enter specialization.";
                }

                isValid = false;
            }


            if (!qualificationValue) {

                if (errors.qualification) {
                    errors.qualification.textContent =
                        "Please enter qualification.";
                }

                isValid = false;
            }


            if (!experienceValue) {

                if (errors.experience) {
                    errors.experience.textContent =
                        "Please enter experience.";
                }

                isValid = false;

            } else if (Number(experienceValue) < 0) {

                if (errors.experience) {
                    errors.experience.textContent =
                        "Experience cannot be negative.";
                }

                isValid = false;
            }


            if (!consultationFeeValue) {

                if (errors.consultationFee) {
                    errors.consultationFee.textContent =
                        "Please enter consultation fee.";
                }

                isValid = false;

            } else if (Number(consultationFeeValue) < 0) {

                if (errors.consultationFee) {
                    errors.consultationFee.textContent =
                        "Consultation fee cannot be negative.";
                }

                isValid = false;
            }


            if (workingDays.length === 0) {

                if (errors.workingDays) {
                    errors.workingDays.textContent =
                        "Please select at least one working day.";
                }

                isValid = false;
            }


            // =================================================
            // IMAGE VALIDATION
            // =================================================

            const imageFile = doctorImage && doctorImage.files.length > 0
                ? doctorImage.files[0]
                : null;


            if (imageFile) {

                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];

                if (!allowedTypes.includes(imageFile.type)) {

                    if (errors.doctorImage) {
                        errors.doctorImage.textContent =
                            "Please select a JPG, JPEG, PNG or WEBP image.";
                    }

                    isValid = false;
                }


                const maxSize = 5 * 1024 * 1024;

                if (imageFile.size > maxSize) {

                    if (errors.doctorImage) {
                        errors.doctorImage.textContent =
                            "Image size must not exceed 5 MB.";
                    }

                    isValid = false;
                }
            }


            // =================================================
            // STOP IF INVALID
            // =================================================

            if (!isValid) {
                scrollToFirstError();
                return;
            }


            // =================================================
            // SUBMIT BUTTON
            // =================================================

            const submitButton = addDoctorForm.querySelector(".submit-button");

            const originalButtonHTML = submitButton
                ? submitButton.innerHTML
                : "";


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.innerHTML = `
                    <i class="bi bi-hourglass-split"></i>
                    Adding Doctor...
                `;
            }


            // =================================================
            // CREATE FORM DATA
            // =================================================

            const formData = new FormData();

            formData.append("fullName", fullNameValue);
            formData.append("email", emailValue);
            formData.append("mobileNo", mobileValue);
            formData.append("gender", genderValue);
            formData.append("password", passwordValue);
            formData.append("specialization", specializationValue);
            formData.append("qualification", qualificationValue);
            formData.append("experience", experienceValue);
            formData.append("consultationFee", consultationFeeValue);


            // =================================================
            // ADD WORKING DAYS
            // =================================================

            workingDays.forEach(function (day) {
                formData.append("workingDays", day);
            });


            // =================================================
            // ADD IMAGE
            // =================================================

            if (imageFile) {
                formData.append("doctorImage", imageFile);
            }


            // =================================================
            // SEND DATA TO BACKEND
            // =================================================

            try {

                const response = await fetch(API_URL, {
                    method: "POST",
                    body: formData
                });


                const responseText = await response.text();

                let data = {};

                try {

                    data = responseText ? JSON.parse(responseText) : {};

                } catch (jsonError) {

                    console.error("Unable to read JSON response:", jsonError);
                    console.error("Server response:", responseText);
                }


                // =================================================
                // BACKEND ERROR
                // =================================================

                if (!response.ok) {
                    throw new Error(data.message || "Unable to add doctor.");
                }


                // =================================================
                // SUCCESS
                // =================================================

                console.log("Doctor added successfully:", data);


                // Save message for page reload scenarios
                sessionStorage.setItem(
                    "dermCareDoctorAddedSuccess",
                    "Doctor added successfully!"
                );


                // Reset form
                addDoctorForm.reset();


                // Reset image preview
                if (doctorImagePreview) {
                    doctorImagePreview.src = "";
                    doctorImagePreview.style.display = "none";
                }

                if (imagePlaceholder) {
                    imagePlaceholder.style.display = "flex";
                }


                // Clear field errors
                clearAllErrors();


                // Scroll to top
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });


                // Show toast
                showSuccessMessage("Doctor added successfully!");


            } catch (error) {

                console.error("Add Doctor Error:", error);

                const errorText = error.message ||
                    "Unable to add doctor. Please try again.";

                const lowerErrorText = errorText.toLowerCase();


                // Put backend errors below the relevant field
                if (lowerErrorText.includes("email")) {

                    if (errors.email) {
                        errors.email.textContent = errorText;
                    }

                } else if (lowerErrorText.includes("mobile")) {

                    if (errors.mobileNo) {
                        errors.mobileNo.textContent = errorText;
                    }

                } else if (lowerErrorText.includes("gender")) {

                    if (errors.gender) {
                        errors.gender.textContent = errorText;
                    }

                } else if (
                    lowerErrorText.includes("image") ||
                    lowerErrorText.includes("photo")
                ) {

                    if (errors.doctorImage) {
                        errors.doctorImage.textContent = errorText;
                    }

                } else {

                    if (errors.fullName) {
                        errors.fullName.textContent = errorText;
                    }
                }


                scrollToFirstError();


            } finally {

                // Restore submit button
                if (submitButton) {
                

                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonHTML;
                }
            }
        });
    }


    // =======================================================
    // START PAGE SAFELY
    // =======================================================

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeAddDoctorPage,
            { once: true }
        );

    } else {

        initializeAddDoctorPage();
    }
}