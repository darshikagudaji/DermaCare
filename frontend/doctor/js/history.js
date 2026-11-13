/* =========================================================
   DERMCARE - DOCTOR HISTORY JAVASCRIPT
   File: doctor/js/history.js

   Features:
   1. Completed Appointments
   2. Prescriptions Given
   3. View, Download and Print saved prescriptions
   4. Diagnosis, Clinical Notes and Medicine Instructions
   5. Advice, Follow-up Date and prescription formatting
   6. Mobile sidebar and logout
========================================================= */

(() => {
    "use strict";

    if (window.dermCareHistoryInitialized) {
        console.warn("DermCare History JavaScript is already initialized.");
        return;
    }

    window.dermCareHistoryInitialized = true;

    const API_BASE_URL = "http://localhost:5000/api";
    const APPOINTMENT_API_URL = `${API_BASE_URL}/appointments`;
    const PRESCRIPTION_API_URL = `${API_BASE_URL}/prescriptions`;

    const loggedInDoctor = (() => {
        try {
            return JSON.parse(localStorage.getItem("doctor") || "null");
        } catch (error) {
            console.error("Unable to read logged-in doctor:", error);
            return null;
        }
    })();

    function getLoggedInDoctorId() {
        return loggedInDoctor?._id ||
            loggedInDoctor?.id ||
            loggedInDoctor?.DoctorID ||
            loggedInDoctor?.doctorId ||
            "";
    }

    const doctorId = getLoggedInDoctorId();

    if (!loggedInDoctor || !doctorId) {
        window.location.href = "doctor-login.html";
        return;
    }

    // ---------------------------------------------------------
    // ELEMENTS
    // ---------------------------------------------------------

    const historyHome = document.getElementById("historyHome");
    const completedView = document.getElementById("completedView");
    const prescriptionsView = document.getElementById("prescriptionsView");

    const openCompletedButton = document.getElementById("openCompleted");
    const openPrescriptionsButton = document.getElementById("openPrescriptions");

    const backFromCompletedButton =
        document.getElementById("backFromCompleted");

    const backFromPrescriptionsButton =
        document.getElementById("backFromPrescriptions");

    const completedCount = document.getElementById("completedCount");
    const prescriptionCount = document.getElementById("prescriptionCount");

    const completedAppointmentsBody =
        document.getElementById("completedAppointmentsBody");

    const prescriptionsBody = document.getElementById("prescriptionsBody");
    const historyNotice = document.getElementById("historyNotice");

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const logoutLink = document.getElementById("logoutLink");

    let completedAppointments = [];
    let savedPrescriptions = [];

    // ---------------------------------------------------------
    // GENERAL HELPERS
    // ---------------------------------------------------------

    function normalizeArray(response) {
        if (Array.isArray(response)) return response;

        if (Array.isArray(response?.appointments)) {
            return response.appointments;
        }

        if (Array.isArray(response?.prescriptions)) {
            return response.prescriptions;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        return [];
    }

    async function fetchJson(url) {
        const response = await fetch(url);

        let data;

        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                `Request failed (${response.status}).`
            );
        }

        return data;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getId(value) {
        if (!value) return "";

        if (typeof value === "object") {
            return String(value._id || value.id || value.toString?.() || "");
        }

        return String(value);
    }

    function getPatientName(record) {
        const patient =
            record?.PatientID ||
            record?.patientId ||
            record?.Patient ||
            record?.patient ||
            {};

        if (typeof patient === "object") {
            return patient.FullName ||
                patient.fullName ||
                patient.Name ||
                patient.name ||
                "Patient";
        }

        return record?.PatientName || record?.patientName || "Patient";
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return String(value);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatTime(value) {
        if (!value) return "—";

        const text = String(value).trim();
        const match = text.match(/^(\d{1,2}):(\d{2})/);

        if (!match) return text;

        let hours = Number(match[1]);
        const minutes = match[2];
        const period = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;

        return `${hours}:${minutes} ${period}`;
    }

    function getAppointmentDate(appointment) {
        const populatedAppointment =
            appointment?.AppointmentID &&
            typeof appointment.AppointmentID === "object"
                ? appointment.AppointmentID
                : null;

        return appointment?.AppointmentDate ||
            populatedAppointment?.AppointmentDate ||
            appointment?.appointmentDate ||
            null;
    }

    function getAppointmentTime(appointment) {
        const populatedAppointment =
            appointment?.AppointmentID &&
            typeof appointment.AppointmentID === "object"
                ? appointment.AppointmentID
                : null;

        return appointment?.AppointmentTime ||
            populatedAppointment?.AppointmentTime ||
            appointment?.appointmentTime ||
            "";
    }

    function getAppointmentType(appointment) {
        const populatedAppointment =
            appointment?.AppointmentID &&
            typeof appointment.AppointmentID === "object"
                ? appointment.AppointmentID
                : null;

        return appointment?.AppointmentType ||
            populatedAppointment?.AppointmentType ||
            appointment?.appointmentType ||
            "Online";
    }

    function showNotice(message, isError = false) {
        if (!historyNotice) return;

        historyNotice.textContent = message;
        historyNotice.hidden = false;
        historyNotice.classList.toggle("error", isError);
    }

    function hideNotice() {
        if (!historyNotice) return;

        historyNotice.hidden = true;
        historyNotice.textContent = "";
        historyNotice.classList.remove("error");
    }

    function setTableMessage(tbody, message, columnCount = 5) {
        if (!tbody) return;

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = columnCount;
        cell.className = "history-message";
        cell.textContent = message;

        row.appendChild(cell);
        tbody.replaceChildren(row);
    }

    function createCell(text, className = "") {
        const cell = document.createElement("td");
        cell.textContent = text ?? "";

        if (className) cell.className = className;

        return cell;
    }

    function isSameId(first, second) {
        return getId(first) !== "" && getId(first) === getId(second);
    }

    // ---------------------------------------------------------
    // HISTORY CARD / LIST NAVIGATION
    // ---------------------------------------------------------

    function showHistoryHome() {
        if (historyHome) historyHome.hidden = false;
        if (completedView) completedView.hidden = true;
        if (prescriptionsView) prescriptionsView.hidden = true;

        hideNotice();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showCompletedView() {
        if (historyHome) historyHome.hidden = true;
        if (completedView) completedView.hidden = false;
        if (prescriptionsView) prescriptionsView.hidden = true;

        hideNotice();
        loadCompletedAppointments();

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showPrescriptionsView() {
        if (historyHome) historyHome.hidden = true;
        if (completedView) completedView.hidden = true;
        if (prescriptionsView) prescriptionsView.hidden = false;

        hideNotice();
        loadSavedPrescriptions();

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    openCompletedButton?.addEventListener("click", showCompletedView);
    openPrescriptionsButton?.addEventListener("click", showPrescriptionsView);

    backFromCompletedButton?.addEventListener("click", showHistoryHome);
    backFromPrescriptionsButton?.addEventListener("click", showHistoryHome);

    // ---------------------------------------------------------
    // LOAD COMPLETED APPOINTMENTS
    // Completed appointments appear even without prescriptions.
    // ---------------------------------------------------------

    async function loadCompletedAppointments() {
        setTableMessage(
            completedAppointmentsBody,
            "Loading completed appointments...",
            5
        );

        try {
            const result = await fetchJson(
                `${APPOINTMENT_API_URL}/doctor/${encodeURIComponent(doctorId)}`
            );

            const appointments = normalizeArray(result);

            completedAppointments = appointments.filter((appointment) => {
                const appointmentDoctor =
                    appointment.DoctorID ||
                    appointment.doctorId ||
                    appointment.Doctor ||
                    appointment.doctor;

                return isSameId(appointmentDoctor, doctorId) &&
                    String(appointment.Status || appointment.status || "")
                        .toLowerCase() === "completed";
            });

            completedAppointments.sort((a, b) => {
                const dateA = new Date(getAppointmentDate(a) || 0).getTime();
                const dateB = new Date(getAppointmentDate(b) || 0).getTime();
                return dateB - dateA;
            });

            if (completedCount) {
                completedCount.textContent = String(
                    completedAppointments.length
                );
            }

            renderCompletedAppointments();
        } catch (error) {
            console.error("Error loading completed appointments:", error);

            setTableMessage(
                completedAppointmentsBody,
                "Unable to load completed appointments. Please try again.",
                5
            );

            showNotice(error.message || "Unable to load appointments.", true);
        }
    }

    // ---------------------------------------------------------
    // RENDER COMPLETED APPOINTMENTS
    // Mode and Status are deliberately rendered in separate TDs:
    // Mode   = Online / Walk-in badge
    // Status = Completed badge with check icon
    // ---------------------------------------------------------

    function renderCompletedAppointments() {
        if (!completedAppointmentsBody) return;

        if (completedAppointments.length === 0) {
            setTableMessage(
                completedAppointmentsBody,
                "No completed appointments found.",
                5
            );
            return;
        }

        const fragment = document.createDocumentFragment();

        completedAppointments.forEach((appointment) => {
            const row = document.createElement("tr");

            // Column 1: Patient Name
            row.appendChild(createCell(getPatientName(appointment)));

            // Column 2: Appointment Date
            row.appendChild(
                createCell(formatDate(getAppointmentDate(appointment)))
            );

            // Column 3: Time
            row.appendChild(
                createCell(formatTime(getAppointmentTime(appointment)))
            );

            // Column 4: Mode badge
            const appointmentType = getAppointmentType(appointment);
            const normalizedType = String(appointmentType).trim().toLowerCase();
            const isWalkIn = normalizedType === "walk-in" ||
                normalizedType === "walkin" ||
                normalizedType === "walk in";

            const modeCell = document.createElement("td");
            modeCell.className = "history-mode-cell";

            const modeBadge = document.createElement("span");
            modeBadge.className = `history-mode ${isWalkIn ? "walkin" : "online"}`;
            modeBadge.textContent = isWalkIn ? "Walk-in" : appointmentType;

            modeCell.appendChild(modeBadge);
            row.appendChild(modeCell);

            // Column 5: Status badge (separate from Mode)
            const statusCell = document.createElement("td");
            statusCell.className = "history-status-cell";

            const statusBadge = document.createElement("span");
            statusBadge.className = "history-status";

            const statusIcon = document.createElement("i");
            statusIcon.className = "bi bi-check-circle-fill";
            statusIcon.setAttribute("aria-hidden", "true");

            const statusText = document.createElement("span");
            statusText.textContent =
                appointment.Status || appointment.status || "Completed";

            statusBadge.append(statusIcon, statusText);
            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);

            fragment.appendChild(row);
        });

        completedAppointmentsBody.replaceChildren(fragment);
    }

    // ---------------------------------------------------------
    // LOAD SAVED PRESCRIPTIONS
    // GET /api/prescriptions/doctor/:doctorId
    // ---------------------------------------------------------

    async function loadSavedPrescriptions() {
        setTableMessage(
            prescriptionsBody,
            "Loading saved prescriptions...",
            5
        );

        try {
            const result = await fetchJson(
                `${PRESCRIPTION_API_URL}/doctor/${encodeURIComponent(doctorId)}`
            );

            const prescriptions = normalizeArray(result);

            savedPrescriptions = prescriptions.filter((prescription) => {
                const prescriptionDoctor =
                    prescription.DoctorID ||
                    prescription.doctorId ||
                    prescription.Doctor ||
                    prescription.doctor;

                return isSameId(prescriptionDoctor, doctorId);
            });

            savedPrescriptions.sort((a, b) => {
                const dateA = new Date(
                    a.createdAt || a.created_at || 0
                ).getTime();

                const dateB = new Date(
                    b.createdAt || b.created_at || 0
                ).getTime();

                return dateB - dateA;
            });

            if (prescriptionCount) {
                prescriptionCount.textContent = String(
                    savedPrescriptions.length
                );
            }

            renderSavedPrescriptions();
        } catch (error) {
            console.error("Error loading saved prescriptions:", error);

            setTableMessage(
                prescriptionsBody,
                "Unable to load prescriptions. Please try again.",
                5
            );

            showNotice(
                "Prescription history could not be loaded. Please check the prescription API.",
                true
            );
        }
    }

    function renderSavedPrescriptions() {
        if (!prescriptionsBody) return;

        if (savedPrescriptions.length === 0) {
            setTableMessage(
                prescriptionsBody,
                "No saved prescriptions found.",
                5
            );
            return;
        }

        const fragment = document.createDocumentFragment();

        savedPrescriptions.forEach((prescription, index) => {
            const row = document.createElement("tr");

            row.appendChild(createCell(getPatientName(prescription)));
            row.appendChild(createCell(
                formatDate(getAppointmentDate(prescription))
            ));
            row.appendChild(createCell(
                formatDate(getPrescriptionDate(prescription))
            ));
            row.appendChild(createCell(
                formatDate(getFollowUpDate(prescription))
            ));

            const actionsCell = document.createElement("td");
            actionsCell.className = "history-actions";

            const viewButton = createActionButton(
                "View",
                "bi-eye",
                "history-view-btn",
                () => {
                    try {
                        viewPrescription(prescription);
                    } catch (error) {
                        console.error("Unable to display prescription:", error);
                        showNotice(
                            "Unable to open this prescription. Please check the browser console.",
                            true
                        );
                    }
                }
            );

            const downloadButton = createActionButton(
                "Download",
                "bi-download",
                "history-download-btn",
                () => downloadPrescription(prescription, index)
            );

            const printButton = createActionButton(
                "Print",
                "bi-printer",
                "history-print-btn",
                () => printPrescription(prescription)
            );

            actionsCell.append(viewButton, downloadButton, printButton);
            row.appendChild(actionsCell);
            fragment.appendChild(row);
        });

        prescriptionsBody.replaceChildren(fragment);
    }

    function createActionButton(label, iconClass, className, onClick) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = `history-action-btn ${className}`;

        const icon = document.createElement("i");
        icon.className = `bi ${iconClass}`;
        icon.setAttribute("aria-hidden", "true");

        const text = document.createElement("span");
        text.textContent = label;

        button.append(icon, text);
        button.addEventListener("click", onClick);

        return button;
    }

    // ---------------------------------------------------------
    // PRESCRIPTION DATA HELPERS
    // ---------------------------------------------------------

    function parseMedicines(prescription) {
        const rawMedicines =
            prescription.Medicines ||
            prescription.medicines ||
            [];

        if (Array.isArray(rawMedicines)) return rawMedicines;

        if (typeof rawMedicines === "string") {
            try {
                const parsed = JSON.parse(rawMedicines);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                return [];
            }
        }

        return [];
    }

    function getInstructions(prescription) {
        return prescription.Instructions ||
            prescription.instructions ||
            "";
    }

    function getFollowUpDate(prescription) {
        return prescription.FollowUpDate ||
            prescription.followUpDate ||
            null;
    }

    function getPrescriptionDate(prescription) {
        return prescription.createdAt ||
            prescription.created_at ||
            prescription.updatedAt ||
            null;
    }

    /*
       Existing backend stores diagnosis, clinical notes, advice
       and medicine-specific instructions in one Instructions string.

       This helper extracts those sections without changing the
       saved prescription or the backend data.
    */
    function parseInstructionSections(instructionText) {
        const result = {
            diagnosis: "",
            clinicalNotes: "",
            generalInstructions: "",
            advice: "",
            medicineInstructions: []
        };

        if (!instructionText) return result;

        const lines = String(instructionText)
            .replace(/\r/g, "")
            .split("\n");

        let currentSection = "";

        lines.forEach((line) => {
            const trimmed = line.trim();

            if (/^Diagnosis\s*:/i.test(trimmed)) {
                currentSection = "diagnosis";
                result.diagnosis = trimmed.replace(/^Diagnosis\s*:/i, "").trim();
                return;
            }

            if (/^Clinical Notes\s*:/i.test(trimmed)) {
                currentSection = "clinicalNotes";
                result.clinicalNotes =
                    trimmed.replace(/^Clinical Notes\s*:/i, "").trim();
                return;
            }

            if (/^Instructions\s*:/i.test(trimmed)) {
                currentSection = "generalInstructions";
                result.generalInstructions =
                    trimmed.replace(/^Instructions\s*:/i, "").trim();
                return;
            }

            if (/^Advice\s*:/i.test(trimmed)) {
                currentSection = "advice";
                result.advice = trimmed.replace(/^Advice\s*:/i, "").trim();
                return;
            }

            const medicineMatch = trimmed.match(/^(.+?)\s*:\s*(.*)$/);

            if (
                medicineMatch &&
                !/^(Diagnosis|Clinical Notes|Instructions|Advice)\s*:/i
                    .test(trimmed)
            ) {
                const medicineName = medicineMatch[1].trim();
                const medicineText = medicineMatch[2].trim();

                if (medicineName && medicineText) {
                    result.medicineInstructions.push({
                        medicineName,
                        instructions: medicineText
                    });

                    currentSection = "medicineInstructions";
                    return;
                }
            }

            if (!trimmed) {
                if (currentSection === "diagnosis") {
                    result.diagnosis += "\n";
                } else if (currentSection === "clinicalNotes") {
                    result.clinicalNotes += "\n";
                } else if (currentSection === "generalInstructions") {
                    result.generalInstructions += "\n";
                } else if (currentSection === "advice") {
                    result.advice += "\n";
                }
                return;
            }

            if (currentSection === "diagnosis") {
                result.diagnosis += (result.diagnosis ? "\n" : "") + trimmed;
            } else if (currentSection === "clinicalNotes") {
                result.clinicalNotes +=
                    (result.clinicalNotes ? "\n" : "") + trimmed;
            } else if (currentSection === "generalInstructions") {
                result.generalInstructions +=
                    (result.generalInstructions ? "\n" : "") + trimmed;
            } else if (currentSection === "advice") {
                result.advice += (result.advice ? "\n" : "") + trimmed;
            } else if (currentSection === "medicineInstructions") {
                const last = result.medicineInstructions[
                    result.medicineInstructions.length - 1
                ];

                if (last) last.instructions += "\n" + trimmed;
            }
        });

        return result;
    }

    function getPrescriptionDetails(prescription) {
        const patient =
            prescription.PatientID &&
            typeof prescription.PatientID === "object"
                ? prescription.PatientID
                : {};

        const appointment =
            prescription.AppointmentID &&
            typeof prescription.AppointmentID === "object"
                ? prescription.AppointmentID
                : {};

        const rawInstructions = getInstructions(prescription);

        return {
            patientName: getPatientName(prescription),
            patientEmail: patient.Email || patient.email || "",
            patientMobile:
                patient["Mobile No"] ||
                patient.MobileNo ||
                patient.mobile ||
                "",
            appointmentDate: formatDate(
                appointment.AppointmentDate ||
                prescription.AppointmentDate ||
                prescription.appointmentDate
            ),
            appointmentTime: formatTime(
                appointment.AppointmentTime ||
                prescription.AppointmentTime ||
                prescription.appointmentTime
            ),
            prescriptionDate: formatDate(getPrescriptionDate(prescription)),
            followUpDate: formatDate(getFollowUpDate(prescription)),
            medicines: parseMedicines(prescription),
            instructions: rawInstructions,
            sections: parseInstructionSections(rawInstructions)
        };
    }

    function getMedicineValue(medicine, lowerKey, upperKey) {
        return medicine?.[lowerKey] ||
            medicine?.[upperKey] ||
            "—";
    }

    function getMedicineInstructions(medicine, sections) {
        const name = String(
            medicine?.medicineName ||
            medicine?.MedicineName ||
            ""
        ).trim();

        const matched = sections.medicineInstructions.find((item) =>
            item.medicineName.toLowerCase() === name.toLowerCase()
        );

        return medicine?.instructions ||
            medicine?.Instructions ||
            medicine?.medicineInstructions ||
            medicine?.MedicineInstructions ||
            matched?.instructions ||
            "—";
    }

    // ---------------------------------------------------------
    // VIEW PRESCRIPTION
    // ---------------------------------------------------------

    function viewPrescription(prescription) {
        const details = getPrescriptionDetails(prescription);

        document.getElementById("historyPrescriptionModal")?.remove();

        const modal = document.createElement("div");
        modal.id = "historyPrescriptionModal";
        modal.className = "history-modal active";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-label", "Saved prescription");

        const modalContent = document.createElement("div");
        modalContent.className = "history-modal-content";

        const header = document.createElement("div");
        header.className = "history-modal-header";

        const heading = document.createElement("h2");
        heading.textContent = "Saved Prescription";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "history-modal-close";
        closeButton.innerHTML = "&times;";
        closeButton.setAttribute("aria-label", "Close prescription");
        closeButton.addEventListener("click", () => modal.remove());

        header.append(heading, closeButton);

        const content = document.createElement("div");
        content.className = "history-prescription-content";

        const clinicHeading = document.createElement("h3");
        clinicHeading.textContent = "DermCare Skin & Hair Clinic";
        content.appendChild(clinicHeading);

        appendSectionHeading(content, "Patient Details");
        addDetailLine(content, "Patient Name", details.patientName);

        if (details.patientEmail) {
            addDetailLine(content, "Email", details.patientEmail);
        }

        if (details.patientMobile) {
            addDetailLine(content, "Mobile", details.patientMobile);
        }

        appendSectionHeading(content, "Appointment Details");
        addDetailLine(content, "Appointment Date", details.appointmentDate);
        addDetailLine(content, "Appointment Time", details.appointmentTime);
        addDetailLine(content, "Prescription Date", details.prescriptionDate);

        appendSectionHeading(content, "Diagnosis");
        appendPrescriptionText(
            content,
            details.sections.diagnosis,
            "history-diagnosis"
        );

        appendSectionHeading(content, "Clinical Notes");
        appendPrescriptionText(
            content,
            details.sections.clinicalNotes,
            "history-clinical-notes"
        );

        appendSectionHeading(content, "Prescribed Medicines");

        if (details.medicines.length > 0) {
            const medicineTable = document.createElement("table");
            medicineTable.className = "history-prescription-medicine-table";

            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");

            [
                "No.",
                "Medicine",
                "Dosage",
                "Frequency",
                "Duration",
                "Medicine Instructions"
            ].forEach((label) => {
                const th = document.createElement("th");
                th.textContent = label;
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);

            const tbody = document.createElement("tbody");

            details.medicines.forEach((medicine, index) => {
                const row = document.createElement("tr");

                row.appendChild(createCell(String(index + 1)));
                row.appendChild(createCell(
                    getMedicineValue(medicine, "medicineName", "MedicineName")
                ));
                row.appendChild(createCell(
                    getMedicineValue(medicine, "dosage", "Dosage")
                ));
                row.appendChild(createCell(
                    getMedicineValue(medicine, "frequency", "Frequency")
                ));
                row.appendChild(createCell(
                    getMedicineValue(medicine, "duration", "Duration")
                ));

                const instructionsCell = createCell(
                    getMedicineInstructions(medicine, details.sections)
                );

                instructionsCell.className = "history-medicine-instructions";

                row.appendChild(instructionsCell);
                tbody.appendChild(row);
            });

            medicineTable.append(thead, tbody);
            content.appendChild(medicineTable);
        } else {
            appendPrescriptionText(
                content,
                "No medicine details available.",
                "history-empty-medicines"
            );
        }

        appendSectionHeading(content, "Advice & Instructions");

        const adviceText = [
            details.sections.generalInstructions,
            details.sections.advice
        ].filter(Boolean).join("\n\n");

        appendPrescriptionText(
            content,
            adviceText || "No additional advice or instructions saved.",
            "history-advice"
        );

        appendSectionHeading(content, "Follow-up");

        const followUp = document.createElement("p");
        followUp.className = "history-follow-up";
        followUp.style.textAlign = "left";

        const followUpLabel = document.createElement("strong");
        followUpLabel.textContent = "Follow-up Date: ";

        const followUpValue = document.createElement("span");
        followUpValue.textContent = details.followUpDate;

        followUp.append(followUpLabel, followUpValue);
        content.appendChild(followUp);

        modalContent.append(header, content);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) modal.remove();
        });

        const closeOnEscape = (event) => {
            if (event.key === "Escape" && document.body.contains(modal)) {
                modal.remove();
                document.removeEventListener("keydown", closeOnEscape);
            }
        };

        document.addEventListener("keydown", closeOnEscape);
        closeButton.focus();
    }

    function appendSectionHeading(container, text) {
        const heading = document.createElement("h4");
        heading.textContent = text;
        container.appendChild(heading);
    }

    function appendPrescriptionText(container, text, className = "") {
        const paragraph = document.createElement("p");

        if (className) paragraph.className = className;

        paragraph.style.textAlign = "left";
        paragraph.style.whiteSpace = "pre-wrap";
        paragraph.textContent = text || "—";

        container.appendChild(paragraph);
    }

    function addDetailLine(container, label, value) {
        const paragraph = document.createElement("p");
        paragraph.className = "history-detail-line";
        paragraph.style.textAlign = "left";

        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;

        const span = document.createElement("span");
        span.textContent = value || "—";

        paragraph.append(strong, span);
        container.appendChild(paragraph);
    }

    // ---------------------------------------------------------
    // DOWNLOAD PRESCRIPTION
    // ---------------------------------------------------------

    function downloadPrescription(prescription, index) {
        const details = getPrescriptionDetails(prescription);

        const medicinesHtml = details.medicines.length
            ? details.medicines.map((medicine, medicineIndex) => `
                <tr>
                    <td>${medicineIndex + 1}</td>
                    <td>${escapeHtml(
                        getMedicineValue(medicine, "medicineName", "MedicineName")
                    )}</td>
                    <td>${escapeHtml(
                        getMedicineValue(medicine, "dosage", "Dosage")
                    )}</td>
                    <td>${escapeHtml(
                        getMedicineValue(medicine, "frequency", "Frequency")
                    )}</td>
                    <td>${escapeHtml(
                        getMedicineValue(medicine, "duration", "Duration")
                    )}</td>
                    <td>${escapeHtml(
                        getMedicineInstructions(medicine, details.sections)
                    )}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="6">No medicine details available.</td></tr>`;

        const diagnosisHtml = escapeHtml(
            details.sections.diagnosis || "—"
        ).replace(/\n/g, "<br>");

        const clinicalNotesHtml = escapeHtml(
            details.sections.clinicalNotes || "—"
        ).replace(/\n/g, "<br>");

        const adviceText = [
            details.sections.generalInstructions,
            details.sections.advice
        ].filter(Boolean).join("\n\n");

        const adviceHtml = escapeHtml(
            adviceText || "No additional advice or instructions saved."
        ).replace(/\n/g, "<br>");

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DermCare Prescription - ${escapeHtml(details.patientName)}</title>
<style>
    * { box-sizing: border-box; }
    body {
        font-family: Arial, sans-serif;
        max-width: 1060px;
        margin: 30px auto;
        padding: 24px;
        color: #1f2937;
        line-height: 1.6;
    }
    h1 { color: #0B6FB8; margin-bottom: 4px; }
    h2 {
        font-size: 18px;
        color: #111827;
        border-bottom: 1px solid #d6e0ee;
        padding-bottom: 7px;
        margin-top: 24px;
    }
    p { text-align: left; margin: 7px 0; white-space: pre-wrap; }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        table-layout: fixed;
    }
    th, td {
        border: 1px solid #cbd5e1;
        padding: 9px;
        text-align: left;
        vertical-align: top;
        overflow-wrap: anywhere;
    }
    th { background: #f1f5f9; }
    @media print {
        body { margin: 0; padding: 10px; }
        tr { page-break-inside: avoid; }
    }
</style>
</head>
<body>
    <h1>DermCare Skin &amp; Hair Clinic</h1>
    <p><strong>Prescription</strong></p>

    <h2>Patient Details</h2>
    <p><strong>Patient Name:</strong> ${escapeHtml(details.patientName)}</p>
    ${details.patientEmail
        ? `<p><strong>Email:</strong> ${escapeHtml(details.patientEmail)}</p>`
        : ""}
    ${details.patientMobile
        ? `<p><strong>Mobile:</strong> ${escapeHtml(details.patientMobile)}</p>`
        : ""}

    <h2>Appointment Details</h2>
    <p><strong>Appointment Date:</strong> ${escapeHtml(details.appointmentDate)}</p>
    <p><strong>Appointment Time:</strong> ${escapeHtml(details.appointmentTime)}</p>
    <p><strong>Prescription Date:</strong> ${escapeHtml(details.prescriptionDate)}</p>

    <h2>Diagnosis</h2>
    <p>${diagnosisHtml}</p>

    <h2>Clinical Notes</h2>
    <p>${clinicalNotesHtml}</p>

    <h2>Prescribed Medicines</h2>
    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Medicine Instructions</th>
            </tr>
        </thead>
        <tbody>${medicinesHtml}</tbody>
    </table>

    <h2>Advice &amp; Instructions</h2>
    <p>${adviceHtml}</p>

    <h2>Follow-up</h2>
    <p><strong>Follow-up Date:</strong> ${escapeHtml(details.followUpDate)}</p>
</body>
</html>`;

        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        const safePatientName = details.patientName
            .replace(/[^a-z0-9_-]/gi, "_")
            .slice(0, 50) || "Patient";

        link.href = url;
        link.download =
            `DermCare-Prescription-${safePatientName}-${index + 1}.html`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // ---------------------------------------------------------
    // PRINT PRESCRIPTION
    // ---------------------------------------------------------

    function printPrescription(prescription) {
        const details = getPrescriptionDetails(prescription);
        const printWindow = window.open("", "_blank", "width=900,height=750");

        if (!printWindow) {
            showNotice(
                "The print window was blocked. Please allow pop-ups and try again.",
                true
            );
            return;
        }

        const medicinesHtml = details.medicines.length
            ? details.medicines.map((medicine, medicineIndex) => `
                <tr>
                    <td>${medicineIndex + 1}</td>
                    <td>${escapeHtml(
                        getMedicineValue(medicine, "medicineName", "MedicineName")
                    )}</td>
                    <td>${escapeHtml(
                        getMedicineValue(medicine, "dosage", "Dosage")
                    )}</td>
                    <td>${escapeHtml(
                        getMedicineValue(medicine, "frequency", "Frequency")
                    )}</td>
                    <td>${escapeHtml(
                        getMedicineValue(medicine, "duration", "Duration")
                    )}</td>
                    <td>${escapeHtml(
                        getMedicineInstructions(medicine, details.sections)
                    )}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="6">No medicine details available.</td></tr>`;

        const diagnosisHtml = escapeHtml(
            details.sections.diagnosis || "—"
        ).replace(/\n/g, "<br>");

        const clinicalNotesHtml = escapeHtml(
            details.sections.clinicalNotes || "—"
        ).replace(/\n/g, "<br>");

        const adviceText = [
            details.sections.generalInstructions,
            details.sections.advice
        ].filter(Boolean).join("\n\n");

        const adviceHtml = escapeHtml(
            adviceText || "No additional advice or instructions saved."
        ).replace(/\n/g, "<br>");

        printWindow.document.open();
        printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>DermCare Prescription</title>
<style>
    * { box-sizing: border-box; }
    body {
        font-family: Arial, sans-serif;
        color: #222;
        max-width: 1060px;
        margin: 25px auto;
        padding: 20px;
        line-height: 1.6;
    }
    h1 { color: #0B6FB8; margin-bottom: 4px; }
    h2 {
        color: #111827;
        font-size: 17px;
        border-bottom: 1px solid #d6e0ee;
        padding-bottom: 6px;
        margin-top: 22px;
    }
    p { text-align: left; margin: 6px 0; white-space: pre-wrap; }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
        table-layout: fixed;
    }
    th, td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
        vertical-align: top;
        overflow-wrap: anywhere;
    }
    th { background: #eff6ff; }
    @media print {
        body { margin: 0; padding: 8px; }
        tr { page-break-inside: avoid; }
    }
</style>
</head>
<body>
    <h1>DermCare Skin &amp; Hair Clinic</h1>
    <p><strong>Prescription</strong></p>

    <h2>Patient Details</h2>
    <p><strong>Patient Name:</strong> ${escapeHtml(details.patientName)}</p>
    ${details.patientEmail
        ? `<p><strong>Email:</strong> ${escapeHtml(details.patientEmail)}</p>`
        : ""}
    ${details.patientMobile
        ? `<p><strong>Mobile:</strong> ${escapeHtml(details.patientMobile)}</p>`
        : ""}

    <h2>Appointment Details</h2>
    <p><strong>Appointment Date:</strong> ${escapeHtml(details.appointmentDate)}</p>
    <p><strong>Appointment Time:</strong> ${escapeHtml(details.appointmentTime)}</p>
    <p><strong>Prescription Date:</strong> ${escapeHtml(details.prescriptionDate)}</p>

    <h2>Diagnosis</h2>
    <p>${diagnosisHtml}</p>

    <h2>Clinical Notes</h2>
    <p>${clinicalNotesHtml}</p>

    <h2>Prescribed Medicines</h2>
    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Medicine Instructions</th>
            </tr>
        </thead>
        <tbody>${medicinesHtml}</tbody>
    </table>

    <h2>Advice &amp; Instructions</h2>
    <p>${adviceHtml}</p>

    <h2>Follow-up</h2>
    <p><strong>Follow-up Date:</strong> ${escapeHtml(details.followUpDate)}</p>
</body>
</html>`);
        printWindow.document.close();

        printWindow.addEventListener("load", () => {
            printWindow.focus();
            printWindow.print();
        });
    }

    // ---------------------------------------------------------
    // MOBILE SIDEBAR
    // ---------------------------------------------------------

    function openSidebar() {
        sidebar?.classList.add("active");
        overlay?.classList.add("active");

        if (menuToggle) {
            menuToggle.classList.add("active");

            const icon = menuToggle.querySelector("i");

            if (icon) {
                icon.classList.remove("bi-list");
                icon.classList.add("bi-x-lg");
            }

            menuToggle.setAttribute("aria-expanded", "true");
        }
    }

    function closeSidebar() {
        sidebar?.classList.remove("active");
        overlay?.classList.remove("active");

        if (menuToggle) {
            menuToggle.classList.remove("active");

            const icon = menuToggle.querySelector("i");

            if (icon) {
                icon.classList.remove("bi-x-lg");
                icon.classList.add("bi-list");
            }

            menuToggle.setAttribute("aria-expanded", "false");
        }
    }

    menuToggle?.addEventListener("click", () => {
        if (sidebar?.classList.contains("active")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    overlay?.addEventListener("click", closeSidebar);

    sidebar?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeSidebar();
    });

    // ---------------------------------------------------------
    // LOGOUT
    // ---------------------------------------------------------

    logoutLink?.addEventListener("click", (event) => {
        event.preventDefault();

        localStorage.removeItem("doctor");
        window.location.href = "doctor-login.html";
    });

    // ---------------------------------------------------------
    // INITIALIZE PAGE
    // ---------------------------------------------------------

    async function initializeHistory() {
        if (completedCount) completedCount.textContent = "…";
        if (prescriptionCount) prescriptionCount.textContent = "…";

        try {
            const result = await fetchJson(
                `${APPOINTMENT_API_URL}/doctor/${encodeURIComponent(doctorId)}`
            );

            const appointments = normalizeArray(result);

            completedAppointments = appointments.filter((appointment) => {
                const appointmentDoctor =
                    appointment.DoctorID ||
                    appointment.doctorId ||
                    appointment.Doctor ||
                    appointment.doctor;

                return isSameId(appointmentDoctor, doctorId) &&
                    String(appointment.Status || appointment.status || "")
                        .toLowerCase() === "completed";
            });

            if (completedCount) {
                completedCount.textContent = String(
                    completedAppointments.length
                );
            }
        } catch (error) {
            console.error("Unable to load completed appointment count:", error);

            if (completedCount) completedCount.textContent = "—";
        }

        try {
            const result = await fetchJson(
                `${PRESCRIPTION_API_URL}/doctor/${encodeURIComponent(doctorId)}`
            );

            savedPrescriptions = normalizeArray(result).filter((prescription) => {
                const prescriptionDoctor =
                    prescription.DoctorID ||
                    prescription.doctorId ||
                    prescription.Doctor ||
                    prescription.doctor;

                return isSameId(prescriptionDoctor, doctorId);
            });

            if (prescriptionCount) {
                prescriptionCount.textContent = String(
                    savedPrescriptions.length
                );
            }
        } catch (error) {
            console.warn(
                "Unable to load prescription count:",
                error.message
            );

            if (prescriptionCount) prescriptionCount.textContent = "—";
        }

        showHistoryHome();
    }

    initializeHistory();
})();