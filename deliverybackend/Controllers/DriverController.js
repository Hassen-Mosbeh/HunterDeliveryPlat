const mongoose = require('mongoose');
const DriverModel = require("../Models/DriverModel");
const OrderModel = require("../Models/OrderModel");
const { Roles, OrderStatus } = require("../utils/enums");
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

const getAvailableDeliveries = async (req, res) => {
  try {
    const orders = await OrderModel.find({
      driver: req.user.id,
      status: OrderStatus.OUT_FOR_DELIVERY,
    })
      .populate('restaurant', '_id restaurantName businessAddress phone')
      .populate('client', '_id firstname lastname phone')
      .sort({ createdAt: 1 })
      .lean();

    const data = orders.map((order) => ({
      _id: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      deliveryAddress: order.deliveryAddress,
      restaurant: order.restaurant
        ? {
            _id: order.restaurant._id,
            restaurantName: order.restaurant.restaurantName,
            businessAddress: order.restaurant.businessAddress,
            phone: order.restaurant.phone,
          }
        : null,
      client: order.client
        ? {
            _id: order.client._id,
            name: `${order.client.firstname || ''} ${order.client.lastname || ''}`.trim(),
            phone: order.client.phone,
          }
        : null,
    }));

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getCurrentDeliveries = async (req, res) => {
  try {
    const orders = await OrderModel.find({
      driver: req.user.id,
      status: { $nin: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
    })
      .populate('restaurant', '_id restaurantName businessAddress phone')
      .populate('client', '_id firstname lastname phone')
      .sort({ createdAt: -1 })
      .lean();

    const data = orders.map((order) => ({
      _id: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      deliveryAddress: order.deliveryAddress,
      restaurant: order.restaurant
        ? {
            _id: order.restaurant._id,
            restaurantName: order.restaurant.restaurantName,
            businessAddress: order.restaurant.businessAddress,
            phone: order.restaurant.phone,
          }
        : null,
      client: order.client
        ? {
            _id: order.client._id,
            name: `${order.client.firstname || ''} ${order.client.lastname || ''}`.trim(),
            phone: order.client.phone,
          }
        : null,
    }));

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid orderId' });
    }

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (String(order.driver) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Order does not belong to this driver' });
    }

    if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
      return res.status(400).json({ success: false, message: 'Order status must be OUT_FOR_DELIVERY to mark as delivered' });
    }

    order.status = OrderStatus.DELIVERED;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order delivered successfully',
      data: { _id: order._id, status: order.status },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getDeliveryHistory = async (req, res) => {
  try {
    const orders = await OrderModel.find({
      driver: req.user.id,
      status: OrderStatus.DELIVERED,
    })
      .populate('restaurant', '_id restaurantName businessAddress phone')
      .populate('client', '_id firstname lastname phone')
      .sort({ createdAt: -1 })
      .lean();

    const data = orders.map((order) => ({
      _id: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      deliveryAddress: order.deliveryAddress,
      deliveredAt: order.updatedAt,
      restaurant: order.restaurant
        ? {
            _id: order.restaurant._id,
            restaurantName: order.restaurant.restaurantName,
            businessAddress: order.restaurant.businessAddress,
            phone: order.restaurant.phone,
          }
        : null,
      client: order.client
        ? {
            _id: order.client._id,
            name: `${order.client.firstname || ''} ${order.client.lastname || ''}`.trim(),
            phone: order.client.phone,
          }
        : null,
    }));

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  register,
  getAvailableDeliveries,
  getCurrentDeliveries,
  updateDeliveryStatus,
  getDeliveryHistory,
};
