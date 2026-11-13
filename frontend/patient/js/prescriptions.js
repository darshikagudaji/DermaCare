
/* =====================================================
   DERMACARE - PATIENT PRESCRIPTIONS
   Expandable cards, patient contact details,
   formatted instructions and PDF download
===================================================== */

const API_BASE_URL = "https://dermacare-eeca.onrender.com/api";

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const prescriptionList = document.getElementById("prescriptionList");
const prescriptionMessage = document.getElementById("prescriptionMessage");
const logoutLink = document.getElementById("logoutLink");

let prescriptionsCache = [];
let prescriptionsPatientName = "Patient";
let prescriptionsPatientDetails = {};


/* =====================================================
   MOBILE SIDEBAR
===================================================== */

function updateMenuIcon() {
    if (!menuToggle) return;

    const icon = menuToggle.querySelector("i");
    const isOpen = sidebar?.classList.contains("active");

    if (icon) {
        icon.classList.toggle("bi-list", !isOpen);
        icon.classList.toggle("bi-x-lg", Boolean(isOpen));
    }

    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function closeMobileMenu() {
    sidebar?.classList.remove("active");
    overlay?.classList.remove("active");
    updateMenuIcon();
}

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("active");
        overlay?.classList.toggle("active");
        updateMenuIcon();
    });
}

overlay?.addEventListener("click", closeMobileMenu);

sidebar?.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMobileMenu();
});

window.addEventListener("resize", function () {
    if (window.innerWidth > 1024) closeMobileMenu();
});

updateMenuIcon();


/* =====================================================
   SAFE HTML OUTPUT
===================================================== */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


/* =====================================================
   GET A VALUE FROM POSSIBLE FIELD NAMES
===================================================== */

function getFirstValue(objects, fieldNames, fallback = "") {
    for (const object of objects) {
        if (!object || typeof object !== "object") continue;

        for (const fieldName of fieldNames) {
            const value = object[fieldName];

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {
                return value;
            }
        }
    }

    return fallback;
}


/* =====================================================
   PATIENT CONTACT DETAILS
   Supports common field names used by the frontend
   and backend patient objects.
===================================================== */

function getPatientContactDetails(patient = {}) {
    const sources = [
        patient,
        patient.PatientID,
        patient.patient,
        prescriptionsPatientDetails
    ];

    return {
        name: getFirstValue(
            sources,
            ["FullName", "fullName", "PatientName", "patientName", "name"],
            prescriptionsPatientName || "Patient"
        ),

        mobile: getFirstValue(
            sources,
            [
                "MobileNo",
                "Mobile",
                "Phone",
                "PhoneNumber",
                "ContactNumber",
                "mobileNo",
                "mobile",
                "phone",
                "phoneNumber"
            ],
            "Not available"
        ),

        email: getFirstValue(
            sources,
            ["Email", "email", "EmailAddress", "emailAddress"],
            "Not available"
        ),

        dateOfBirth: getFirstValue(
            sources,
            ["DateOfBirth", "DOB", "dateOfBirth", "dob"],
            ""
        ),

        gender: getFirstValue(
            sources,
            ["Gender", "gender"],
            "Not available"
        ),

        bloodGroup: getFirstValue(
            sources,
            ["BloodGroup", "BloodType", "bloodGroup", "bloodType"],
            "Not available"
        ),

        address: getFirstValue(
            sources,
            ["Address", "address", "ResidentialAddress", "residentialAddress"],
            "Not available"
        )
    };
}


/* =====================================================
   DATE FORMATTING
===================================================== */

function formatDate(value) {
    if (!value) return "Not specified";

    // Avoid timezone shifts for date-only values.
    if (typeof value === "string") {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (match) {
            const date = new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            );

            return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
        }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not specified";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

function formatDateForURL(value) {
    if (!value) return "";

    if (typeof value === "string") {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}


/* =====================================================
   PARSE MEDICINES
===================================================== */

function parseMedicines(medicinesValue) {
    if (Array.isArray(medicinesValue)) return medicinesValue;

    if (typeof medicinesValue !== "string") return [];

    try {
        const parsed = JSON.parse(medicinesValue);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Unable to parse prescription medicines:", error);
        return [];
    }
}


/* =====================================================
   PARSE COMBINED DOCTOR INSTRUCTIONS
   Supports labels on the same line or separate lines.
===================================================== */

function parseDoctorInstructions(rawValue) {
    const raw = String(rawValue || "").trim();

    const result = {
        Diagnosis: "",
        "Clinical Notes": "",
        Instructions: "",
        Advice: ""
    };

    if (!raw) return result;

    const labels = ["Diagnosis", "Clinical Notes", "Instructions", "Advice"];

    const escapedLabels = labels.map(function (label) {
        return label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });

    const pattern = new RegExp(
        "(^|\\n|\\s{2,})(" +
        escapedLabels.join("|") +
        ")\\s*:\\s*",
        "gi"
    );

    const matches = [...raw.matchAll(pattern)];

    if (!matches.length) {
        result.Instructions = raw;
        return result;
    }

    matches.forEach(function (match, index) {
        const label = match[2];
        const start = match.index + match[0].length;
        const end = index + 1 < matches.length
            ? matches[index + 1].index
            : raw.length;

        const key = Object.keys(result).find(function (item) {
            return item.toLowerCase() === label.toLowerCase();
        });

        if (key) {
            result[key] = raw.slice(start, end).trim();
        }
    });

    return result;
}


/* =====================================================
   GET PRESCRIPTION ID
===================================================== */

function getPrescriptionId(prescription, index) {
    return String(
        prescription._id ||
        prescription.id ||
        prescription.PrescriptionID ||
        `prescription-${index}`
    );
}


/* =====================================================
   GET INSTRUCTION FIELDS
===================================================== */

function getPrescriptionNotes(prescription) {
    const rawInstructions = String(prescription.Instructions || "");
    const parsed = parseDoctorInstructions(rawInstructions);

    return {
        diagnosis:
            prescription.Diagnosis ||
            prescription.DiagnosisDetails ||
            parsed.Diagnosis ||
            "",

        clinicalNotes:
            prescription.ClinicalNotes ||
            parsed["Clinical Notes"] ||
            "",

        instructions:
            parsed.Instructions ||
            (rawInstructions && !Object.values(parsed).some(Boolean)
                ? rawInstructions
                : ""),

        advice:
            prescription.Advice ||
            parsed.Advice ||
            ""
    };
}


/* =====================================================
   RENDER FORMATTED DOCTOR INSTRUCTIONS
===================================================== */

function renderDoctorInstructions(prescription, medicines) {
    const notes = getPrescriptionNotes(prescription);
    const sections = [];

    if (notes.diagnosis) {
        sections.push(`
            <div class="doctor-instruction-item">
                <div class="doctor-instruction-heading">
                    <i class="bi bi-clipboard2-check"></i>
                    <h4>Diagnosis</h4>
                </div>
                <p>${escapeHTML(notes.diagnosis)}</p>
            </div>
        `);
    }

    if (notes.clinicalNotes) {
        sections.push(`
            <div class="doctor-instruction-item">
                <div class="doctor-instruction-heading">
                    <i class="bi bi-journal-medical"></i>
                    <h4>Clinical Notes</h4>
                </div>
                <p>${escapeHTML(notes.clinicalNotes).replace(/\n/g, "<br>")}</p>
            </div>
        `);
    }

    if (notes.instructions) {
        sections.push(`
            <div class="doctor-instruction-item">
                <div class="doctor-instruction-heading">
                    <i class="bi bi-info-circle"></i>
                    <h4>Instructions</h4>
                </div>
                <p>${escapeHTML(notes.instructions).replace(/\n/g, "<br>")}</p>
            </div>
        `);
    }

    if (notes.advice) {
        sections.push(`
            <div class="doctor-instruction-item">
                <div class="doctor-instruction-heading">
                    <i class="bi bi-heart-pulse"></i>
                    <h4>Advice</h4>
                </div>
                <p>${escapeHTML(notes.advice).replace(/\n/g, "<br>")}</p>
            </div>
        `);
    }

    const medicinesWithInstructions = medicines.filter(function (medicine) {
        return medicine.instructions || medicine.Instructions;
    });

    if (medicinesWithInstructions.length) {
        sections.push(`
            <div class="doctor-instruction-item">
                <div class="doctor-instruction-heading">
                    <i class="bi bi-capsule"></i>
                    <h4>Medicine Instructions</h4>
                </div>

                ${medicinesWithInstructions.map(function (medicine) {
                    return `
                        <p>
                            <strong>${escapeHTML(
                                medicine.medicineName ||
                                medicine.MedicineName ||
                                "Medicine"
                            )}:</strong>
                            ${escapeHTML(
                                medicine.instructions ||
                                medicine.Instructions
                            )}
                        </p>
                    `;
                }).join("")}
            </div>
        `);
    }

    if (!sections.length) {
        sections.push(`
            <div class="doctor-instruction-item">
                <p>No additional instructions provided.</p>
            </div>
        `);
    }

    return sections.join("");
}


/* =====================================================
   RENDER ONE PRESCRIPTION
===================================================== */

function renderPrescription(prescription, patientName, index) {
    const doctor = prescription.DoctorID || {};
    const appointment = prescription.AppointmentID || {};
    const medicines = parseMedicines(prescription.Medicines);

    const prescriptionId = getPrescriptionId(prescription, index);
    const detailsId = `prescription-details-${index}`;

    const doctorName = doctor.FullName || "Doctor details unavailable";

    const specialization =
        doctor.Specialization ||
        doctor.Qualification ||
        "Not specified";

    const doctorId = doctor._id || doctor.id || "";

    const appointmentDate = formatDate(appointment.AppointmentDate);

    const appointmentTime = appointment.AppointmentTime
        ? escapeHTML(appointment.AppointmentTime)
        : "Not specified";

    const followUpDateValue = prescription.FollowUpDate || "";

    const followUpDate = followUpDateValue
        ? formatDate(followUpDateValue)
        : "No follow-up date provided";

    const patientDetails = getPatientContactDetails({
        ...prescriptionsPatientDetails,
        FullName: patientName
    });

    const medicineHTML = medicines.length
        ? medicines.map(function (medicine) {
            const name = escapeHTML(
                medicine.medicineName || medicine.MedicineName || "Medicine"
            );

            const dosage = escapeHTML(
                medicine.dosage || medicine.Dosage || "Not specified"
            );

            const frequency = escapeHTML(
                medicine.frequency || medicine.Frequency || "Not specified"
            );

            const duration = escapeHTML(
                medicine.duration || medicine.Duration || "Not specified"
            );

            const medicineInstructions = escapeHTML(
                medicine.instructions || medicine.Instructions || ""
            );

            return `
                <li class="medicine-item">
                    <div class="medicine-item-heading">
                        <span class="medicine-number">
                            <i class="bi bi-capsule"></i>
                        </span>
                        <h4>${name}</h4>
                    </div>

                    <div class="medicine-detail-grid">
                        <div>
                            <span>Dosage</span>
                            <p>${dosage}</p>
                        </div>

                        <div>
                            <span>Frequency</span>
                            <p>${frequency}</p>
                        </div>

                        <div>
                            <span>Duration</span>
                            <p>${duration}</p>
                        </div>
                    </div>

                    ${medicineInstructions ? `
                        <p class="medicine-instructions">
                            <strong>Instructions:</strong>
                            ${medicineInstructions}
                        </p>
                    ` : ""}
                </li>
            `;
        }).join("")
        : `
            <li class="medicine-empty">
                <i class="bi bi-info-circle"></i>
                Medicine details are unavailable for this prescription.
            </li>
        `;

    const followUpButton = doctorId && formatDateForURL(followUpDateValue)
        ? `
            <a
                class="follow-btn"
                href="doctor-booking.html?doctorId=${encodeURIComponent(doctorId)}&followUpDate=${encodeURIComponent(formatDateForURL(followUpDateValue))}"
            >
                <i class="bi bi-calendar-plus"></i>
                Book Follow-up Appointment
            </a>
        `
        : `
            <p class="follow-up-unavailable">
                ${doctorId
                    ? "No follow-up date was provided for this prescription."
                    : "Doctor information is unavailable for online follow-up booking."}
            </p>
        `;

    return `
        <article
            class="prescription-card"
            data-prescription-id="${escapeHTML(prescriptionId)}"
        >
            <button
                class="prescription-card-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="${detailsId}"
            >
                <span class="prescription-card-icon">
                    <i class="bi bi-file-earmark-medical"></i>
                </span>

                <span class="prescription-card-summary">
                    <span class="prescription-card-title">Prescription</span>

                    <span class="prescription-card-doctor">
                        ${escapeHTML(doctorName)}
                    </span>

                    <span class="prescription-card-meta">
                        <span>
                            <i class="bi bi-calendar3"></i>
                            ${escapeHTML(appointmentDate)}
                        </span>

                        <span>
                            <i class="bi bi-clock"></i>
                            ${appointmentTime}
                        </span>
                    </span>

                    <span class="prescription-card-specialization">
                        ${escapeHTML(specialization)}
                    </span>
                </span>

                <span class="prescription-expand-icon" aria-hidden="true">
                    <i class="bi bi-chevron-down"></i>
                </span>
            </button>

            <div class="prescription-details" id="${detailsId}" hidden>
                <div class="prescription-details-heading">
                    <div>
                        <span class="prescription-eyebrow">
                            DERMACARE SKIN & HAIR CLINIC
                        </span>
                        <h2>Prescription Details</h2>
                    </div>

                    <span class="prescription-status">
                        <i class="bi bi-check-circle-fill"></i>
                        Saved
                    </span>
                </div>

                <!-- PATIENT INFORMATION: CONTACT DETAILS ONLY -->

                <div class="prescription-section">
                    <h3>
                        <i class="bi bi-person-vcard"></i>
                        Patient Information
                    </h3>

                    <div class="prescription-info-grid">
                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Patient Name</span>
                            <p>${escapeHTML(patientDetails.name)}</p>
                        </div>

                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Mobile Number</span>
                            <p>${escapeHTML(patientDetails.mobile)}</p>
                        </div>

                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Email Address</span>
                            <p>${escapeHTML(patientDetails.email)}</p>
                        </div>

                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Date of Birth</span>
                            <p>${escapeHTML(
                                patientDetails.dateOfBirth
                                    ? formatDate(patientDetails.dateOfBirth)
                                    : "Not available"
                            )}</p>
                        </div>

                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Gender</span>
                            <p>${escapeHTML(patientDetails.gender)}</p>
                        </div>

                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Blood Group</span>
                            <p>${escapeHTML(patientDetails.bloodGroup)}</p>
                        </div>

                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Address</span>
                            <p>${escapeHTML(patientDetails.address)}</p>
                        </div>
                    </div>
                </div>

                <div class="prescription-section">
                    <h3>
                        <i class="bi bi-person-badge"></i>
                        Doctor Information
                    </h3>

                    <div class="prescription-info-grid">
                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Doctor Name</span>
                            <p>${escapeHTML(doctorName)}</p>
                        </div>

                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Specialization</span>
                            <p>${escapeHTML(specialization)}</p>
                        </div>
                    </div>
                </div>

                <div class="prescription-section">
                    <h3>
                        <i class="bi bi-calendar2-check"></i>
                        Appointment Details
                    </h3>

                    <div class="prescription-info-grid">
                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Appointment Date</span>
                            <p>${escapeHTML(appointmentDate)}</p>
                        </div>

                        <div class="prescription-info-item">
                            <span class="prescription-info-label">Appointment Time</span>
                            <p>${appointmentTime}</p>
                        </div>
                    </div>
                </div>

                <div class="prescription-section">
                    <h3>
                        <i class="bi bi-capsule-pill"></i>
                        Prescribed Medicines
                    </h3>

                    <ul class="medicine-list">
                        ${medicineHTML}
                    </ul>
                </div>

                <div class="prescription-section">
                    <h3>
                        <i class="bi bi-clipboard2-pulse"></i>
                        Doctor's Instructions
                    </h3>

                    <div class="doctor-instructions-content">
                        ${renderDoctorInstructions(prescription, medicines)}
                    </div>
                </div>

                <div class="prescription-follow-up">
                    <div class="follow-up-heading">
                        <span class="follow-up-icon">
                            <i class="bi bi-calendar-heart"></i>
                        </span>

                        <div>
                            <h3>Follow-up Appointment</h3>
                            <p>Review your treatment with your dermatologist.</p>
                        </div>
                    </div>

                    <div class="follow-up-date-display">
                        <span>Recommended Follow-up Date</span>
                        <strong>${escapeHTML(followUpDate)}</strong>
                    </div>

                    ${followUpButton}
                </div>

                <button
                    type="button"
                    class="download-prescription-btn"
                    data-prescription-index="${index}"
                >
                    <i class="bi bi-download"></i>
                    Download Prescription PDF
                </button>
            </div>
        </article>
    `;
}


/* =====================================================
   EXPAND / COLLAPSE PRESCRIPTION CARDS
===================================================== */

function initializePrescriptionCardToggles() {
    if (!prescriptionList) return;

    prescriptionList.querySelectorAll(".prescription-card-toggle")
        .forEach(function (toggleButton) {
            toggleButton.addEventListener("click", function () {
                const detailsId = toggleButton.getAttribute("aria-controls");
                const details = document.getElementById(detailsId);

                if (!details) return;

                const shouldExpand =
                    toggleButton.getAttribute("aria-expanded") !== "true";

                toggleButton.setAttribute(
                    "aria-expanded",
                    String(shouldExpand)
                );

                details.hidden = !shouldExpand;

                toggleButton.closest(".prescription-card")
                    ?.classList.toggle("expanded", shouldExpand);
            });
        });
}


/* =====================================================
   PDF HELPERS
===================================================== */

function addPDFSectionHeading(pdf, text, margin, pageWidth, pageHeight, state) {
    if (state.y + 18 > pageHeight - 18) {
        pdf.addPage();
        state.y = 20;
    }

    state.y += 3;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(29, 53, 87);
    pdf.text(text, margin, state.y);

    state.y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
}

function addPDFText(pdf, label, value, margin, usableWidth, pageHeight, state) {
    const content = String(value ?? "").trim() || "Not specified";
    const labelText = `${label}:`;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    const labelWidth = Math.min(
        pdf.getTextWidth(labelText) + 2,
        usableWidth * 0.42
    );

    const valueWidth = Math.max(30, usableWidth - labelWidth);
    const lines = pdf.splitTextToSize(content, valueWidth);
    const lineHeight = 5.5;
    const requiredHeight = Math.max(7, lines.length * lineHeight);

    if (state.y + requiredHeight > pageHeight - 18) {
        pdf.addPage();
        state.y = 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.text(labelText, margin, state.y);

    pdf.setFont("helvetica", "normal");
    pdf.text(lines, margin + labelWidth, state.y);

    state.y += requiredHeight;
}


/* =====================================================
   DOWNLOAD PRESCRIPTION AS PDF
===================================================== */

function downloadPrescriptionPDF(prescription, patientName) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert(
            "The PDF library could not load. Check your internet connection and try again."
        );
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        const doctor = prescription.DoctorID || {};
        const appointment = prescription.AppointmentID || {};
        const medicines = parseMedicines(prescription.Medicines);
        const notes = getPrescriptionNotes(prescription);
        const patientDetails = getPatientContactDetails({
            ...prescriptionsPatientDetails,
            FullName: patientName
        });

        const margin = 18;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const usableWidth = pageWidth - margin * 2;
        const state = { y: 20 };

        /* Clinic heading */

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(20);
        pdf.setTextColor(23, 105, 213);
        pdf.text("DERMACARE", margin, state.y);

        state.y += 7;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(71, 85, 105);
        pdf.text("Skin & Hair Clinic | Patient Prescription", margin, state.y);

        state.y += 6;

        pdf.setDrawColor(23, 105, 213);
        pdf.line(margin, state.y, pageWidth - margin, state.y);

        state.y += 9;

        /* Patient information: contact details only */

        addPDFSectionHeading(
            pdf, "Patient Information", margin, pageWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Patient Name", patientDetails.name,
            margin, usableWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Mobile Number", patientDetails.mobile,
            margin, usableWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Email Address", patientDetails.email,
            margin, usableWidth, pageHeight, state
        );

        addPDFText(
            pdf,
            "Date of Birth",
            patientDetails.dateOfBirth
                ? formatDate(patientDetails.dateOfBirth)
                : "Not available",
            margin, usableWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Gender", patientDetails.gender,
            margin, usableWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Blood Group", patientDetails.bloodGroup,
            margin, usableWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Address", patientDetails.address,
            margin, usableWidth, pageHeight, state
        );

        /* Doctor information */

        addPDFSectionHeading(
            pdf, "Doctor Information", margin, pageWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Doctor", doctor.FullName,
            margin, usableWidth, pageHeight, state
        );

        addPDFText(
            pdf,
            "Specialization",
            doctor.Specialization || doctor.Qualification,
            margin, usableWidth, pageHeight, state
        );

        /* Appointment */

        addPDFSectionHeading(
            pdf, "Appointment Details", margin, pageWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Appointment Date", formatDate(appointment.AppointmentDate),
            margin, usableWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Appointment Time", appointment.AppointmentTime,
            margin, usableWidth, pageHeight, state
        );

        /* Medicines */

        addPDFSectionHeading(
            pdf, "Prescribed Medicines", margin, pageWidth, pageHeight, state
        );

        if (medicines.length) {
            medicines.forEach(function (medicine, index) {
                addPDFText(
                    pdf,
                    `Medicine ${index + 1}`,
                    medicine.medicineName || medicine.MedicineName || "Medicine",
                    margin, usableWidth, pageHeight, state
                );

                addPDFText(
                    pdf, "Dosage", medicine.dosage || medicine.Dosage,
                    margin, usableWidth, pageHeight, state
                );

                addPDFText(
                    pdf, "Frequency", medicine.frequency || medicine.Frequency,
                    margin, usableWidth, pageHeight, state
                );

                addPDFText(
                    pdf, "Duration", medicine.duration || medicine.Duration,
                    margin, usableWidth, pageHeight, state
                );

                const medicineInstructions =
                    medicine.instructions || medicine.Instructions;

                if (medicineInstructions) {
                    addPDFText(
                        pdf, "Medicine Instructions", medicineInstructions,
                        margin, usableWidth, pageHeight, state
                    );
                }

                state.y += 2;
            });
        } else {
            addPDFText(
                pdf, "Medicines", "No medicine details available",
                margin, usableWidth, pageHeight, state
            );
        }

        /* Doctor's instructions */

        addPDFSectionHeading(
            pdf, "Doctor's Instructions", margin, pageWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Clinical Notes", notes.clinicalNotes,
            margin, usableWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Instructions", notes.instructions,
            margin, usableWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Advice", notes.advice,
            margin, usableWidth, pageHeight, state
        );

        /* Follow-up */

        addPDFSectionHeading(
            pdf, "Follow-up Appointment", margin, pageWidth, pageHeight, state
        );

        addPDFText(
            pdf, "Recommended Follow-up Date", formatDate(prescription.FollowUpDate),
            margin, usableWidth, pageHeight, state
        );

        /* Page numbers */

        const totalPages = pdf.internal.getNumberOfPages();

        for (let page = 1; page <= totalPages; page++) {
            pdf.setPage(page);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(120, 130, 145);

            pdf.text(
                `DermCare | Page ${page} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 8,
                { align: "center" }
            );
        }

        const safeName = String(patientName || "Patient")
            .replace(/[^a-z0-9_-]/gi, "_");

        const prescriptionId = String(
            prescription._id ||
            prescription.id ||
            prescription.PrescriptionID ||
            ""
        ).replace(/[^a-z0-9_-]/gi, "_");

        pdf.save(
            `DermCare_Prescription_${safeName}${prescriptionId ? "_" + prescriptionId : ""}.pdf`
        );

    } catch (error) {
        console.error("Prescription PDF download failed:", error);
        alert("Unable to generate the prescription PDF. Please try again.");
    }
}


/* =====================================================
   DOWNLOAD BUTTON CLICK HANDLER
===================================================== */

if (prescriptionList) {
    prescriptionList.addEventListener("click", function (event) {
        const button = event.target.closest(".download-prescription-btn");

        if (!button) return;

        const index = Number(button.dataset.prescriptionIndex);

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            !prescriptionsCache[index]
        ) {
            alert("Unable to find this prescription. Please reload the page.");
            return;
        }

        downloadPrescriptionPDF(
            prescriptionsCache[index],
            prescriptionsPatientName
        );
    });
}


/* =====================================================
   LOAD PATIENT PRESCRIPTIONS
===================================================== */

async function loadPatientPrescriptions() {
    if (!prescriptionList) return;

    prescriptionList.innerHTML = `
        <div class="prescription-card prescription-loading">
            <i class="bi bi-arrow-repeat"></i>
            <p>Loading your prescriptions...</p>
        </div>
    `;

    if (prescriptionMessage) {
        prescriptionMessage.textContent = "";
    }

    let patient;

    try {
        const storedPatient = localStorage.getItem("patient");

        if (!storedPatient) {
            prescriptionList.innerHTML = "";

            if (prescriptionMessage) {
                prescriptionMessage.textContent =
                    "Please log in to view your prescriptions.";
            }

            return;
        }

        patient = JSON.parse(storedPatient);

    } catch (error) {
        console.error("Invalid patient data in localStorage:", error);
        prescriptionList.innerHTML = "";

        if (prescriptionMessage) {
            prescriptionMessage.textContent =
                "Unable to read your login details. Please log in again.";
        }

        return;
    }

    const patientId =
        patient._id ||
        patient.id ||
        patient.PatientID ||
        patient.patientId;

    if (!patientId) {
        prescriptionList.innerHTML = "";

        if (prescriptionMessage) {
            prescriptionMessage.textContent =
                "Your patient ID was not found. Please log in again.";
        }

        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/prescriptions/patient/${encodeURIComponent(patientId)}`
        );

        const responseText = await response.text();

        let result;

        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error(
                "Prescriptions API returned a non-JSON response:",
                response.status,
                responseText
            );

            throw new Error(
                "The prescriptions API returned HTML instead of JSON. Check the backend route and server configuration."
            );
        }

        if (!response.ok || result.success === false) {
            throw new Error(
                result.message ||
                `Unable to load prescriptions (HTTP ${response.status}).`
            );
        }

        const prescriptions = Array.isArray(result.prescriptions)
            ? result.prescriptions
            : [];

        const patientName =
            result.patient?.FullName ||
            patient.FullName ||
            patient.fullName ||
            patient.name ||
            "Patient";

        /*
         * Keep the patient's details available for both the
         * prescription card and the downloaded PDF.
         *
         * Prefer the patient object returned by the API when present;
         * otherwise use the logged-in patient stored in localStorage.
         */
        prescriptionsPatientDetails = {
            ...patient,
            ...(result.patient || {})
        };

        prescriptionsCache = prescriptions;
        prescriptionsPatientName = patientName;

        if (!prescriptions.length) {
            prescriptionList.innerHTML = "";

            if (prescriptionMessage) {
                prescriptionMessage.textContent =
                    "No prescriptions have been added to your account yet.";
            }

            return;
        }

        prescriptionList.innerHTML = prescriptions.map(
            function (prescription, index) {
                return renderPrescription(
                    prescription,
                    patientName,
                    index
                );
            }
        ).join("");

        initializePrescriptionCardToggles();

    } catch (error) {
        console.error("Load patient prescriptions error:", error);
        prescriptionList.innerHTML = "";

        if (prescriptionMessage) {
            prescriptionMessage.textContent =
                error.message ||
                "Unable to load prescriptions. Please try again later.";
        }
    }
}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("patient");
        window.location.href = "../login.html";
    });
}


/* =====================================================
   INITIALIZE
===================================================== */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadPatientPrescriptions);
} else {
    loadPatientPrescriptions();
}
