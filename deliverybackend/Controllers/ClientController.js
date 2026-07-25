const ClientModel = require("../Models/ClientModel");
const RestaurantModel = require("../Models/RestoModel");
const ProductModel = require("../Models/ProductModel");
const OrderModel = require("../Models/OrderModel");
const { Roles, AvailabilityStatus, UserStatus, OrderStatus, PaymentStatus, PaymentMethod } = require("../utils/enums");
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

const getRestaurantById = async (req, res) => {
  try {
    if (req.user.role !== Roles.CLIENT) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurant = await RestaurantModel.findOne({
      _id: id,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      userstatus: UserStatus.ACTIVE,
    }).select("restaurantName logo cuisineType businessAddress availabilityStatus");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const createOrder = async (req, res) => {
  try {
    if (req.user.role !== Roles.CLIENT) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { restaurant, products, deliveryAddress, paymentMethod } = req.body;

    if (!restaurant) {
      return res.status(400).json({ message: "restaurant is required" });
    }
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "products must be a non-empty array" });
    }
    if (!deliveryAddress || typeof deliveryAddress !== "string" || !deliveryAddress.trim()) {
      return res.status(400).json({ message: "deliveryAddress is required" });
    }
    if (paymentMethod === undefined || paymentMethod === null) {
      return res.status(400).json({ message: "paymentMethod is required" });
    }
    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurantDoc = await RestaurantModel.findById(restaurant).select(
      "userstatus availabilityStatus",
    );

    if (!restaurantDoc) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    if (restaurantDoc.userstatus !== UserStatus.ACTIVE) {
      return res.status(400).json({ message: "Restaurant is currently unavailable" });
    }
    if (restaurantDoc.availabilityStatus !== AvailabilityStatus.AVAILABLE) {
      return res.status(400).json({ message: "Restaurant is currently unavailable" });
    }

    const seen = new Set();
    for (let i = 0; i < products.length; i++) {
      const item = products[i];

      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: `Invalid product ID at index ${i}` });
      }

      if (seen.has(item.product)) {
        return res.status(400).json({ message: `Duplicate product at index ${i}` });
      }
      seen.add(item.product);

      if (
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({ message: `quantity must be a positive integer at index ${i}` });
      }
    }

    const productIds = products.map((item) => item.product);
    const productDocs = await ProductModel.find({ _id: { $in: productIds } }).select(
      "price restaurant isAvailable",
    );

    if (productDocs.length !== productIds.length) {
      return res.status(400).json({ message: "One or more products not found" });
    }

    const productMap = {};
    for (const doc of productDocs) {
      productMap[doc._id.toString()] = doc;
    }

    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      const doc = productMap[item.product];

      if (doc.restaurant.toString() !== restaurant) {
        return res
          .status(400)
          .json({ message: `Product at index ${i} does not belong to this restaurant` });
      }
      if (!doc.isAvailable) {
        return res
          .status(400)
          .json({ message: `Product at index ${i} is not available` });
      }
    }

    let totalPrice = 0;
    const orderProducts = products.map((item) => {
      const price = productMap[item.product].price;
      totalPrice += price * item.quantity;
      return {
        product: item.product,
        quantity: item.quantity,
        priceAtOrder: price,
      };
    });

    totalPrice = Math.round(totalPrice * 100) / 100;

    const order = await OrderModel.create({
      client: req.user.id,
      restaurant,
      products: orderProducts,
      totalPrice,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PENDING,
    });

    const populatedOrder = await OrderModel.findById(order._id).populate(
      "products.product",
      "name price image",
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

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
  getRestaurantById,
  createOrder,
};
