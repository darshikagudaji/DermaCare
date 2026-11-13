const mongoose = require("mongoose");


const receptionistSchema = new mongoose.Schema(
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

        "Mobile No": {
            type: String,
            required: true
        },

        Password: {
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
        "Receptionist",
        receptionistSchema
    );