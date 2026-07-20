const DriverModel = require("../Models/DriverModel");
const { Roles } = require("../utils/enums");
const createToken = require("../utils/createToken");
const UserModel = require("../Models/UsersModel");

const register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      licenseNumber,
      vehicleType,
      email,
      password,
      phone,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !licenseNumber ||
      !vehicleType ||
      !email ||
      !password ||
      !phone
    ) {
      return res.status(400).json({
        message:
          "firstname, lastname, licenseNumber, vehicleType, email, password, and phone are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();
    const normalizedLicenseNumber = licenseNumber.toUpperCase().trim();

    const existingUser = await UserModel.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email or phone already exists" });
    }

    const existingDriver = await DriverModel.findOne({
      licenseNumber: normalizedLicenseNumber,
    });

    if (existingDriver) {
      return res
        .status(409)
        .json({ message: "Driver with this licenseNumber already exists" });
    }

    const driver = await DriverModel.create({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      licenseNumber: normalizedLicenseNumber,
      vehicleType: vehicleType.trim(),
      email: normalizedEmail,
      password,
      phone: normalizedPhone,
      role: Roles.DRIVER,
    });

    const token = createToken(driver);

    return res.status(201).json({
      status: "success",
      message: "Driver registered successfully",
      data: {
        token,
        user: {
          id: driver._id,
          email: driver.email,
          phone: driver.phone,
          role: driver.role,
          userType: driver.userType,
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
