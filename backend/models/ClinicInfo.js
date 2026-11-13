const mongoose = require("mongoose");


const clinicInfoSchema = new mongoose.Schema(
    {

        ClinicName: {
            type: String,
            required: true
        },

        Phone: {
            type: String,
            required: true
        },

        Address: {
            type: String,
            required: true
        },

        MondayToSaturday: {
            type: String,
            required: true
        },

        Sunday: {
            type: String,
            required: true
        }

    },


    {
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "updatedAt"
        }
    }
);


module.exports =
    mongoose.model(
        "ClinicInfo",
        clinicInfoSchema
    );