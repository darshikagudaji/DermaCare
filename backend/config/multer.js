// =======================================================
// MULTER CONFIGURATION
// =======================================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");


// =======================================================
// UPLOAD DIRECTORY
// =======================================================

// Doctor images will be stored inside:
// backend/uploads/doctors/

const uploadDirectory = path.join(
    __dirname,
    "../uploads/doctors"
);


// =======================================================
// CREATE DIRECTORY IF IT DOES NOT EXIST
// =======================================================

if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


// =======================================================
// STORAGE CONFIGURATION
// =======================================================

const storage = multer.diskStorage({

    // ---------------------------------------------------
    // WHERE THE IMAGE WILL BE STORED
    // ---------------------------------------------------

    destination: (req, file, cb) => {

        cb(
            null,
            uploadDirectory
        );

    },


    // ---------------------------------------------------
    // FILE NAME
    // ---------------------------------------------------

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(
            null,
            uniqueName
        );

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