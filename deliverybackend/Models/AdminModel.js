const mongoose = require('mongoose');
const UserModel = require('./UsersModel');

const adminSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,}
    
}); 

UserModel.discriminator('admin', adminSchema);
module.exports = mongoose.model('admin', adminSchema);