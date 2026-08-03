const mongoose = require("mongoose");
const UserModel = require("./UsersModel");

const adminSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
});

const AdminModel = UserModel.discriminator("admin", adminSchema);
module.exports = AdminModel;
