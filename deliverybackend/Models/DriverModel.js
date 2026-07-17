const mongoose = require('mongoose');
UserModel = require('./UsersModel');

const driverSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    vehicleType: {
        type: String,
        required: true
    },

    //TODO: Add availability status field to the driver schema
    availabilityStatus: {
        type: Boolean,
        default: 0,
        enumer: [0, 1],
    }
});
UserModel.discriminator('driver', driverSchema);
module.exports = mongoose.model('driver', driverSchema);