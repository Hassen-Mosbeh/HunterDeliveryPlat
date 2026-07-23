
const RestaurantModel = require("../Models/RestoModel");
const { Roles } = require("../utils/enums");
const createToken = require("../utils/createToken");
const UserModel = require("../Models/UsersModel");

const register = async (req, res) => {
  try {
    const {
      restaurantName,
      cuisineType,
      businessAddress,
      ownerName,
      email,
      password,
      phone,
      logo,
    } = req.body;

    if (
      !restaurantName ||
      !cuisineType ||
      !businessAddress ||
      !ownerName ||
      !email ||
      !password ||
      !phone
    ) {
      return res.status(400).json({
        message:
          "restaurantName, cuisineType, businessAddress, ownerName, email, password, and phone are required",
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

    const restaurant = await RestaurantModel.create({
      restaurantName: restaurantName.trim(),
      cuisineType: cuisineType.trim(),
      businessAddress: businessAddress.trim(),
      ownerName: ownerName.trim(),
      email: normalizedEmail,
      password,
      phone: normalizedPhone,
      logo,
      role: Roles.RESTAURANT,
    });

    const token = createToken(restaurant);

    return res.status(201).json({
      status: "success",
      message: "Restaurant registered successfully",
      data: {
        token,
        user: {
          id: restaurant._id,
          email: restaurant.email,
          phone: restaurant.phone,
          role: restaurant.role,
          userType: restaurant.userType,
          userstatus: restaurant.userstatus,
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

const getRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await RestaurantModel.findById(req.user.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Restaurant profile retrieved successfully",
      data: {
        restaurant: {
          id: restaurant._id,
          restaurantName: restaurant.restaurantName,
          ownerName: restaurant.ownerName,
          cuisineType: restaurant.cuisineType,
          businessAddress: restaurant.businessAddress,
          logo: restaurant.logo,
          email: restaurant.email,
          phone: restaurant.phone,
          role: restaurant.role,
          userType: restaurant.userType,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateRestaurantProfile = async (req, res) => {
  try {
    const { restaurantName, ownerName, cuisineType, businessAddress, phone, logo } = req.body;

    if (restaurantName === undefined && ownerName === undefined && cuisineType === undefined && businessAddress === undefined && phone === undefined && logo === undefined) {
      return res.status(400).json({
        message: "At least one valid field is required to update",
      });
    }

    const restaurant = await RestaurantModel.findById(req.user.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (phone !== undefined) {
      const normalizedPhone = phone.trim();

      const existingUser = await UserModel.findOne({
        phone: normalizedPhone,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return res.status(409).json({ message: "phone already exists" });
      }

      restaurant.phone = normalizedPhone;
    }

    if (restaurantName !== undefined) restaurant.restaurantName = restaurantName.trim();
    if (ownerName !== undefined) restaurant.ownerName = ownerName.trim();
    if (cuisineType !== undefined) restaurant.cuisineType = cuisineType.trim();
    if (businessAddress !== undefined) restaurant.businessAddress = businessAddress.trim();
    if (logo !== undefined) restaurant.logo = logo.trim();

    await restaurant.save();

    return res.status(200).json({
      status: "success",
      message: "Restaurant profile updated successfully",
      data: {
        restaurant: {
          id: restaurant._id,
          restaurantName: restaurant.restaurantName,
          ownerName: restaurant.ownerName,
          cuisineType: restaurant.cuisineType,
          businessAddress: restaurant.businessAddress,
          logo: restaurant.logo,
          email: restaurant.email,
          phone: restaurant.phone,
          role: restaurant.role,
          userType: restaurant.userType,
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
  getRestaurantProfile,
  updateRestaurantProfile,
};
