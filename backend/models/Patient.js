const mongoose = require("mongoose");


const patientSchema = new mongoose.Schema(
    {

        FullName: {
            type: String,
            required: true
        },

        Email: {
            type: String,
            required: true,
            unique: true
        },

        Password: {
            type: String,
            required: false,
            default: undefined
        },

        "Mobile No": {
            type: String,
            required: true
        },

        DateOfBirth: {
            type: Date,
            required: true
        },

        Gender: {
            type: String,
            required: true
        },

        "Blood Group": {
            type: String,
            required: true
        },

        Address: {
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
        "Patient",
        patientSchema
    );