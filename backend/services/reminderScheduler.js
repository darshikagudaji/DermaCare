
 // =======================================================
 // DERMCARE - AUTOMATIC APPOINTMENT REMINDER SCHEDULER
 // FILE: services/reminderScheduler.js
 // =======================================================


 // =======================================================
 // IMPORT REQUIRED MODELS AND FUNCTIONS
 // =======================================================

 const Appointment = require("../models/Appointment");
 const Patient = require("../models/Patient");
 const Notification = require("../models/Notification");

 const { sendEmail } = require("../config/email");


 // =======================================================
 // CONSTANTS
 // =======================================================

 // Patient login page
 const PATIENT_LOGIN_URL =
     "http://127.0.0.1:5500/frontend/login.html";

 // Indian Standard Time
 const TIME_ZONE = "Asia/Kolkata";

 // Reminder time: 9:00 AM
 const REMINDER_HOUR = 9;


 // =======================================================
 // GET CURRENT DATE IN INDIAN TIME
 // Format: YYYY-MM-DD
 // =======================================================

 const getIndianDate = () => {

     const parts = new Intl.DateTimeFormat("en-CA", {
         timeZone: TIME_ZONE,
         year: "numeric",
         month: "2-digit",
         day: "2-digit"
     }).formatToParts(new Date());

     const year =
         parts.find(part => part.type === "year").value;

     const month =
         parts.find(part => part.type === "month").value;

     const day =
         parts.find(part => part.type === "day").value;

     return `${year}-${month}-${day}`;
 };


 // =======================================================
 // GET CURRENT INDIAN HOUR AND MINUTE
 // =======================================================

 const getIndianTime = () => {

     const parts = new Intl.DateTimeFormat("en-GB", {
         timeZone: TIME_ZONE,
         hour: "2-digit",
         minute: "2-digit",
         hourCycle: "h23"
     }).formatToParts(new Date());

     const hour = Number(
         parts.find(part => part.type === "hour").value
     );

     const minute = Number(
         parts.find(part => part.type === "minute").value
     );

     return { hour, minute };
 };


 // =======================================================
 // GET TOMORROW'S DATE IN INDIAN TIME
 // Format: YYYY-MM-DD
 // =======================================================

 const getTomorrowIndianDate = () => {

     const today = getIndianDate();

     const [year, month, day] =
         today.split("-").map(Number);

     const tomorrow = new Date(
         Date.UTC(year, month - 1, day + 1)
     );

     return [
         tomorrow.getUTCFullYear(),
         String(tomorrow.getUTCMonth() + 1).padStart(2, "0"),
         String(tomorrow.getUTCDate()).padStart(2, "0")
     ].join("-");
 };


 // =======================================================
 // CONVERT DATE INTO MONGODB DATE RANGE
 // =======================================================

 const getMongoDateRange = (date) => {

     // Beginning of the appointment date
     const startDate = new Date(
         `${date}T00:00:00.000Z`
     );

     // Beginning of the following date
     const endDate = new Date(startDate);

     endDate.setUTCDate(
         endDate.getUTCDate() + 1
     );

     return {
         startDate,
         endDate
     };
 };


 // =======================================================
 // FORMAT APPOINTMENT DATE FOR EMAIL
 // =======================================================

 const formatAppointmentDate = (date) => {

     return new Date(
         `${date}T12:00:00+05:30`
     ).toLocaleDateString("en-IN", {

         day: "2-digit",
         month: "long",
         year: "numeric",

         timeZone: TIME_ZONE

     });
 };


 // =======================================================
 // SEND REMINDER EMAIL
 // =======================================================

 const sendAppointmentReminderEmail = async (
     patient,
     appointment,
     appointmentDate
 ) => {

     const patientName =
         patient.FullName || "Patient";

     const doctorName =
         appointment.DoctorName || "your doctor";

     const formattedDate =
         formatAppointmentDate(appointmentDate);

     const subject =
         "DermCare - Appointment Reminder for Tomorrow";


     const text = `
 Hello ${patientName},

 This is a reminder that you have a dermatologist appointment tomorrow.

 Doctor: ${doctorName}
 Date: ${formattedDate}
 Time: ${appointment.AppointmentTime}

 Please remember your scheduled appointment.

 You can log in to DermCare using the link below:

 ${PATIENT_LOGIN_URL}

 Regards,
 DermCare Clinic
 `;


     const html = `
     <div style="
         font-family: Arial, sans-serif;
         max-width: 600px;
         margin: auto;
         padding: 25px;
         color: #333;
         border: 1px solid #e5e5e5;
         border-radius: 12px;
     ">

         <h2 style="color: #1769aa;">
             DermCare Appointment Reminder
         </h2>

         <p>Hello ${patientName},</p>

         <p>
             This is a friendly reminder that you have a
             dermatologist appointment
             <strong>tomorrow</strong>.
         </p>

         <div style="
             background: #f3f8fc;
             padding: 18px;
             border-radius: 8px;
             margin: 20px 0;
         ">

             <p>
                 <strong>Doctor:</strong>
                 ${doctorName}
             </p>

             <p>
                 <strong>Date:</strong>
                 ${formattedDate}
             </p>

             <p>
                 <strong>Time:</strong>
                 ${appointment.AppointmentTime}
             </p>

         </div>

         <p>
             Please remember your scheduled appointment.
         </p>

         <a href="${PATIENT_LOGIN_URL}"
             style="
                 display: inline-block;
                 background: #1769aa;
                 color: white;
                 padding: 12px 22px;
                 text-decoration: none;
                 border-radius: 6px;
                 margin-top: 10px;
             ">
             Login to DermCare
         </a>

         <p style="margin-top: 25px;">
             Regards,<br>
             <strong>DermCare Clinic</strong>
         </p>

     </div>
     `;


     return await sendEmail({

         to: patient.Email,

         subject,

         text,

         html

     });

 };


 // =======================================================
 // CREATE DASHBOARD REMINDER NOTIFICATION
 // =======================================================

 const createAppointmentReminderNotification = async (
     patient,
     appointment,
     appointmentDate
 ) => {

     const formattedDate =
         formatAppointmentDate(appointmentDate);

     const doctorName =
         appointment.DoctorName || "your doctor";


     // ==========================================
     // CHECK EXISTING REMINDER NOTIFICATION
     // ==========================================

     const existingNotification =
         await Notification.findOne({

             PatientID: appointment.PatientID,

             AppointmentID: appointment._id,

             Type: "Reminder",

             ReminderForDate: appointmentDate

         });


     if (existingNotification) {

         console.log(
             "Reminder notification already exists:",
             appointment._id
         );

         return;

     }


     // ==========================================
     // CREATE NEW REMINDER NOTIFICATION
     // ==========================================

     try {

         await Notification.create({

             PatientID: appointment.PatientID,

             Title: "Appointment Reminder",

             Message:
                 `Reminder: Your appointment with ${doctorName} is tomorrow, ${formattedDate}, at ${appointment.AppointmentTime}.`,

             Type: "Reminder",

             AppointmentID: appointment._id,

             ReminderForDate: appointmentDate

         });

         console.log(
             "Dashboard reminder notification created"
         );

     } catch (error) {

         // Ignore duplicate-key errors
         // caused by the unique reminder index.

         if (error.code === 11000) {

             console.log(
                 "Duplicate reminder notification prevented"
             );

             return;

         }

         throw error;

     }

 };


 // =======================================================
 // PROCESS TOMORROW'S APPOINTMENTS
 // =======================================================

 const processTomorrowAppointments = async () => {

     const tomorrowDate =
         getTomorrowIndianDate();


     console.log(
         "Checking DermCare reminders for:",
         tomorrowDate
     );


     // ==========================================
     // GET MONGODB DATE RANGE
     // ==========================================

     const {
         startDate,
         endDate
     } = getMongoDateRange(tomorrowDate);


     // ==========================================
     // FIND ACTIVE APPOINTMENTS
     // ==========================================

     // AppointmentDate is stored as MongoDB Date
     // so we search using a date range.

     const appointments = await Appointment.find({

         AppointmentDate: {

             $gte: startDate,

             $lt: endDate

         },

         Status: {

             $in: ["Booked", "Arrived"]

         }

     });


     console.log(
         "Appointments found for reminders:",
         appointments.length
     );


     // ==========================================
     // PROCESS EACH APPOINTMENT
     // ==========================================

     for (const appointment of appointments) {

         try {

             // Find patient details
             const patient = await Patient.findById(
                 appointment.PatientID
             ).select("FullName Email");


             if (!patient) {

                 console.log(
                     "Patient not found:",
                     appointment._id
                 );

                 continue;

             }


             // ======================================
             // SEND EMAIL REMINDER
             // ======================================

             if (
                 patient.Email &&
                 appointment.ReminderEmailSentForDate !==
                 tomorrowDate
             ) {

                 try {

                     await sendAppointmentReminderEmail(
                         patient,
                         appointment,
                         tomorrowDate
                     );


                     // Mark email as sent only after
                     // successful email delivery request.

                     appointment.ReminderEmailSentForDate =
                         tomorrowDate;

                     await appointment.save();


                     console.log(
                         "Reminder email sent:",
                         patient.Email
                     );

                 } catch (emailError) {

                     console.error(
                         "Reminder email failed:",
                         emailError.message
                     );

                 }

             }


             // ======================================
             // CREATE DASHBOARD NOTIFICATION
             // ======================================

             if (
                 appointment.ReminderNotificationSentForDate !==
                 tomorrowDate
             ) {

                 try {

                     await createAppointmentReminderNotification(
                         patient,
                         appointment,
                         tomorrowDate
                     );


                     // Mark notification as processed.

                     appointment.ReminderNotificationSentForDate =
                         tomorrowDate;

                     await appointment.save();


                     console.log(
                         "Reminder notification processed for:",
                         patient.FullName
                     );

                 } catch (notificationError) {

                     console.error(
                         "Reminder notification failed:",
                         notificationError.message
                     );

                 }

             }

         } catch (error) {

             console.error(
                 "Error processing appointment:",
                 appointment._id,
                 error.message
             );

         }

     }

 };


 // =======================================================
 // START REMINDER SCHEDULER
 // Checks every minute during the 9 AM IST hour
 // =======================================================

 let lastReminderRunDate = "";


 const startReminderScheduler = () => {

     console.log("--------------------------------");

     console.log(
         "DermCare reminder scheduler started"
     );

     console.log(
         "Reminder time: 9:00 AM IST"
     );

     console.log("--------------------------------");


     // ==========================================
     // CHECK REMINDER TIME
     // ==========================================

     const checkReminderTime = async () => {

         const today = getIndianDate();

         const {
             hour
         } = getIndianTime();


         // Run once during the 9 AM hour.
         // This also allows recovery if the backend
         // starts a few minutes after 9:00 AM.

         if (
             hour === REMINDER_HOUR &&
             lastReminderRunDate !== today
         ) {

             lastReminderRunDate = today;


             try {

                 await processTomorrowAppointments();

             } catch (error) {

                 console.error(
                     "Reminder scheduler error:",
                     error.message
                 );

             }

         }

     };


     // ==========================================
     // CHECK IMMEDIATELY
     // ==========================================

     checkReminderTime();


     // ==========================================
     // CHECK EVERY MINUTE
     // ==========================================

     setInterval(

         checkReminderTime,

         60 * 1000

     );

 };


 // =======================================================
 // EXPORT SCHEDULER
 // =======================================================

 module.exports = {

     startReminderScheduler,

     processTomorrowAppointments

 };
