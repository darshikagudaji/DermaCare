
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

 // Deployed patient login page
 const PATIENT_LOGIN_URL =
     "https://cosmic-choux-f2f85d.netlify.app/login";

 // Indian Standard Time
 const TIME_ZONE = "Asia/Kolkata";

 // Reminder schedule
 const DAY_BEFORE_REMINDER_HOUR = 9;
 const APPOINTMENT_DAY_REMINDER_HOUR = 7;


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

     const startDate = new Date(
         `${date}T00:00:00.000Z`
     );

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
 // SAFELY ESCAPE VALUES FOR HTML EMAIL
 // =======================================================

 const escapeHtml = (value) => {

     return String(value || "")
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");

 };


 // =======================================================
 // COMMON EMAIL LAYOUT
 // =======================================================

 const createEmailButton = () => {

     return `
         <a href="${PATIENT_LOGIN_URL}"
             style="
                 display: inline-block;
                 background: #1769aa;
                 color: #ffffff;
                 padding: 12px 24px;
                 text-decoration: none;
                 border-radius: 6px;
                 font-weight: bold;
                 margin-top: 12px;
             ">
             Login to DermCare
         </a>
     `;

 };


 // =======================================================
 // SEND DAY-BEFORE APPOINTMENT REMINDER EMAIL
 // Sent at 9:00 AM IST
 // =======================================================

 const sendAppointmentReminderEmail = async (
     patient,
     appointment,
     appointmentDate
 ) => {

     const patientName =
         escapeHtml(patient.FullName || "Patient");

     const doctorName =
         escapeHtml(appointment.DoctorName || "your doctor");

     const formattedDate =
         formatAppointmentDate(appointmentDate);

     const appointmentTime =
         escapeHtml(appointment.AppointmentTime);

     const subject =
         "Reminder: Your DermCare Appointment Is Tomorrow";


     const text = `
Dear ${patient.FullName || "Patient"},

This is a friendly reminder that you have an appointment scheduled for tomorrow with Dr. ${appointment.DoctorName || "your doctor"}.

Appointment Details:
Date: ${formattedDate}
Time: ${appointment.AppointmentTime}

Please make sure to arrive on time for your appointment.

You can log in to your DermCare account to review your appointment details.

Login to DermCare:
${PATIENT_LOGIN_URL}

We look forward to seeing you!

Regards,
DermCare Clinic Team
`;


     const html = `
     <div style="
         font-family: Arial, sans-serif;
         max-width: 600px;
         margin: auto;
         padding: 25px;
         color: #333333;
         border: 1px solid #e5e5e5;
         border-radius: 12px;
         line-height: 1.6;
     ">

         <h2 style="color: #1769aa;">
             Reminder: Your DermCare Appointment Is Tomorrow
         </h2>

         <p>Dear ${patientName},</p>

         <p>
             This is a friendly reminder that you have an
             appointment scheduled for tomorrow with
             Dr. ${doctorName}.
         </p>

         <div style="
             background: #f3f8fc;
             padding: 18px;
             border-radius: 8px;
             margin: 20px 0;
         ">

             <strong>Appointment Details:</strong>

             <p>
                 <strong>Date:</strong>
                 ${formattedDate}
             </p>

             <p>
                 <strong>Time:</strong>
                 ${appointmentTime}
             </p>

         </div>

         <p>
             Please make sure to arrive on time for your appointment.
         </p>

         <p>
             You can log in to your DermCare account to review
             your appointment details.
         </p>

         ${createEmailButton()}

         <p style="margin-top: 25px;">
             We look forward to seeing you!
         </p>

         <p>
             Regards,<br>
             <strong>DermCare Clinic Team</strong>
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
 // SEND APPOINTMENT-DAY REMINDER EMAIL
 // Sent at 7:00 AM IST
 // =======================================================

 const sendAppointmentDayReminderEmail = async (
     patient,
     appointment,
     appointmentDate
 ) => {

     const patientName =
         escapeHtml(patient.FullName || "Patient");

     const doctorName =
         escapeHtml(appointment.DoctorName || "your doctor");

     const formattedDate =
         formatAppointmentDate(appointmentDate);

     const appointmentTime =
         escapeHtml(appointment.AppointmentTime);

     const subject =
         "Your DermCare Appointment Is Today";


     const text = `
Dear ${patient.FullName || "Patient"},

This is a reminder that your appointment with Dr. ${appointment.DoctorName || "your doctor"} is scheduled for today.

Appointment Details:
Date: ${formattedDate}
Time: ${appointment.AppointmentTime}

We kindly request you to arrive on time.

For appointment information, please log in to your DermCare account using the button below.

Login to DermCare:
${PATIENT_LOGIN_URL}

Thank you for choosing DermCare Clinic.

Regards,
DermCare Clinic Team
`;


     const html = `
     <div style="
         font-family: Arial, sans-serif;
         max-width: 600px;
         margin: auto;
         padding: 25px;
         color: #333333;
         border: 1px solid #e5e5e5;
         border-radius: 12px;
         line-height: 1.6;
     ">

         <h2 style="color: #1769aa;">
             Your DermCare Appointment Is Today
         </h2>

         <p>Dear ${patientName},</p>

         <p>
             This is a reminder that your appointment with
             Dr. ${doctorName} is scheduled for today.
         </p>

         <div style="
             background: #f3f8fc;
             padding: 18px;
             border-radius: 8px;
             margin: 20px 0;
         ">

             <strong>Appointment Details:</strong>

             <p>
                 <strong>Date:</strong>
                 ${formattedDate}
             </p>

             <p>
                 <strong>Time:</strong>
                 ${appointmentTime}
             </p>

         </div>

         <p>
             We kindly request you to arrive on time.
         </p>

         <p>
             For appointment information, please log in to
             your DermCare account using the button below.
         </p>

         ${createEmailButton()}

         <p style="margin-top: 25px;">
             Thank you for choosing DermCare Clinic.
         </p>

         <p>
             Regards,<br>
             <strong>DermCare Clinic Team</strong>
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
 // GET ACTIVE APPOINTMENTS FOR A DATE
 // =======================================================

 const getActiveAppointmentsForDate = async (date) => {

     const {
         startDate,
         endDate
     } = getMongoDateRange(date);


     return await Appointment.find({

         AppointmentDate: {
             $gte: startDate,
             $lt: endDate
         },

         Status: {
             $in: ["Booked", "Arrived"]
         }

     });

 };


 // =======================================================
 // PROCESS TOMORROW'S APPOINTMENTS
 // DAY-BEFORE EMAIL AT 9:00 AM IST
 // =======================================================

 const processTomorrowAppointments = async () => {

     const tomorrowDate =
         getTomorrowIndianDate();


     console.log(
         "Checking day-before DermCare reminders for:",
         tomorrowDate
     );


     const appointments =
         await getActiveAppointmentsForDate(tomorrowDate);


     console.log(
         "Appointments found for day-before reminders:",
         appointments.length
     );


     for (const appointment of appointments) {

         try {

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
             // SEND DAY-BEFORE EMAIL
             // ======================================

             if (
                 patient.Email &&
                 appointment.ReminderEmailSentForDate !== tomorrowDate
             ) {

                 try {

                     await sendAppointmentReminderEmail(
                         patient,
                         appointment,
                         tomorrowDate
                     );


                     appointment.ReminderEmailSentForDate =
                         tomorrowDate;

                     await appointment.save();


                     console.log(
                         "Day-before reminder email sent:",
                         patient.Email
                     );

                 } catch (emailError) {

                     console.error(
                         "Day-before reminder email failed:",
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


                     appointment.ReminderNotificationSentForDate =
                         tomorrowDate;

                     await appointment.save();


                     console.log(
                         "Dashboard reminder notification processed for:",
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
                 "Error processing day-before appointment:",
                 appointment._id,
                 error.message
             );

         }

     }

 };


 // =======================================================
 // PROCESS TODAY'S APPOINTMENTS
 // APPOINTMENT-DAY EMAIL AT 7:00 AM IST
 // =======================================================

 const processTodayAppointments = async () => {

     const todayDate =
         getIndianDate();


     console.log(
         "Checking appointment-day DermCare reminders for:",
         todayDate
     );


     const appointments =
         await getActiveAppointmentsForDate(todayDate);


     console.log(
         "Appointments found for appointment-day reminders:",
         appointments.length
     );


     for (const appointment of appointments) {

         try {

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
             // SEND APPOINTMENT-DAY EMAIL
             // ======================================

             if (
                 patient.Email &&
                 appointment.AppointmentDayReminderEmailSentForDate !==
                 todayDate
             ) {

                 try {

                     await sendAppointmentDayReminderEmail(
                         patient,
                         appointment,
                         todayDate
                     );


                     appointment.AppointmentDayReminderEmailSentForDate =
                         todayDate;

                     await appointment.save();


                     console.log(
                         "Appointment-day reminder email sent:",
                         patient.Email
                     );

                 } catch (emailError) {

                     console.error(
                         "Appointment-day reminder email failed:",
                         emailError.message
                     );

                 }

             }

         } catch (error) {

             console.error(
                 "Error processing appointment-day reminder:",
                 appointment._id,
                 error.message
             );

         }

     }

 };


 // =======================================================
 // START REMINDER SCHEDULER
 // =======================================================

 let lastDayBeforeReminderRunDate = "";
 let lastAppointmentDayReminderRunDate = "";


 const startReminderScheduler = () => {

     console.log("--------------------------------");

     console.log(
         "DermCare reminder scheduler started"
     );

     console.log(
         "Day-before reminder time: 9:00 AM IST"
     );

     console.log(
         "Appointment-day reminder time: 7:00 AM IST"
     );

     console.log("--------------------------------");


     // ==========================================
     // CHECK REMINDER TIMES
     // ==========================================

     const checkReminderTime = async () => {

         const today = getIndianDate();

         const {
             hour
         } = getIndianTime();


         // ======================================
         // 7 AM: APPOINTMENT-DAY REMINDER
         // ======================================

         if (
             hour === APPOINTMENT_DAY_REMINDER_HOUR &&
             lastAppointmentDayReminderRunDate !== today
         ) {

             lastAppointmentDayReminderRunDate = today;


             try {

                 await processTodayAppointments();

             } catch (error) {

                 console.error(
                     "Appointment-day reminder scheduler error:",
                     error.message
                 );

             }

         }


         // ======================================
         // 9 AM: DAY-BEFORE REMINDER
         // ======================================

         if (
             hour === DAY_BEFORE_REMINDER_HOUR &&
             lastDayBeforeReminderRunDate !== today
         ) {

             lastDayBeforeReminderRunDate = today;


             try {

                 await processTomorrowAppointments();

             } catch (error) {

                 console.error(
                     "Day-before reminder scheduler error:",
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

     processTomorrowAppointments,

     processTodayAppointments

 };
