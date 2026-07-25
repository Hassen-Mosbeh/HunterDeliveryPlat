const ClientModel = require("../Models/ClientModel");
const RestaurantModel = require("../Models/RestoModel");
const ProductModel = require("../Models/ProductModel");
const { Roles, AvailabilityStatus, UserStatus } = require("../utils/enums");
const createToken = require("../utils/createToken");
const UserModel = require("../Models/UsersModel");
const mongoose = require("mongoose");

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

const getRestaurants = async (req, res) => {
  try {
    if (req.user.role !== Roles.CLIENT) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const restaurants = await RestaurantModel.find({
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      userstatus: UserStatus.ACTIVE,
    })
      .select("restaurantName logo cuisineType businessAddress availabilityStatus")
      .sort({ restaurantName: 1 });

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getRestaurantProducts = async (req, res) => {
  try {
    if (req.user.role !== Roles.CLIENT) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurant = await RestaurantModel.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (
      restaurant.availabilityStatus !== AvailabilityStatus.AVAILABLE ||
      restaurant.userstatus !== UserStatus.ACTIVE
    ) {
      return res.status(400).json({ message: "Restaurant is currently unavailable" });
    }

    const products = await ProductModel.find({
      restaurant: restaurantId,
      isAvailable: true,
    })
      .select("name description price image isAvailable category")
      .sort({ name: 1 })
      .populate("category", "_id name");

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  register,
  getRestaurants,
  getRestaurantProducts,
};
