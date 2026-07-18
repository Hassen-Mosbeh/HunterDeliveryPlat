const mongoose = require('mongoose');
const UserModel = require('./UsersModel');
const userSchema = new mongoose.Schema({
    restaurantName: {
        type: String,
        required: true,
        trim: true
    },
    businessAddress: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String
    },
    cuisineType: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
});
const RestaurantModel = mongoose.models.restaurant || UserModel.discriminator('restaurant', userSchema);
module.exports = RestaurantModel;