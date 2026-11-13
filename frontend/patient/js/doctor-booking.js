
/* =======================================================
   DERMCARE - DOCTOR BOOKING JAVASCRIPT
   FILE: patient/js/doctor-booking.js
======================================================= */

// =======================================================
// BACKEND API - DOCTORS
// =======================================================

const API_URL = "https://dermacare-eeca.onrender.com/api/doctors";

// =======================================================
// BACKEND API - LEAVES
// =======================================================

const LEAVE_API_URL = "https://dermacare-eeca.onrender.com/api/leaves";

// =======================================================
// BACKEND API - DOCTOR SCHEDULE
// =======================================================

const DOCTOR_SCHEDULE_API_URL = "https://dermacare-eeca.onrender.com/api/doctor-schedule";

// =======================================================
// BACKEND API - APPOINTMENTS
// =======================================================

const APPOINTMENT_API_URL = "https://dermacare-eeca.onrender.com/api/appointments";

// =======================================================
// APPOINTMENT SLOT DURATION
// =======================================================

const SLOT_DURATION = 20;

// =======================================================
// GET URL PARAMETERS
// =======================================================

const urlParams = new URLSearchParams(window.location.search);

const doctorId =
    urlParams.get("doctorId") ||
    urlParams.get("doctor");

// =======================================================
// CHECK IF THIS IS RESCHEDULING
// =======================================================

const isReschedule = urlParams.get("reschedule") === "true";

// =======================================================
// GET EXISTING APPOINTMENT INFORMATION
// =======================================================

const rescheduleAppointmentId = urlParams.get("appointmentId");
const rescheduleDate = urlParams.get("date");
const rescheduleTime = urlParams.get("time");

// =======================================================
// FOLLOW-UP DATE FROM PRESCRIPTION
// =======================================================

const followUpDate = urlParams.get("followUpDate");

console.log("Follow-up Date from prescription:", followUpDate);

// =======================================================
// DEBUG URL PARAMETERS
// =======================================================

console.log("Doctor ID from URL:", doctorId);
console.log("Is Reschedule:", isReschedule);
console.log("Appointment ID:", rescheduleAppointmentId);
console.log("Previous Appointment Date:", rescheduleDate);
console.log("Previous Appointment Time:", rescheduleTime);

// =======================================================
// GET HTML ELEMENTS
// =======================================================

const doctorImage = document.getElementById("doctorImage");
const doctorName = document.getElementById("doctorName");
const doctorQualification = document.getElementById("doctorQualification");
const doctorSpecialization = document.getElementById("doctorSpecialization");
const doctorExperience = document.getElementById("doctorExperience");
const doctorFee = document.getElementById("doctorFee");
const doctorWorkingDays = document.getElementById("doctorWorkingDays");
const doctorAbout = document.getElementById("doctorAbout");
const dateButtons = document.getElementById("dateButtons");
const timeSlots = document.getElementById("timeSlots");
const bookAppointmentBtn = document.getElementById("bookAppointmentBtn");
const appointmentMessage = document.getElementById("appointmentMessage");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");
const logoutLink = document.getElementById("logoutLink");

// =======================================================
// PATIENT APPOINTMENT INFORMATION
// =======================================================

const reasonForVisit = document.getElementById("reasonForVisit");
const symptoms = document.getElementById("symptoms");
const allergies = document.getElementById("allergies");
const allergyDetails = document.getElementById("allergyDetails");
const allergyDetailsGroup = document.getElementById("allergyDetailsGroup");
const reasonForVisitError = document.getElementById("reasonForVisitError");
const symptomsError = document.getElementById("symptomsError");
const allergiesError = document.getElementById("allergiesError");
const allergyDetailsError = document.getElementById("allergyDetailsError");

// =======================================================
// SELECTED DATE AND TIME
// =======================================================

let selectedDate = null;
let selectedTime = null;

// =======================================================
// SELECTED DOCTOR
// =======================================================

let selectedDoctor = null;

// =======================================================
// DOCTOR LEAVE DATES
// =======================================================

let doctorLeaves = [];

// =======================================================
// DOCTOR WEEKLY SCHEDULE
// =======================================================

let doctorWeeklySchedule = null;

// =======================================================
// BOOKED APPOINTMENT TIMES
// =======================================================

let bookedTimes = [];

// =======================================================
// DAY NAME MAP
// =======================================================

const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

// =======================================================
// SHOW APPOINTMENT MESSAGE
// =======================================================

const showAppointmentMessage = (message, type = "success") => {
    if (!appointmentMessage) {
        console.error("Appointment message element was not found.");
        return;
    }

    appointmentMessage.classList.remove("success", "error", "info");
    appointmentMessage.classList.add(type);

    let iconClass = "bi-info-circle-fill";

    if (type === "success") {
        iconClass = "bi-check-circle-fill";
    } else if (type === "error") {
        iconClass = "bi-x-circle-fill";
    }

    appointmentMessage.innerHTML = `
        <i class="bi ${iconClass}"></i>
        <span>${message}</span>
    `;

    appointmentMessage.style.display = "flex";

    appointmentMessage.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

    setTimeout(() => {
        appointmentMessage.style.display = "none";
        appointmentMessage.innerHTML = "";
        appointmentMessage.classList.remove("success", "error", "info");
    }, 5000);
};

// =======================================================
// SHOW / HIDE ALLERGY DETAILS
// =======================================================

const updateAllergyDetailsVisibility = () => {
    if (!allergies || !allergyDetailsGroup) {
        return;
    }

    if (allergies.value === "Other") {
        allergyDetailsGroup.style.display = "block";
    } else {
        allergyDetailsGroup.style.display = "none";

        if (allergyDetails) {
            allergyDetails.value = "";
        }

        if (allergyDetailsError) {
            allergyDetailsError.textContent = "";
        }

        if (allergyDetails) {
            allergyDetails.classList.remove("input-error");
        }
    }
};

// =======================================================
// ALLERGY DROPDOWN CHANGE
// =======================================================

if (allergies) {
    allergies.addEventListener("change", updateAllergyDetailsVisibility);
    updateAllergyDetailsVisibility();
}

// =======================================================
// CLEAR FIELD ERROR
// =======================================================

const clearFieldError = (inputElement, errorElement) => {
    if (errorElement) {
        errorElement.textContent = "";
    }

    if (inputElement) {
        inputElement.classList.remove("input-error");
    }
};

// =======================================================
// VALIDATE PATIENT APPOINTMENT INFORMATION
// =======================================================

const validatePatientAppointmentInformation = () => {
    let isValid = true;

    clearFieldError(reasonForVisit, reasonForVisitError);
    clearFieldError(symptoms, symptomsError);
    clearFieldError(allergies, allergiesError);
    clearFieldError(allergyDetails, allergyDetailsError);

    const reason = reasonForVisit ? reasonForVisit.value.trim() : "";

    if (!reason) {
        if (reasonForVisitError) {
            reasonForVisitError.textContent =
                "Please enter the reason for your visit.";
        }

        if (reasonForVisit) {
            reasonForVisit.classList.add("input-error");
        }

        isValid = false;
    }

    const allergyValue = allergies ? allergies.value.trim() : "";

    if (!allergyValue) {
        if (allergiesError) {
            allergiesError.textContent =
                "Please select your allergy information.";
        }

        if (allergies) {
            allergies.classList.add("input-error");
        }

        isValid = false;
    }

    if (allergyValue === "Other") {
        const allergyDetailValue =
            allergyDetails ? allergyDetails.value.trim() : "";

        if (!allergyDetailValue) {
            if (allergyDetailsError) {
                allergyDetailsError.textContent =
                    "Please specify your allergy.";
            }

            if (allergyDetails) {
                allergyDetails.classList.add("input-error");
            }

            isValid = false;
        }
    }

    return isValid;
};

// =======================================================
// NORMALIZE TIME
// =======================================================

const normalizeTime = (time) => {
    if (!time) {
        return "";
    }

    let timeString = String(time).trim().toUpperCase();

    if (timeString.includes("AM") || timeString.includes("PM")) {
        const isPM = timeString.includes("PM");

        timeString = timeString
            .replace("AM", "")
            .replace("PM", "")
            .trim();

        const parts = timeString.split(":");
        let hours = Number(parts[0]);

        const minutes = String(Number(parts[1] || 0)).padStart(2, "0");

        if (isPM && hours !== 12) {
            hours += 12;
        }

        if (!isPM && hours === 12) {
            hours = 0;
        }

        return String(hours).padStart(2, "0") + ":" + minutes;
    }

    const parts = timeString.split(":");

    if (parts.length < 2) {
        return timeString;
    }

    const hours = String(Number(parts[0])).padStart(2, "0");
    const minutes = String(Number(parts[1])).padStart(2, "0");

    return hours + ":" + minutes;
};

// =======================================================
// LOAD DOCTOR
// =======================================================

const loadDoctor = async () => {
    if (!doctorId) {
        console.error("Doctor ID was not found in URL.");
        showDoctorError("Doctor information was not found.");
        return;
    }

    try {
        console.log("Loading doctor with ID:", doctorId);

        const response = await fetch(API_URL, {
            cache: "no-store"
        });

        const data = await response.json();

        console.log("Doctors API response:", data);

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch doctors.");
        }

        if (!Array.isArray(data.doctors)) {
            throw new Error("Invalid doctors data received.");
        }

        const doctor = data.doctors.find(item =>
            String(item._id || item.id || item.DoctorID) === String(doctorId)
        );

        if (!doctor) {
            console.error("Doctor not found with ID:", doctorId);
            showDoctorError("The selected doctor could not be found.");
            return;
        }

        selectedDoctor = doctor;

        console.log("Selected Doctor:", selectedDoctor);

        await loadDoctorLeaves();
        await loadDoctorWorkingHours();

        displayDoctor(doctor);
    } catch (error) {
        console.error("Error loading doctor:", error);
        showDoctorError("Unable to load doctor information. Please try again.");
    }
};

// =======================================================
// LOAD DOCTOR LEAVES
// =======================================================

const loadDoctorLeaves = async () => {
    try {
        const response = await fetch(`${LEAVE_API_URL}/doctor/${doctorId}`, {
            cache: "no-store"
        });

        const data = await response.json();

        if (!response.ok) {
            doctorLeaves = [];
            return;
        }

        doctorLeaves = Array.isArray(data.leaves) ? data.leaves : [];
    } catch (error) {
        console.error("Error loading doctor leaves:", error);
        doctorLeaves = [];
    }
};

// =======================================================
// LOAD DOCTOR WORKING HOURS
// =======================================================

const loadDoctorWorkingHours = async () => {
    try {
        const response = await fetch(`${DOCTOR_SCHEDULE_API_URL}/${doctorId}`, {
            cache: "no-store"
        });

        const data = await response.json();

        if (!response.ok) {
            doctorWeeklySchedule = null;
            return;
        }

        if (!data.doctorSchedule || !data.doctorSchedule.WeeklySchedule) {
            doctorWeeklySchedule = null;
            return;
        }

        doctorWeeklySchedule = data.doctorSchedule.WeeklySchedule;
    } catch (error) {
        console.error("Error loading doctor working hours:", error);
        doctorWeeklySchedule = null;
    }
};

// =======================================================
// LOAD BOOKED APPOINTMENT TIMES
// =======================================================

const loadBookedTimes = async () => {
    if (!doctorId || !selectedDate) {
        bookedTimes = [];
        return;
    }

    try {
        const requestURL =
            `${APPOINTMENT_API_URL}/doctor/${doctorId}/date/${selectedDate}?t=${Date.now()}`;

        const response = await fetch(requestURL, {
            cache: "no-store"
        });

        const data = await response.json();

        if (!response.ok) {
            bookedTimes = [];
            return;
        }

        bookedTimes = [];

        if (Array.isArray(data.bookedTimes)) {
            bookedTimes = data.bookedTimes
                .map(time => normalizeTime(time))
                .filter(Boolean);
        }

        if (Array.isArray(data.appointments)) {
            data.appointments.forEach(appointment => {
                if (
                    appointment.AppointmentType === "Online" &&
                    (
                        appointment.Status === "Booked" ||
                        appointment.Status === "Arrived"
                    )
                ) {
                    const normalizedTime =
                        normalizeTime(appointment.AppointmentTime);

                    if (
                        normalizedTime &&
                        !bookedTimes.includes(normalizedTime)
                    ) {
                        bookedTimes.push(normalizedTime);
                    }
                }
            });
        }

        bookedTimes = [...new Set(bookedTimes)];
    } catch (error) {
        console.error("Error loading booked times:", error);
        bookedTimes = [];
    }
};

// =======================================================
// CHECK DOCTOR LEAVE DATE
// =======================================================

const isDoctorOnLeave = (dateString) => {
    return doctorLeaves.some(leave => {
        if (!leave.leaveDate) {
            return false;
        }

        const leaveDate = String(leave.leaveDate).split("T")[0];

        return leaveDate === dateString;
    });
};

// =======================================================
// GET WORKING SCHEDULE FOR DAY
// =======================================================

const getWorkingHourForDay = (selectedDay) => {
    if (!doctorWeeklySchedule) {
        return null;
    }

    return doctorWeeklySchedule[selectedDay] || null;
};

// =======================================================
// CONVERT TIME TO MINUTES
// =======================================================

const convertTimeToMinutes = (time) => {
    const normalizedTime = normalizeTime(time);
    const parts = normalizedTime.split(":");

    if (parts.length !== 2) {
        return null;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
    }

    return hours * 60 + minutes;
};

// =======================================================
// CONVERT MINUTES TO TIME
// =======================================================

const convertMinutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0")
    );
};

// =======================================================
// GET APPOINTMENT SLOTS FOR DAY
//
// FIRST HALF  = ONLINE (PATIENT)
// SECOND HALF = WALK-IN (RECEPTIONIST)
// =======================================================

const getAppointmentSlotsForDay = (dayName, appointmentType = "Online") => {
    const daySchedule = getWorkingHourForDay(dayName);

    if (!daySchedule || !daySchedule.StartTime || !daySchedule.EndTime) {
        return [];
    }

    const startMinutes = convertTimeToMinutes(daySchedule.StartTime);
    const endMinutes = convertTimeToMinutes(daySchedule.EndTime);

    if (
        startMinutes === null ||
        endMinutes === null ||
        startMinutes >= endMinutes
    ) {
        return [];
    }

    const allSlots = [];

    for (
        let currentTime = startMinutes;
        currentTime + SLOT_DURATION <= endMinutes;
        currentTime += SLOT_DURATION
    ) {
        allSlots.push(convertMinutesToTime(currentTime));
    }

    const middleIndex = Math.ceil(allSlots.length / 2);

    const onlineSlots = allSlots.slice(0, middleIndex);
    const walkInSlots = allSlots.slice(middleIndex);

    if (appointmentType === "Online") {
        return onlineSlots;
    }

    if (appointmentType === "Walk-in") {
        return walkInSlots;
    }

    return [];
};

// =======================================================
// FORMAT TIME FOR PATIENT
// =======================================================

const formatTimeForPatient = (time) => {
    const normalizedTime = normalizeTime(time);
    const parts = normalizedTime.split(":");

    let hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        " " +
        period
    );
};

// =======================================================
// CHECK IF SELECTED DATE IS TODAY
// =======================================================

const isSelectedDateToday = () => {
    if (!selectedDate) {
        return false;
    }

    const today = new Date();

    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    return selectedDate === todayString;
};

// =======================================================
// CHECK IF TIME HAS PASSED
// =======================================================

const hasTimePassed = (time) => {
    if (!isSelectedDateToday()) {
        return false;
    }

    const slotMinutes = convertTimeToMinutes(time);
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return slotMinutes <= currentMinutes;
};

// =======================================================
// CHECK IF SLOT IS BOOKED
// =======================================================

const isSlotBooked = (slotTime) => {
    const normalizedSlotTime = normalizeTime(slotTime);

    return bookedTimes.some(bookedTime =>
        normalizeTime(bookedTime) === normalizedSlotTime
    );
};

// =======================================================
// CHECK IF DATE IS FULLY BOOKED
// =======================================================

const isDateFullyBooked = (dayName) => {
    const onlineSlots = getAppointmentSlotsForDay(dayName, "Online");

    if (onlineSlots.length === 0) {
        return true;
    }

    for (const slotTime of onlineSlots) {
        if (!isSlotBooked(slotTime) && !hasTimePassed(slotTime)) {
            return false;
        }
    }

    return true;
};

// =======================================================
// DISPLAY AVAILABLE TIME SLOTS
// =======================================================

const displayAvailableSlots = (selectedDay) => {
    if (!timeSlots) {
        return;
    }

    timeSlots.innerHTML = "";

    const onlineSlots = getAppointmentSlotsForDay(selectedDay, "Online");

    if (onlineSlots.length === 0) {
        timeSlots.innerHTML = `
            <p class="slot-message">
                No Online appointment slots are available for this day.
            </p>
        `;
        return;
    }

    let availableSlotCount = 0;

    onlineSlots.forEach(slotTime => {
        if (isSlotBooked(slotTime)) {
            return;
        }

        const slotButton = document.createElement("button");

        slotButton.type = "button";
        slotButton.className = "time-slot-btn";
        slotButton.dataset.time = slotTime;

        slotButton.innerHTML = `
            <i class="bi bi-clock"></i>
            <span>${formatTimeForPatient(slotTime)}</span>
        `;

        if (hasTimePassed(slotTime)) {
            slotButton.disabled = true;
            slotButton.classList.add("disabled");
        }

        slotButton.addEventListener("click", function () {
            if (this.disabled) {
                return;
            }

            document.querySelectorAll(".time-slot-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");

            selectedTime = normalizeTime(this.dataset.time);

            bookAppointmentBtn.disabled = false;
        });

        timeSlots.appendChild(slotButton);

        if (!slotButton.disabled) {
            availableSlotCount++;
        }
    });

    if (availableSlotCount === 0) {
        timeSlots.innerHTML = `
            <p class="slot-message">
                No available Online appointment slots are remaining for this date.
            </p>
        `;
    }
};

// =======================================================
// DISPLAY UPCOMING AVAILABLE DATES
//
// FOLLOW-UP APPOINTMENT UPDATE:
//
// 1. If followUpDate is supplied in the URL, check it.
// 2. If available, include it and automatically select it.
// 3. If unavailable, other available dates remain selectable.
// 4. If the prescribed date is beyond the first 14 available
//    dates, still check the prescribed date.
// 5. Without a follow-up date, keep the normal 14-date behavior.
// =======================================================

const displayUpcomingDates = async () => {
    if (!dateButtons) {
        return;
    }

    dateButtons.innerHTML = "";

    if (!doctorWeeklySchedule) {
        dateButtons.innerHTML = `
            <p class="date-message">
                Doctor's appointment time slots will be displayed here once the doctor's working schedule is available.
            </p>
        `;
        return;
    }

    const previousSelectedDate = selectedDate;
    const previousBookedTimes = [...bookedTimes];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maximumDates = 14;

    let generatedDates = 0;

    const normalizedFollowUpDate = followUpDate
        ? String(followUpDate).split("T")[0]
        : null;

    const shouldAutoSelectFollowUp =
        Boolean(normalizedFollowUpDate) && !isReschedule;

    let followUpDateButton = null;
    let followUpDateChecked = false;

    for (let i = 0; i < 90; i++) {
        const currentDate = new Date(today);

        currentDate.setDate(today.getDate() + i);

        const formattedDate = [
            currentDate.getFullYear(),
            String(currentDate.getMonth() + 1).padStart(2, "0"),
            String(currentDate.getDate()).padStart(2, "0")
        ].join("-");

        const isPrescribedFollowUpDate =
            shouldAutoSelectFollowUp &&
            formattedDate === normalizedFollowUpDate;

        // After finding the prescribed date, do not keep
        // scanning just to fill additional regular date buttons.
        if (
            generatedDates >= maximumDates &&
            !isPrescribedFollowUpDate
        ) {
            if (
                !shouldAutoSelectFollowUp ||
                followUpDateChecked ||
                formattedDate > normalizedFollowUpDate
            ) {
                break;
            }
        }

        const dayName = dayNames[currentDate.getDay()];

        const daySchedule = getWorkingHourForDay(dayName);

        if (isPrescribedFollowUpDate) {
            followUpDateChecked = true;
        }

        if (
            !daySchedule ||
            !daySchedule.StartTime ||
            !daySchedule.EndTime
        ) {
            continue;
        }

        // Skip dates when the doctor is on leave.
        if (isDoctorOnLeave(formattedDate)) {
            continue;
        }

        // Set the date before checking availability so
        // hasTimePassed() can correctly evaluate today's slots.
        selectedDate = formattedDate;

        await loadBookedTimes();

        const dateFullyBooked = isDateFullyBooked(dayName);

        if (dateFullyBooked) {
            console.log(
                `Skipping ${formattedDate} - no Online slots available.`
            );
            continue;
        }

        // Do not add regular dates beyond the normal limit.
        // The prescribed follow-up date is the exception.
        if (
            generatedDates >= maximumDates &&
            !isPrescribedFollowUpDate
        ) {
            continue;
        }

        const button = document.createElement("button");

        button.type = "button";
        button.className = "date-btn";
        button.dataset.date = formattedDate;
        button.dataset.day = dayName;

        const displayDay = currentDate.toLocaleDateString("en-IN", {
            day: "2-digit"
        });

        const displayMonth = currentDate.toLocaleDateString("en-IN", {
            month: "short"
        });

        button.innerHTML = `
            <span class="date-day">${displayDay}</span>
            <span class="date-month">${displayMonth}</span>
        `;

        // Keep a reference to the prescribed date so it
        // can be automatically selected after generation.
        if (isPrescribedFollowUpDate) {
            followUpDateButton = button;
            button.classList.add("follow-up-date");
        }

        // ===================================================
        // DATE BUTTON CLICK
        // ===================================================

        button.addEventListener("click", async function () {
            document.querySelectorAll(".date-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");

            selectedDate = this.dataset.date;
            selectedTime = null;

            bookAppointmentBtn.disabled = true;

            timeSlots.innerHTML = `
                <p class="slot-message">
                    Loading available appointment slots...
                </p>
            `;

            await loadBookedTimes();

            // Recheck availability in case a slot was booked
            // after the date buttons were first displayed.
            if (isDateFullyBooked(this.dataset.day)) {
                this.remove();

                selectedDate = null;
                selectedTime = null;

                bookAppointmentBtn.disabled = true;

                timeSlots.innerHTML = `
                    <p class="slot-message">
                        No available Online appointment slots are remaining for this date.
                    </p>
                `;

                return;
            }

            displayAvailableSlots(this.dataset.day);
        });

        dateButtons.appendChild(button);

        generatedDates++;
    }

    // Restore the variables used before date generation.
    selectedDate = previousSelectedDate;
    bookedTimes = previousBookedTimes;

    // ===================================================
    // AUTOMATICALLY SELECT PRESCRIBED FOLLOW-UP DATE
    // ===================================================

    if (followUpDateButton && shouldAutoSelectFollowUp) {
        console.log(
            "Automatically selecting prescribed follow-up date:",
            normalizedFollowUpDate
        );

        // The existing click handler loads the bookings and
        // displays the available time slots for this date.
        followUpDateButton.click();

        return;
    }

    // ===================================================
    // PRESCRIBED DATE NOT AVAILABLE
    // ===================================================

    if (
        shouldAutoSelectFollowUp &&
        normalizedFollowUpDate
    ) {
        console.log(
            "Prescribed follow-up date is unavailable. Other available dates remain selectable:",
            normalizedFollowUpDate
        );
    }

    // ===================================================
    // NO AVAILABLE DATES
    // ===================================================

    if (generatedDates === 0) {
        dateButtons.innerHTML = `
            <p class="date-message">
                No upcoming appointment dates are currently available.
            </p>
        `;
    }
};

// =======================================================
// DISPLAY DOCTOR INFORMATION
// =======================================================

const displayDoctor = (doctor) => {
    if (doctorName) {
        doctorName.textContent =
            doctor.fullName ||
            doctor.FullName ||
            doctor.name ||
            "Doctor";
    }

    if (doctorQualification) {
        doctorQualification.textContent =
            doctor.qualification ||
            doctor.Qualification ||
            "Dermatologist";
    }

    if (doctorSpecialization) {
        doctorSpecialization.textContent =
            doctor.specialization ||
            doctor.Specialization ||
            "Skin Specialist";
    }

    if (doctorExperience) {
        doctorExperience.textContent =
            doctor.experience !== undefined
                ? `${doctor.experience} Years`
                : "Not available";
    }

    if (doctorFee) {
        doctorFee.textContent =
            doctor.consultationFee !== undefined
                ? `₹${Number(doctor.consultationFee).toLocaleString("en-IN")}`
                : "Not available";
    }

    if (doctorWorkingDays) {
        doctorWorkingDays.textContent =
            Array.isArray(doctor.workingDays)
                ? doctor.workingDays.join(", ")
                : "Not available";
    }

    const imagePath = doctor.doctorImage || doctor.profileImage;

    if (doctorImage && imagePath) {
        doctorImage.src = getDoctorImageURL(imagePath);
    }

    if (doctorImage) {
        doctorImage.onerror = function () {
            this.src = "../Images/doctor1.png";
        };
    }

    if (doctorAbout) {
        const aboutText = doctor.aboutDoctor || "";

        doctorAbout.textContent = aboutText.trim()
            ? aboutText
            : "About doctor information is not available.";
    }

    displayUpcomingDates();
};

// =======================================================
// CREATE DOCTOR IMAGE URL
// =======================================================

const getDoctorImageURL = (imagePath) => {
    if (!imagePath) {
        return "../Images/doctor1.png";
    }

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }

    const cleanPath = imagePath.replace(/^\/+/, "");

    return "https://dermacare-eeca.onrender.com/" + cleanPath;
};

// =======================================================
// REFRESH CURRENT DATE SLOTS
// =======================================================

const refreshCurrentDateSlots = async () => {
    if (!selectedDate) {
        return;
    }

    const activeDateButton = document.querySelector(
        `.date-btn[data-date="${selectedDate}"]`
    );

    if (!activeDateButton) {
        return;
    }

    selectedTime = null;
    bookAppointmentBtn.disabled = true;

    await loadBookedTimes();

    if (isDateFullyBooked(activeDateButton.dataset.day)) {
        activeDateButton.remove();

        selectedDate = null;

        timeSlots.innerHTML = `
            <p class="slot-message">
                All Online appointment slots for this date are now booked. Please select another available date.
            </p>
        `;

        return;
    }

    displayAvailableSlots(activeDateButton.dataset.day);
};

// =======================================================
// SHOW DOCTOR ERROR
// =======================================================

const showDoctorError = (message) => {
    if (doctorName) {
        doctorName.textContent = "Doctor Not Found";
    }

    if (doctorAbout) {
        doctorAbout.textContent = message;
    }

    if (dateButtons) {
        dateButtons.innerHTML = `
            <p class="date-message">${message}</p>
        `;
    }

    if (timeSlots) {
        timeSlots.innerHTML = `
            <p class="slot-message">
                Appointment slots are unavailable.
            </p>
        `;
    }

    if (bookAppointmentBtn) {
        bookAppointmentBtn.disabled = true;
    }
};

// =======================================================
// GET LOGGED-IN PATIENT ID
// =======================================================

const getLoggedInPatientId = () => {
    const storedPatientId = localStorage.getItem("patientId");

    if (storedPatientId) {
        return storedPatientId;
    }

    const storedPatient = localStorage.getItem("patient");

    if (storedPatient) {
        try {
            const patient = JSON.parse(storedPatient);

            return (
                patient.id ||
                patient._id ||
                patient.PatientID ||
                null
            );
        } catch (error) {
            console.error("Unable to read patient data:", error);
        }
    }

    return null;
};

// =======================================================
// BOOK APPOINTMENT
// =======================================================

if (bookAppointmentBtn) {
    bookAppointmentBtn.disabled = true;

    bookAppointmentBtn.addEventListener("click", async function () {
        if (!selectedDate) {
            showAppointmentMessage(
                "Please select an appointment date.",
                "error"
            );
            return;
        }

        if (!selectedTime) {
            showAppointmentMessage(
                "Please select an appointment time.",
                "error"
            );
            return;
        }

        if (!doctorId) {
            showAppointmentMessage(
                "Doctor information is missing.",
                "error"
            );
            return;
        }

        // Validate appointment ID for rescheduling.
        if (isReschedule && !rescheduleAppointmentId) {
            showAppointmentMessage(
                "Unable to reschedule. Existing appointment ID is missing. Please open Reschedule again.",
                "error"
            );
            return;
        }

        const patientId = getLoggedInPatientId();

        if (!patientId) {
            showAppointmentMessage(
                "Please login first to book an appointment.",
                "error"
            );
            return;
        }

        if (!validatePatientAppointmentInformation()) {
            return;
        }

        const patientAppointmentReason =
            reasonForVisit ? reasonForVisit.value.trim() : "";

        const patientSymptoms =
            symptoms ? symptoms.value.trim() : "";

        const patientAllergies =
            allergies ? allergies.value.trim() : "No known allergies";

        const patientAllergyDetails =
            allergyDetails ? allergyDetails.value.trim() : "";

        await loadBookedTimes();

        // Check whether the selected slot has already been booked.
        if (isSlotBooked(selectedTime)) {
            showAppointmentMessage(
                "This appointment slot has already been booked. Please select another available slot.",
                "error"
            );

            await refreshCurrentDateSlots();
            return;
        }

        // Prevent booking a passed slot.
        if (hasTimePassed(selectedTime)) {
            showAppointmentMessage(
                "This appointment time has already passed. Please select another available slot.",
                "error"
            );

            await refreshCurrentDateSlots();
            return;
        }

        const appointmentData = {
            PatientID: patientId,
            DoctorID: doctorId,
            AppointmentDate: selectedDate,
            AppointmentTime: normalizeTime(selectedTime),
            AppointmentType: "Online",
            ReasonForVisit: patientAppointmentReason,
            Symptoms: patientSymptoms,
            Allergies: patientAllergies,
            AllergyDetails: patientAllergyDetails
        };

        const bookingDate = selectedDate;
        const bookingTime = selectedTime;
        const originalButtonText = bookAppointmentBtn.innerHTML;

        bookAppointmentBtn.disabled = true;

        bookAppointmentBtn.innerHTML = `
            <span>${isReschedule ? "Rescheduling..." : "Booking..."}</span>
        `;

        try {
            const response = await fetch(
                isReschedule
                    ? `${APPOINTMENT_API_URL}/${rescheduleAppointmentId}/reschedule`
                    : `${APPOINTMENT_API_URL}/book`,
                {
                    method: isReschedule ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        isReschedule
                            ? {
                                PatientID: patientId,
                                DoctorID: doctorId,
                                AppointmentDate: bookingDate,
                                AppointmentTime: normalizeTime(bookingTime)
                            }
                            : appointmentData
                    )
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    (
                        isReschedule
                            ? "Unable to reschedule appointment. Please try again."
                            : "Unable to book appointment. Please try again."
                    )
                );
            }

            showAppointmentMessage(
                isReschedule
                    ? `Appointment rescheduled successfully for ${bookingDate} at ${formatTimeForPatient(bookingTime)}.`
                    : `Appointment booked successfully for ${bookingDate} at ${formatTimeForPatient(bookingTime)}.`,
                "success"
            );

            selectedTime = null;

            await refreshCurrentDateSlots();

            bookAppointmentBtn.innerHTML = originalButtonText;
            bookAppointmentBtn.disabled = true;
        } catch (error) {
            console.error(
                isReschedule
                    ? "Error rescheduling appointment:"
                    : "Error booking appointment:",
                error
            );

            showAppointmentMessage(
                error.message ||
                (
                    isReschedule
                        ? "Unable to reschedule appointment. Please try again."
                        : "Unable to book appointment. Please try again."
                ),
                "error"
            );

            await refreshCurrentDateSlots();

            bookAppointmentBtn.innerHTML = originalButtonText;
            bookAppointmentBtn.disabled = true;
        }
    });
}

// =======================================================
// MOBILE HAMBURGER MENU
// =======================================================

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("open");

        if (overlay) {
            overlay.classList.toggle("show");
        }

        const icon = menuToggle.querySelector("i");

        if (sidebar.classList.contains("open")) {
            if (icon) {
                icon.classList.remove("bi-list");
                icon.classList.add("bi-x-lg");
            }
        } else {
            if (icon) {
                icon.classList.remove("bi-x-lg");
                icon.classList.add("bi-list");
            }
        }
    });
}

// =======================================================
// CLOSE MOBILE MENU
// =======================================================

const closeMobileMenu = () => {
    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("show");
    }

    const icon = menuToggle
        ? menuToggle.querySelector("i")
        : null;

    if (icon) {
        icon.classList.remove("bi-x-lg");
        icon.classList.add("bi-list");
    }
};

// =======================================================
// CLOSE MENU WHEN OVERLAY IS CLICKED
// =======================================================

if (overlay) {
    overlay.addEventListener("click", closeMobileMenu);
}

// =======================================================
// ESCAPE KEY CLOSES MENU
// =======================================================

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeMobileMenu();
    }
});

// =======================================================
// LOGOUT
// =======================================================

if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
        event.preventDefault();

        localStorage.removeItem("patient");
        localStorage.removeItem("patientId");
        localStorage.removeItem("patient_id");
        localStorage.removeItem("patientEmail");
        localStorage.removeItem("patientName");
        localStorage.removeItem("patientLoggedIn");
        localStorage.removeItem("patientData");

        window.location.href = "../index.html";
    });
}

// =======================================================
// START
// =======================================================

loadDoctor();
