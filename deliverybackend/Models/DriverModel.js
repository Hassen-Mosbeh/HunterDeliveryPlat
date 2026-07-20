const mongoose = require('mongoose');
const UserModel = require('./UsersModel');
const { AvailabilityStatus } = require('../utils/enums');

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
    //availabilityStatus: {
        //type: Number,
        //enum: Object.values(AvailabilityStatus),
        //default: AvailabilityStatus.AVAILABLE  
    //}
});
const DriverModel = mongoose.models.driver || UserModel.discriminator('driver', driverSchema);
module.exports = DriverModel;