
// =======================================================
// DERMCARE BACKEND SERVER
// FILE: server.js
// =======================================================

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// =======================================================
// LOAD ENVIRONMENT VARIABLES
// =======================================================

dotenv.config();

// =======================================================
// IMPORT DATABASE CONNECTION
// =======================================================

const connectDB = require("./config/db");

// =======================================================
// IMPORT EMAIL SERVICE
// =======================================================

const {
    verifyEmailConnection
} = require("./config/email");

// =======================================================
// IMPORT AUTOMATIC REMINDER SCHEDULER
// =======================================================

const {
    startReminderScheduler
} = require("./services/reminderScheduler");

// =======================================================
// IMPORT ROUTES
// =======================================================

const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const doctorScheduleRoutes = require("./routes/doctorScheduleRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const receptionistRoutes = require("./routes/receptionistRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// =======================================================
// CREATE EXPRESS APPLICATION
// =======================================================

const app = express();

// =======================================================
// CREATE HTTP SERVER
// =======================================================

const server = http.createServer(app);

// =======================================================
// ALLOWED FRONTEND URLS
// =======================================================

const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://cosmic-choux-f2f85d.netlify.app"
];

// =======================================================
// INITIALIZE SOCKET.IO
// =======================================================

const io = new Server(server, {

    cors: {
        origin: allowedOrigins,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ]
    }

});

// =======================================================
// MAKE SOCKET.IO AVAILABLE TO ROUTES
// =======================================================

app.set("io", io);

// =======================================================
// SOCKET.IO CONNECTION
// =======================================================

io.on("connection", (socket) => {

    console.log(
        "DermCare user connected:",
        socket.id
    );

    socket.on("disconnect", () => {

        console.log(
            "DermCare user disconnected:",
            socket.id
        );

    });

});

// =======================================================
// CORS
// =======================================================

app.use(
    cors({

        origin: allowedOrigins,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]

    })
);

// =======================================================
// JSON MIDDLEWARE
// =======================================================

app.use(express.json());

// =======================================================
// SERVE UPLOADED FILES
// =======================================================

app.use(
    "/uploads",
    express.static("uploads")
);

// =======================================================
// ROOT TEST ROUTE
// =======================================================

app.get("/", (req, res) => {

    res.status(200).json({
        message: "DermCare backend is running"
    });

});

// =======================================================
// PATIENT ROUTES
// =======================================================

app.use("/api/patients", patientRoutes);

// =======================================================
// DOCTOR ROUTES
// =======================================================

app.use("/api/doctors", doctorRoutes);

// =======================================================
// RECEPTIONIST ROUTES
// =======================================================

app.use("/api/receptionists", receptionistRoutes);

// =======================================================
// DOCTOR SCHEDULE ROUTES
// =======================================================

app.use("/api/doctor-schedule", doctorScheduleRoutes);

// =======================================================
// LEAVE ROUTES
// =======================================================

app.use("/api/leaves", leaveRoutes);

// =======================================================
// APPOINTMENT ROUTES
// =======================================================

app.use("/api/appointments", appointmentRoutes);

// =======================================================
// PRESCRIPTION ROUTES
// =======================================================

app.use("/api/prescriptions", prescriptionRoutes);

// =======================================================
// NOTIFICATION ROUTES
// =======================================================

app.use("/api/notifications", notificationRoutes);

// =======================================================
// SERVER PORT
// =======================================================

const PORT = process.env.PORT || 5000;

// =======================================================
// START SERVER
// =======================================================

const startServer = async () => {

    try {

        await connectDB();

        // START REMINDER SCHEDULER

        startReminderScheduler();

        // VERIFY GMAIL CONNECTION

        console.log("--------------------------------");
        console.log("Checking DermCare email service...");

        await verifyEmailConnection();

        // START HTTP + SOCKET.IO SERVER

        server.listen(PORT, () => {

            console.log("--------------------------------");
            console.log("DermCare Backend Started");
            console.log(`Server running on port ${PORT}`);
            console.log("Socket.IO real-time service started");

            console.log("Patient routes loaded");
            console.log("Doctor routes loaded");
            console.log("Receptionist routes loaded");
            console.log("Doctor schedule routes loaded");
            console.log("Leave routes loaded");
            console.log("Appointment routes loaded");
            console.log("Prescription routes loaded");
            console.log("Notification routes loaded");

            console.log("Appointment reminder scheduler loaded");
            console.log("--------------------------------");

        });

    } catch (error) {

        console.error(
            "DermCare server startup failed:",
            error.message
        );

    }

};

// =======================================================
// RUN SERVER
// =======================================================

startServer();
