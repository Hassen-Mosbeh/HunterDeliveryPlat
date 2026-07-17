const mongoose = require('mongoose');
const UserModel = require('./UsersModel');

const clientSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },

    lasstname: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
        
    },

    profilepicture: {
        type: String
    }
}); 
UserModel.discriminator('client', clientSchema);//classe filliale de la classe mere user
module.exports = mongoose.model('client', clientSchema);