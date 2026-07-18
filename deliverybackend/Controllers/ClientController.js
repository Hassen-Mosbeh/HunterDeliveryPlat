const ClientModel = require("../Models/ClientModel");
const { Roles } = require("../utils/enums");
const createToken = require("../utils/createToken");
const UserModel = require("../Models/UsersModel");

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      phone,
      firstname,
      lastname,
      address,
      profilepicture,
    } = req.body;

    if (!email || !password || !phone || !firstname || !lastname || !address) {
      return res.status(400).json({
        message:
          "email, password, phone, firstname, lastname, and address are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    const existingUser = await UserModel.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email or phone already exists" });
    }

    const client = await ClientModel.create({
      email: normalizedEmail,
      password,
      phone: normalizedPhone,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      address: address.trim(),
      profilepicture,
      role: Roles.CLIENT,
    });

    const token = createToken(client);

    return res.status(201).json({
      status: "success",
      message: "Client registered successfully",
      data: {
        token,
        user: {
          id: client._id,
          email: client.email,
          phone: client.phone,
          role: client.role,
          userType: client.userType,
          userstatus: client.userstatus,
        },
      },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0];

      return res.status(409).json({
        message: `${duplicateField || "Field"} already exists`,
      });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  register,
};
