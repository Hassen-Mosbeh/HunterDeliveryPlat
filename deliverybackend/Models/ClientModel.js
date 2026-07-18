const mongoose = require("mongoose");
const UserModel = require("./UsersModel");

const clientSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
  },

  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
  },

  profilepicture: {
    type: String,
  },
});
const ClientModel =
  mongoose.models.client || UserModel.discriminator("client", clientSchema); //classe filliale de la classe mere user

module.exports = ClientModel;
