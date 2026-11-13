
const express = require("express");

const router = express.Router();

const {
    getPatientNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} = require("../controllers/notificationController");

// Get patient notifications
router.get(
    "/patient/:patientId",
    getPatientNotifications
);

// Mark one notification as read
router.patch(
    "/:notificationId/read",
    markNotificationAsRead
);

// Mark all notifications as read
router.patch(
    "/patient/:patientId/read-all",
    markAllNotificationsAsRead
);

module.exports = router;
