// =======================================================
// DERMCARE - PATIENT NOTIFICATIONS JAVASCRIPT
// FILE: patient/js/notifications.js
// =======================================================


// =======================================================
// BACKEND API
// =======================================================

const API_BASE_URL = "http://127.0.0.1:5000/api";


// =======================================================
// GET LOGGED-IN PATIENT
// =======================================================

let patientData = localStorage.getItem("patient");

if (!patientData) {
    patientData = localStorage.getItem("patientData");
}

let patient = null;

try {

    if (patientData) {
        patient = JSON.parse(patientData);
    }

} catch (error) {

    console.error("Invalid patient data:", error);

}


// =======================================================
// CHECK PATIENT LOGIN
// =======================================================

if (!patient || !patient.id) {

    alert("Please log in to view your notifications.");

    window.location.href = "../login.html";

}


// =======================================================
// HTML ESCAPE FUNCTION
// =======================================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =======================================================
// FORMAT NOTIFICATION DATE
// =======================================================

const formatNotificationDate = (dateValue) => {

    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};


// =======================================================
// GET NOTIFICATION ICON
// =======================================================

const getNotificationIcon = (type) => {

    switch (type) {

        case "Rescheduled":
            return "bi bi-calendar2-check";

        case "Reminder":
            return "bi bi-alarm";

        case "Cancelled":
            return "bi bi-calendar2-x";

        default:
            return "bi bi-bell";
    }
};


// =======================================================
// GET PAGE ELEMENTS
// =======================================================

const notificationList =
    document.getElementById("notificationList");

const notificationSummary =
    document.getElementById("notificationSummary");

const markAllReadButton =
    document.getElementById("markAllRead");

let patientNotifications = [];


// =======================================================
// UPDATE NOTIFICATION SUMMARY
// =======================================================

const updateNotificationSummary = () => {

    if (!notificationSummary) {
        return;
    }

    const totalCount = patientNotifications.length;

    const unreadCount = patientNotifications.filter(
        notification => !notification.IsRead
    ).length;

    notificationSummary.textContent =
        `${totalCount} notification(s) • ${unreadCount} unread`;
};


// =======================================================
// DISPLAY NOTIFICATIONS
// =======================================================

const displayNotifications = () => {

    if (!notificationList) {
        return;
    }

    if (patientNotifications.length === 0) {

        notificationList.innerHTML = `

            <div class="notification-empty">

                <i class="bi bi-bell-slash"></i>

                <h3>No Notifications Yet</h3>

                <p>
                    You will see appointment updates and reminders here.
                </p>

            </div>

        `;

        updateNotificationSummary();

        return;
    }


    notificationList.innerHTML = "";


    patientNotifications.forEach(notification => {

        const notificationItem =
            document.createElement("div");

        notificationItem.className =
            `notification-card ${notification.IsRead ? "read" : "unread"}`;


        const notificationIcon =
            getNotificationIcon(notification.Type);


        const notificationDate =
            formatNotificationDate(notification.createdAt);


        notificationItem.innerHTML = `

            <div class="notification-icon">

                <i class="${notificationIcon}"></i>

            </div>


            <div class="notification-content">

                <div class="notification-title-row">

                    <h3>
                        ${escapeHTML(notification.Title || "Notification")}
                    </h3>

                    ${
                        notification.IsRead
                            ? `<span class="read-label">Read</span>`
                            : `<span class="unread-label">New</span>`
                    }

                </div>


                <p>
                    ${escapeHTML(notification.Message || "")}
                </p>


                <small>
                    <i class="bi bi-clock"></i>
                    ${escapeHTML(notificationDate)}
                </small>


                ${
                    notification.IsRead
                        ? ""
                        : `
                            <button
                                type="button"
                                class="mark-read-btn"
                                data-id="${escapeHTML(notification._id)}"
                            >
                                <i class="bi bi-check2"></i>
                                Mark as read
                            </button>
                        `
                }

            </div>

        `;


        notificationList.appendChild(notificationItem);

    });


    updateNotificationSummary();
};


// =======================================================
// LOAD PATIENT NOTIFICATIONS
// =======================================================

const loadPatientNotifications = async () => {

    if (!patient || !patient.id) {
        return;
    }

    notificationList.innerHTML = `

        <div class="notification-loading">

            <i class="bi bi-hourglass-split"></i>

            Loading notifications...

        </div>

    `;


    try {

        const response = await fetch(
            `${API_BASE_URL}/notifications/patient/${patient.id}`
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Unable to load notifications."
            );

        }


        patientNotifications = data.notifications || [];


        displayNotifications();


        console.log(
            "Notifications loaded:",
            patientNotifications.length
        );


    } catch (error) {

        console.error("Notification loading error:", error);


        notificationList.innerHTML = `

            <div class="notification-error">

                <i class="bi bi-exclamation-circle"></i>

                <h3>Unable to Load Notifications</h3>

                <p>
                    Please check your connection and try again.
                </p>

                <button
                    type="button"
                    id="retryNotifications"
                >
                    Try Again
                </button>

            </div>

        `;


        const retryButton =
            document.getElementById("retryNotifications");


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadPatientNotifications
            );

        }

    }
};


// =======================================================
// MARK ONE NOTIFICATION AS READ
// =======================================================

const markNotificationAsRead = async (notificationId) => {

    if (!patient || !patient.id || !notificationId) {
        return;
    }


    const notification = patientNotifications.find(
        item => item._id === notificationId
    );


    if (!notification || notification.IsRead) {
        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/notifications/${notificationId}/read`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    patientId: patient.id
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Unable to mark notification as read."
            );

        }


        notification.IsRead = true;


        // Refresh the notification cards.

        displayNotifications();


        console.log("Notification marked as read:", notificationId);


    } catch (error) {

        console.error(
            "Mark notification as read error:",
            error
        );

        alert("Unable to mark this notification as read. Please try again.");

    }
};


// =======================================================
// MARK ALL NOTIFICATIONS AS READ
// =======================================================

const markAllNotificationsAsRead = async () => {

    if (!patient || !patient.id) {
        return;
    }


    const unreadNotifications = patientNotifications.filter(
        notification => !notification.IsRead
    );


    if (unreadNotifications.length === 0) {
        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/notifications/patient/${patient.id}/read-all`,
            {
                method: "PATCH"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Unable to mark all notifications as read."
            );

        }


        patientNotifications.forEach(notification => {
            notification.IsRead = true;
        });


        displayNotifications();


        console.log("All notifications marked as read.");


    } catch (error) {

        console.error(
            "Mark all notifications error:",
            error
        );

        alert("Unable to mark all notifications as read. Please try again.");

    }
};


// =======================================================
// CLICK INDIVIDUAL MARK AS READ BUTTON
// =======================================================

if (notificationList) {

    notificationList.addEventListener("click", event => {

        const markButton =
            event.target.closest(".mark-read-btn");


        if (!markButton) {
            return;
        }


        const notificationId =
            markButton.dataset.id;


        markNotificationAsRead(notificationId);

    });

}


// =======================================================
// MARK ALL AS READ BUTTON
// =======================================================

if (markAllReadButton) {

    markAllReadButton.addEventListener(
        "click",
        markAllNotificationsAsRead
    );

}


// =======================================================
// MOBILE MENU
// =======================================================

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.querySelector(".sidebar");

const overlay =
    document.getElementById("overlay");


const closeMobileMenu = () => {

    if (sidebar) {
        sidebar.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

    if (menuToggle) {

        const icon = menuToggle.querySelector("i");

        if (icon) {
            icon.classList.remove("bi-x-lg");
            icon.classList.add("bi-list");
        }

        menuToggle.setAttribute("aria-label", "Open menu");
        menuToggle.setAttribute("aria-expanded", "false");
    }

};


if (menuToggle && sidebar) {

    menuToggle.addEventListener("click", () => {

        const isOpen = sidebar.classList.contains("active");


        if (isOpen) {

            closeMobileMenu();

        } else {

            sidebar.classList.add("active");

            if (overlay) {
                overlay.classList.add("active");
            }

            const icon = menuToggle.querySelector("i");

            if (icon) {
                icon.classList.remove("bi-list");
                icon.classList.add("bi-x-lg");
            }

            menuToggle.setAttribute("aria-label", "Close menu");
            menuToggle.setAttribute("aria-expanded", "true");

        }

    });

}


if (overlay) {

    overlay.addEventListener("click", closeMobileMenu);

}


if (sidebar) {

    sidebar.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", closeMobileMenu);

    });

}


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeMobileMenu();
    }

});


window.addEventListener("resize", () => {

    if (window.innerWidth > 900) {
        closeMobileMenu();
    }

});


// =======================================================
// LOGOUT
// =======================================================

const logoutLink =
    document.getElementById("logoutLink");


if (logoutLink) {

    logoutLink.addEventListener("click", event => {

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
// INITIALIZE NOTIFICATIONS PAGE
// =======================================================

if (patient && patient.id) {
    loadPatientNotifications();
}