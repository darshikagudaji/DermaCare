
const Receptionist = require("../models/Receptionist");

const bcrypt = require("bcrypt");


// =======================================================
// RECEPTIONIST LOGIN
// =======================================================

const loginReceptionist = async (req, res) => {

    try {

        console.log(
            "Receptionist login request received"
        );

        const {
            email,
            password
        } = req.body;


        // ===================================================
        // CHECK EMPTY FIELDS
        // ===================================================

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email and password."

            });

        }


        // ===================================================
        // FIND RECEPTIONIST
        // ===================================================

        const receptionist =
            await Receptionist.findOne({

                Email:
                    email.toLowerCase().trim()

            });


        if (!receptionist) {

            return res.status(401).json({

                success: false,

                field: "email",

                message:
                    "Email is not registered."

            });

        }


        // ===================================================
        // CHECK PASSWORD
        // ===================================================

        if (!receptionist.Password) {

            return res.status(401).json({

                success: false,

                message:
                    "Receptionist password has not been set. Please contact the system administrator."

            });

        }


        const passwordMatch =
            await bcrypt.compare(

                password,

                receptionist.Password

            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                field: "password",

                message:
                    "Incorrect password."

            });

        }


        // ===================================================
        // LOGIN SUCCESSFUL
        // ===================================================

        return res.status(200).json({

            success: true,

            message:
                "Receptionist login successful.",

            receptionist: {

                _id: receptionist._id,

                id: receptionist._id,

                fullName:
                    receptionist.FullName,

                email:
                    receptionist.Email,

                mobileNo:
                    receptionist["Mobile No"]

            }

        });

    }

    catch (error) {

        console.error(
            "Receptionist login error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error during receptionist login."

        });

    }

};


// =======================================================
// EXPORT CONTROLLER
// =======================================================

module.exports = {

    loginReceptionist

};
