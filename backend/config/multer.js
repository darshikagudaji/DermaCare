
// =======================================================
// DERMCARE - CLOUDINARY MULTER CONFIGURATION
// =======================================================

const multer = require("multer");
const path = require("path");

const cloudinary = require("./cloudinary");

const {
    CloudinaryStorage
} = require("multer-storage-cloudinary-v2");


// =======================================================
// CLOUDINARY STORAGE CONFIGURATION
// =======================================================

const storage = new CloudinaryStorage({

    cloudinary: cloudinary,

    params: {
        folder: "dermacare/doctors",

        public_id: (req, file) => {
            return (
                "doctor-" +
                Date.now() +
                "-" +
                Math.round(Math.random() * 1E9)
            );
        }
    }

});


// =======================================================
// FILE TYPE VALIDATION
// =======================================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            ),
            false
        );

    }

};


// =======================================================
// MULTER UPLOAD
// =======================================================

const uploadDoctorImage = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


// =======================================================
// EXPORT
// =======================================================

module.exports = uploadDoctorImage;
