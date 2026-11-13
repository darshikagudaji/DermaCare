// =======================================================
// DERMCARE - DOCTOR WORKING HOURS JAVASCRIPT
// File: doctor/js/working-hours.js
// =======================================================


// =======================================================
// BACKEND API URL
// =======================================================

const API_BASE_URL =
    "http://localhost:5000";


// =======================================================
// GET LOGGED-IN DOCTOR
// =======================================================

const loggedInDoctor =
    JSON.parse(
        localStorage.getItem(
            "doctor"
        )
    );


// =======================================================
// CHECK DOCTOR LOGIN
// =======================================================

if (!loggedInDoctor) {

    alert(
        "Please login first."
    );

    window.location.href =
        "../login.html";

}


// =======================================================
// GET DOCTOR ID
// =======================================================

const doctorId =
    loggedInDoctor?._id ||
    loggedInDoctor?.id ||
    loggedInDoctor?.DoctorID;


// =======================================================
// CHECK DOCTOR ID
// =======================================================

if (!doctorId) {

    console.error(
        "Doctor ID was not found."
    );

}


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
// OPEN SIDEBAR
// =======================================================

function openSidebar() {

    if (sidebar) {

        sidebar.classList.add(
            "active"
        );

    }


    if (overlay) {

        overlay.classList.add(
            "active"
        );

    }


    if (menuToggle) {

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


// =======================================================
// CLOSE SIDEBAR
// =======================================================

function closeSidebar() {

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


    if (menuToggle) {

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


// =======================================================
// MENU TOGGLE
// =======================================================

if (menuToggle) {

    menuToggle.addEventListener(

        "click",

        function () {

            if (

                sidebar &&
                sidebar.classList.contains(
                    "active"
                )

            ) {

                closeSidebar();

            }

            else {

                openSidebar();

            }

        }

    );

}


// =======================================================
// OVERLAY CLICK
// =======================================================

if (overlay) {

    overlay.addEventListener(

        "click",

        function () {

            closeSidebar();

        }

    );

}


// =======================================================
// CLOSE SIDEBAR ON NAVIGATION
// =======================================================

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar nav a"
    );


sidebarLinks.forEach(

    function (link) {

        link.addEventListener(

            "click",

            function () {

                closeSidebar();

            }

        );

    }

);


// =======================================================
// WORKING HOURS FORM
// =======================================================

const workingHoursForm =
    document.getElementById(
        "workingHoursForm"
    );


// =======================================================
// MESSAGE AREA
// =======================================================

let workingHoursMessage =
    document.getElementById(
        "workingHoursMessage"
    );


// =======================================================
// CREATE MESSAGE AREA IF NOT PRESENT
// =======================================================

function createWorkingHoursMessageArea() {

    // ===================================================
    // IF ALREADY EXISTS
    // ===================================================

    if (workingHoursMessage) {

        return;

    }


    // ===================================================
    // CREATE MESSAGE DIV
    // ===================================================

    workingHoursMessage =
        document.createElement(
            "div"
        );


    workingHoursMessage.id =
        "workingHoursMessage";


    workingHoursMessage.className =
        "working-hours-message";


    workingHoursMessage.style.display =
        "none";


    // ===================================================
    // INSERT ABOVE WORKING HOURS FORM
    // ===================================================

    if (

        workingHoursForm &&
        workingHoursForm.parentNode

    ) {

        workingHoursForm.parentNode.insertBefore(

            workingHoursMessage,

            workingHoursForm

        );

    }


    // ===================================================
    // FALLBACK INSERT
    // ===================================================

    else {

        document.body.prepend(
            workingHoursMessage
        );

    }

}


// =======================================================
// CREATE MESSAGE AREA IMMEDIATELY
// =======================================================

createWorkingHoursMessageArea();


// =======================================================
// MESSAGE TIMER
// =======================================================

let workingHoursMessageTimer =
    null;


// =======================================================
// SHOW MESSAGE
//
// type = success / error
// =======================================================

function showWorkingHoursMessage(

    message,

    type

) {

    // ===================================================
    // MAKE SURE MESSAGE AREA EXISTS
    // ===================================================

    if (!workingHoursMessage) {

        createWorkingHoursMessageArea();

    }


    if (!workingHoursMessage) {

        console.error(
            "Unable to create working hours message area."
        );

        return;

    }


    // ===================================================
    // CLEAR OLD TIMER
    // ===================================================

    if (workingHoursMessageTimer) {

        clearTimeout(
            workingHoursMessageTimer
        );

        workingHoursMessageTimer =
            null;

    }


    // ===================================================
    // SUCCESS MESSAGE
    // ===================================================

    if (type === "success") {

        workingHoursMessage.className =
            "working-hours-message success-message";


        workingHoursMessage.innerHTML =
            `
            <div class="message-content">

                <div class="message-left">

                    <i
                        class="bi bi-check-circle-fill message-icon"
                    ></i>

                    <span class="message-text">
                        ${message}
                    </span>

                </div>


                <button
                    type="button"
                    class="message-close-btn"
                    aria-label="Close message"
                    title="Close"
                >

                    <i
                        class="bi bi-x-lg"
                    ></i>

                </button>

            </div>
            `;

    }


    // ===================================================
    // ERROR MESSAGE
    // ===================================================

    else {

        workingHoursMessage.className =
            "working-hours-message error-message";


        workingHoursMessage.innerHTML =
            `
            <div class="message-content">

                <div class="message-left">

                    <i
                        class="bi bi-exclamation-circle-fill message-icon"
                    ></i>

                    <span class="message-text">
                        ${message}
                    </span>

                </div>


                <button
                    type="button"
                    class="message-close-btn"
                    aria-label="Close message"
                    title="Close"
                >

                    <i
                        class="bi bi-x-lg"
                    ></i>

                </button>

            </div>
            `;

    }


    // ===================================================
    // SHOW MESSAGE
    // ===================================================

    workingHoursMessage.style.display =
        "block";


    // ===================================================
    // GET CLOSE BUTTON
    // ===================================================

    const closeButton =
        workingHoursMessage.querySelector(
            ".message-close-btn"
        );


    // ===================================================
    // CLOSE BUTTON EVENT
    // ===================================================

    if (closeButton) {

        closeButton.addEventListener(

            "click",

            function () {

                hideWorkingHoursMessage();

            }

        );

    }


    // ===================================================
    // SCROLL TO MESSAGE
    // ===================================================

    setTimeout(

        function () {

            workingHoursMessage.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });

        },

        100

    );


    // ===================================================
    // AUTO HIDE AFTER 5 SECONDS
    // ===================================================

    workingHoursMessageTimer =
        setTimeout(

            function () {

                hideWorkingHoursMessage();

            },

            5000

        );

}


// =======================================================
// HIDE MESSAGE
// =======================================================

function hideWorkingHoursMessage() {

    if (!workingHoursMessage) {

        return;

    }


    // ===================================================
    // CLEAR TIMER
    // ===================================================

    if (workingHoursMessageTimer) {

        clearTimeout(
            workingHoursMessageTimer
        );

        workingHoursMessageTimer =
            null;

    }


    // ===================================================
    // HIDE MESSAGE
    // ===================================================

    workingHoursMessage.innerHTML =
        "";


    workingHoursMessage.style.display =
        "none";


    workingHoursMessage.className =
        "working-hours-message";

}


// =======================================================
// WEEK DAYS
// =======================================================

const weekDays = [

    "Monday",

    "Tuesday",

    "Wednesday",

    "Thursday",

    "Friday",

    "Saturday",

    "Sunday"

];


// =======================================================
// GET INPUT IDs
// =======================================================

function getDayInputIds(
    day
) {

    const dayName =
        day.toLowerCase();


    return {

        startTimeId:
            `${dayName}StartTime`,

        endTimeId:
            `${dayName}EndTime`

    };

}


// =======================================================
// GET TIME DIFFERENCE
// =======================================================

function getTimeDifferenceInMinutes(

    startTime,

    endTime

) {

    const startParts =
        startTime.split(
            ":"
        );


    const endParts =
        endTime.split(
            ":"
        );


    const startMinutes =

        (
            Number(
                startParts[0]
            ) * 60
        )

        +

        Number(
            startParts[1]
        );


    const endMinutes =

        (
            Number(
                endParts[0]
            ) * 60
        )

        +

        Number(
            endParts[1]
        );


    return (
        endMinutes -
        startMinutes
    );

}


// =======================================================
// VALIDATE WORKING TIME
// =======================================================

function validateTimeRange(

    startTime,

    endTime,

    dayName

) {


    // ===================================================
    // BOTH EMPTY
    // ===================================================

    if (

        !startTime &&
        !endTime

    ) {

        return {

            valid:
                true,

            message:
                ""

        };

    }


    // ===================================================
    // ONE TIME EMPTY
    // ===================================================

    if (

        !startTime ||
        !endTime

    ) {

        return {

            valid:
                false,

            message:
                `Please enter both Start Time and End Time for ${dayName}.`

        };

    }


    // ===================================================
    // END TIME MUST BE LATER
    // ===================================================

    if (

        endTime <=
        startTime

    ) {

        return {

            valid:
                false,

            message:
                `End Time must be later than Start Time for ${dayName}.`

        };

    }


    // ===================================================
    // GET TOTAL MINUTES
    // ===================================================

    const totalMinutes =
        getTimeDifferenceInMinutes(

            startTime,

            endTime

        );


    // ===================================================
    // MINIMUM 40 MINUTES
    // ===================================================

    if (

        totalMinutes <
        40

    ) {

        return {

            valid:
                false,

            message:
                `${dayName} working hours must be at least 40 minutes.`

        };

    }


    return {

        valid:
            true,

        message:
            ""

    };

}


// =======================================================
// LOAD WEEKLY SCHEDULE
// =======================================================

async function loadWeeklySchedule() {

    if (!doctorId) {

        return;

    }


    try {

        const response =
            await fetch(

                `${API_BASE_URL}/api/doctor-schedule/${doctorId}`

            );


        if (!response.ok) {

            throw new Error(
                "Failed to load working hours."
            );

        }


        const result =
            await response.json();


        const doctorSchedule =
            result.doctorSchedule;


        if (!doctorSchedule) {

            return;

        }


        const weeklySchedule =
            doctorSchedule.WeeklySchedule;


        if (!weeklySchedule) {

            return;

        }


        weekDays.forEach(

            function (day) {

                const inputIds =
                    getDayInputIds(
                        day
                    );


                const startInput =
                    document.getElementById(
                        inputIds.startTimeId
                    );


                const endInput =
                    document.getElementById(
                        inputIds.endTimeId
                    );


                const daySchedule =
                    weeklySchedule[
                        day
                    ];


                if (!daySchedule) {

                    return;

                }


                if (startInput) {

                    startInput.value =
                        daySchedule.StartTime ||
                        "";

                }


                if (endInput) {

                    endInput.value =
                        daySchedule.EndTime ||
                        "";

                }

            }

        );


        console.log(
            "Weekly working hours loaded."
        );

    }


    catch (error) {

        console.error(
            "Error loading working hours:",
            error
        );

    }

}


// =======================================================
// SAVE WEEKLY WORKING HOURS
// =======================================================

if (workingHoursForm) {

    workingHoursForm.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();


            // ===============================================
            // HIDE OLD MESSAGE
            // ===============================================

            hideWorkingHoursMessage();


            // ===============================================
            // CHECK DOCTOR ID
            // ===============================================

            if (!doctorId) {

                showWorkingHoursMessage(

                    "Doctor ID was not found. Please login again.",

                    "error"

                );

                return;

            }


            // ===============================================
            // CREATE WEEKLY SCHEDULE
            // ===============================================

            const WeeklySchedule =
                {};


            let hasWorkingDay =
                false;


            for (

                const day of weekDays

            ) {

                const inputIds =
                    getDayInputIds(
                        day
                    );


                const startInput =
                    document.getElementById(
                        inputIds.startTimeId
                    );


                const endInput =
                    document.getElementById(
                        inputIds.endTimeId
                    );


                const startTime =
                    startInput
                        ? startInput.value
                        : "";


                const endTime =
                    endInput
                        ? endInput.value
                        : "";


                // ===========================================
                // VALIDATE
                // ===========================================

                const validation =
                    validateTimeRange(

                        startTime,

                        endTime,

                        day

                    );


                if (!validation.valid) {

                    showWorkingHoursMessage(

                        validation.message,

                        "error"

                    );

                    return;

                }


                // ===========================================
                // SAVE DAY
                // ===========================================

                WeeklySchedule[
                    day
                ] =

                    {

                        StartTime:
                            startTime ||
                            null,

                        EndTime:
                            endTime ||
                            null

                    };


                if (

                    startTime &&
                    endTime

                ) {

                    hasWorkingDay =
                        true;

                }

            }


            // ===============================================
            // AT LEAST ONE DAY
            // ===============================================

            if (!hasWorkingDay) {

                showWorkingHoursMessage(

                    "Please enter working hours for at least one day.",

                    "error"

                );

                return;

            }


            // ===============================================
            // REQUEST DATA
            // ===============================================

            const scheduleData =

                {

                    DoctorID:
                        doctorId,

                    WeeklySchedule:
                        WeeklySchedule

                };


            // ===============================================
            // SAVE BUTTON
            // ===============================================

            const saveButton =
                document.getElementById(
                    "saveWorkingHoursBtn"
                );


            const originalButtonText =
                saveButton
                    ? saveButton.innerHTML
                    : "";


            if (saveButton) {

                saveButton.disabled =
                    true;


                saveButton.innerHTML =
                    `
                    <i class="bi bi-hourglass-split"></i>
                    Saving...
                    `;

            }


            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/doctor-schedule/save`,

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
                                    scheduleData
                                )

                        }

                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(

                        result.message ||

                        "Failed to save working hours."

                    );

                }


                // ===============================================
                // SUCCESS
                // ===============================================

                showWorkingHoursMessage(

                    result.message ||

                    "Weekly working hours saved successfully.",

                    "success"

                );


                // ===============================================
                // RELOAD
                // ===============================================

                loadWeeklySchedule();

            }


            catch (error) {

                console.error(
                    "Error saving working hours:",
                    error
                );


                showWorkingHoursMessage(

                    error.message ||

                    "Something went wrong while saving working hours.",

                    "error"

                );

            }


            finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;


                    saveButton.innerHTML =
                        originalButtonText;

                }

            }

        }

    );

}


// =======================================================
// LEAVE MANAGEMENT
// =======================================================

const leaveForm =
    document.getElementById(
        "leaveForm"
    );


const leaveDateInput =
    document.getElementById(
        "leaveDate"
    );


const leaveReasonInput =
    document.getElementById(
        "leaveReason"
    );


const leaveList =
    document.getElementById(
        "leaveList"
    );


// =======================================================
// GET TODAY DATE
// =======================================================

function getTodayDate() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );

}


// =======================================================
// SET MINIMUM LEAVE DATE
// =======================================================

if (leaveDateInput) {

    leaveDateInput.min =
        getTodayDate();

}


// =======================================================
// LOAD LEAVE DATES
// =======================================================

async function loadLeaveDates() {

    if (

        !doctorId ||
        !leaveList

    ) {

        return;

    }


    try {

        const response =
            await fetch(

                `${API_BASE_URL}/api/leaves/doctor/${doctorId}`

            );


        if (!response.ok) {

            throw new Error(
                "Failed to load leave dates."
            );

        }


        const result =
            await response.json();


        const leaves =
            result.leaves ||
            [];


        renderLeaveList(
            leaves
        );

    }


    catch (error) {

        console.error(
            "Error loading leave dates:",
            error
        );


        renderLeaveList(
            []
        );

    }

}


// =======================================================
// ADD LEAVE DATE
// =======================================================

if (leaveForm) {

    leaveForm.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();


            // ===============================================
            // CHECK DOCTOR ID
            // ===============================================

            if (!doctorId) {

                showWorkingHoursMessage(

                    "Doctor ID was not found. Please login again.",

                    "error"

                );

                return;

            }


            const selectedDate =
                leaveDateInput
                    ? leaveDateInput.value
                    : "";


            const reason =
                leaveReasonInput
                    ? leaveReasonInput.value.trim()
                    : "";


            // ===============================================
            // VALIDATE DATE
            // ===============================================

            if (!selectedDate) {

                showWorkingHoursMessage(

                    "Please select a leave date.",

                    "error"

                );

                return;

            }


            // ===============================================
            // LEAVE DATA
            // ===============================================

           const leaveData = {
    doctorId: doctorId,
    leaveDate: selectedDate,
    reason: reason,
    AddedBy: "Doctor"
};


            // ===============================================
            // ADD BUTTON
            // ===============================================

            const addLeaveButton =
                document.getElementById(
                    "addLeaveBtn"
                );


            const originalButtonText =
                addLeaveButton
                    ? addLeaveButton.innerHTML
                    : "";


            if (addLeaveButton) {

                addLeaveButton.disabled =
                    true;


                addLeaveButton.innerHTML =
                    `
                    <i class="bi bi-hourglass-split"></i>
                    Adding...
                    `;

            }


            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/leaves/add`,

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
                                    leaveData
                                )

                        }

                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(

                        result.message ||

                        "Failed to add leave date."

                    );

                }


                // ===============================================
                // SUCCESS MESSAGE
                // ===============================================

                showWorkingHoursMessage(

                    result.message ||

                    "Leave date added successfully.",

                    "success"

                );


                leaveForm.reset();


                if (leaveDateInput) {

                    leaveDateInput.min =
                        getTodayDate();

                }


                loadLeaveDates();

            }


            catch (error) {

                console.error(
                    "Error adding leave:",
                    error
                );


                showWorkingHoursMessage(

                    error.message ||

                    "Something went wrong while adding the leave date.",

                    "error"

                );

            }


            finally {

                if (addLeaveButton) {

                    addLeaveButton.disabled =
                        false;


                    addLeaveButton.innerHTML =
                        originalButtonText;

                }

            }

        }

    );

}


// =======================================================
// RENDER LEAVE LIST
// =======================================================

function renderLeaveList(
    leaves
) {

    if (!leaveList) {

        return;

    }


    leaveList.innerHTML =
        "";


    const today =
        getTodayDate();


    const upcomingLeaves =
        leaves

            .filter(

                function (leave) {

                    return (

                        leave.leaveDate >=
                        today

                    );

                }

            )

            .sort(

                function (a, b) {

                    return (

                        new Date(
                            `${a.leaveDate}T00:00:00`
                        )

                        -

                        new Date(
                            `${b.leaveDate}T00:00:00`
                        )

                    );

                }

            );


    // ===================================================
    // NO LEAVES
    // ===================================================

    if (

        upcomingLeaves.length ===
        0

    ) {

        leaveList.innerHTML =
            `
            <div
                class="no-leave-message"
            >

                <i
                    class="bi bi-calendar-check"
                ></i>

                <p>
                    No upcoming leave dates.
                </p>

            </div>
            `;

        return;

    }


    // ===================================================
    // DISPLAY LEAVES
    // ===================================================

    upcomingLeaves.forEach(

        function (leave) {

            const leaveItem =
                document.createElement(
                    "div"
                );


            leaveItem.className =
                "leave-item";


            // ===============================================
            // SUPPORT BOTH id AND _id
            // ===============================================

            const leaveId =
                leave.id ||
                leave._id ||
                "";


            leaveItem.innerHTML =
                `

                <div class="leave-details">

                    <strong>

                        ${formatDate(
                            leave.leaveDate
                        )}

                    </strong>


                    <span>

                        ${

                            leave.reason

                                ?

                                leave.reason

                                :

                                "No reason provided"

                        }

                    </span>

                </div>


                <button

                    type="button"

                    class="delete-leave-btn"

                    data-id="${leaveId}"

                    title="Remove leave date"

                    aria-label="Remove leave date"

                >

                    <i
                        class="bi bi-trash-fill"
                    ></i>

                </button>

                `;


            leaveList.appendChild(
                leaveItem
            );

        }

    );


    // ===================================================
    // DELETE BUTTON EVENTS
    // ===================================================

    const deleteLeaveButtons =
        leaveList.querySelectorAll(
            ".delete-leave-btn"
        );


    deleteLeaveButtons.forEach(

        function (button) {

            button.addEventListener(

                "click",

                async function () {

                    const leaveId =
                        button.dataset.id;


                    if (!leaveId) {

                        showWorkingHoursMessage(

                            "Leave ID was not found.",

                            "error"

                        );

                        return;

                    }


                


                    const originalButtonContent =
                        button.innerHTML;


                    button.disabled =
                        true;


                    button.innerHTML =
                        `
                        <i class="bi bi-hourglass-split"></i>
                        `;


                    try {

                        const response =
                            await fetch(

                                `${API_BASE_URL}/api/leaves/${leaveId}`,

                                {

                                    method:
                                        "DELETE"

                                }

                            );


                        const result =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(

                                result.message ||

                                "Failed to remove leave date."

                            );

                        }


                        showWorkingHoursMessage(

                            result.message ||

                            "Leave date removed successfully.",

                            "success"

                        );


                        loadLeaveDates();

                    }


                    catch (error) {

                        console.error(
                            "Error deleting leave:",
                            error
                        );


                        showWorkingHoursMessage(

                            error.message ||

                            "Something went wrong while removing the leave date.",

                            "error"

                        );


                        button.disabled =
                            false;


                        button.innerHTML =
                            originalButtonContent;

                    }

                }

            );

        }

    );

}


// =======================================================
// FORMAT DATE
// =======================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(

        "en-IN",

        {

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"

        }

    );

}


// =======================================================
// LOGOUT
// =======================================================

const logoutLink =
    document.getElementById(
        "logoutLink"
    );


if (logoutLink) {

    logoutLink.addEventListener(

        "click",

        function (event) {

            event.preventDefault();


            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;

            }


            localStorage.removeItem(
                "doctor"
            );


            window.location.href =
                "../login.html";

        }

    );

}


// =======================================================
// INITIAL PAGE LOAD
// =======================================================

document.addEventListener(

    "DOMContentLoaded",

    function () {

        // ===================================================
        // MAKE SURE MESSAGE AREA EXISTS
        // ===================================================

        createWorkingHoursMessageArea();


        // ===================================================
        // HIDE MESSAGE INITIALLY
        // ===================================================

        if (workingHoursMessage) {

            workingHoursMessage.style.display =
                "none";

        }


        // ===================================================
        // LOAD DATA
        // ===================================================

        loadWeeklySchedule();

        loadLeaveDates();

    }

);