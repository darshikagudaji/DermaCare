
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// =======================================================
// CREATE NOTIFICATION
// Used internally by appointment and leave controllers
// =======================================================

const createNotification = async ({
    PatientID,
    Title,
    Message,
    Type,
    AppointmentID
}) => {

    const notification = new Notification({
        PatientID,
        Title,
        Message,
        Type,
        AppointmentID
    });

    return await notification.save();
};


// =======================================================
// GET PATIENT NOTIFICATIONS
// GET /api/notifications/patient/:patientId
// =======================================================

const getPatientNotifications = async (req, res) => {

    try {

        const { patientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({
                message: "Invalid patient ID"
            });
        }

        const notifications = await Notification.find({
            PatientID: patientId
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            notifications
        });

    } catch (error) {

        console.error("Get notifications error:", error);

        return res.status(500).json({
            message: "Unable to fetch notifications"
        });

    }
};


// =======================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:notificationId/read
// =======================================================

const markNotificationAsRead = async (req, res) => {

    try {

        const { notificationId } = req.params;
        const { patientId } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(notificationId) ||
            !mongoose.Types.ObjectId.isValid(patientId)
        ) {
            return res.status(400).json({
                message: "Invalid notification or patient ID"
            });
        }

        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                PatientID: patientId
            },
            {
                IsRead: true
            },
            {
                new: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {

        console.error("Mark notification error:", error);

        return res.status(500).json({
            message: "Unable to update notification"
        });

    }
};


// =======================================================
// MARK ALL PATIENT NOTIFICATIONS AS READ
// PATCH /api/notifications/patient/:patientId/read-all
// =======================================================

const markAllNotificationsAsRead = async (req, res) => {

    try {

        const { patientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({
                message: "Invalid patient ID"
            });
        }

        await Notification.updateMany(
            {
                PatientID: patientId,
                IsRead: false
            },
            {
                IsRead: true
            }
        );

        return res.status(200).json({
            message: "All notifications marked as read"
        });

    } catch (error) {

        console.error("Mark all notifications error:", error);

        return res.status(500).json({
            message: "Unable to update notifications"
        });

    }
};


// =======================================================
// EXPORT FUNCTIONS
// =======================================================

module.exports = {
    createNotification,
    getPatientNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};
