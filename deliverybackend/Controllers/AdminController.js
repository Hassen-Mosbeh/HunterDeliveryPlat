const mongoose = require("mongoose");
const DriverModel = require("../Models/DriverModel");
const OrderModel = require("../Models/OrderModel");
const {
  OrderStatus,
  Roles,
  UserStatus,
  AvailabilityStatus,
} = require("../utils/enums");

const getDrivers = async (req, res) => {
  try {
    const { availabilityStatus, userStatus } = req.query;

    const filter = {};
    if (availabilityStatus !== undefined) {
      filter.availabilityStatus = Number(availabilityStatus);
    }
    if (userStatus !== undefined) {
      filter.userstatus = Number(userStatus);
    }

    const drivers = await DriverModel.find(filter)
      .select("-password -__v")
      .lean();

    const driversWithCounts = await Promise.all(
      drivers.map(async (driver) => {
        const activeOrdersCount = await OrderModel.countDocuments({
          driver: driver._id,
          status: { $nin: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
        });
        return {
          _id: driver._id,
          name: `${driver.firstname} ${driver.lastname}`.trim(),
          email: driver.email,
          phone: driver.phone,
          availabilityStatus: driver.availabilityStatus,
          userStatus: driver.userstatus,
          activeOrdersCount,
          createdAt: driver.createdAt,
        };
      }),
    );

    driversWithCounts.sort((a, b) => {
      if (b.availabilityStatus !== a.availabilityStatus) {
        return b.availabilityStatus - a.availabilityStatus;
      }
      return a.activeOrdersCount - b.activeOrdersCount;
    });

    return res.status(200).json({
      success: true,
      count: driversWithCounts.length,
      data: driversWithCounts,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const { status, restaurantId, driverId } = req.query;

    const filter = {};

    if (status !== undefined) {
      filter.status = Number(status);
    }

    if (restaurantId) {
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid restaurantId" });
      }
      filter.restaurant = restaurantId;
    }

    if (driverId !== undefined) {
      if (driverId === "unassigned") {
        filter.driver = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(driverId)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid driverId" });
        }
        filter.driver = driverId;
      }
    }

    const orders = await OrderModel.find(filter)
      .populate("client", "_id firstname lastname phone")
      .populate("restaurant", "_id restaurantName businessAddress phone")
      .populate("driver", "_id firstname lastname phone")
      .sort({ createdAt: -1 })
      .lean();

    const data = orders.map((order) => ({
      ...order,
      client: order.client
        ? {
            _id: order.client._id,
            name: `${order.client.firstname || ""} ${order.client.lastname || ""}`.trim(),
            phone: order.client.phone,
          }
        : null,
      restaurant: order.restaurant
        ? {
            _id: order.restaurant._id,
            restaurantName: order.restaurant.restaurantName,
            businessAddress: order.restaurant.businessAddress,
            phone: order.restaurant.phone,
          }
        : null,
      driver: order.driver
        ? {
            _id: order.driver._id,
            name: `${order.driver.firstname || ""} ${order.driver.lastname || ""}`.trim(),
            phone: order.driver.phone,
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const assignDriver = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid orderId" });
    }
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid driverId" });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.status === OrderStatus.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign driver to a cancelled order",
      });
    }
    if (order.status === OrderStatus.DELIVERED) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign driver to a delivered order",
      });
    }
    if (order.status !== OrderStatus.READY_FOR_PICKUP) {
      return res.status(400).json({
        success: false,
        message: "Order must be in READY_FOR_PICKUP status",
      });
    }
    if (order.driver) {
      return res.status(400).json({
        success: false,
        message: "Order already has a driver assigned",
      });
    }

    const driver = await DriverModel.findById(driverId)
      .select("-password -__v")
      .lean();
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }
    if (driver.userstatus !== UserStatus.ACTIVE) {
      return res
        .status(400)
        .json({ success: false, message: "Driver is not active" });
    }

    // if (driver.availabilityStatus !== AvailabilityStatus.AVAILABLE) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Driver is not available" });
    // }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { driver: driverId, status: OrderStatus.OUT_FOR_DELIVERY },
      { new: true },
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Driver assigned successfully",
      data: {
        _id: updatedOrder._id,
        status: updatedOrder.status,
        driver: {
          _id: driver._id,
          name: `${driver.firstname} ${driver.lastname}`.trim(),
          phone: driver.phone,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getDriverById = async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid driverId" });
    }

    const driver = await DriverModel.findById(driverId)
      .select("-password -__v")
      .lean();

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    const [activeOrdersCount, activeOrders] = await Promise.all([
      OrderModel.countDocuments({
        driver: driver._id,
        status: { $nin: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
      }),
      OrderModel.find({
        driver: driver._id,
        status: { $nin: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
      })
        .populate("restaurant", "_id restaurantName")
        .populate("client", "_id firstname lastname phone")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const data = {
      _id: driver._id,
      name: `${driver.firstname} ${driver.lastname}`.trim(),
      email: driver.email,
      phone: driver.phone,
      availabilityStatus: driver.availabilityStatus,
      userStatus: driver.userstatus,
      createdAt: driver.createdAt,
      activeOrdersCount,
      activeOrders: activeOrders.map((order) => ({
        _id: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
        restaurant: order.restaurant
          ? {
              _id: order.restaurant._id,
              restaurantName: order.restaurant.restaurantName,
            }
          : null,
        client: order.client
          ? {
              _id: order.client._id,
              name: `${order.client.firstname || ""} ${order.client.lastname || ""}`.trim(),
              phone: order.client.phone,
            }
          : null,
      })),
    };

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid orderId" });
    }

    const order = await OrderModel.findById(orderId)
      .populate("client", "_id firstname lastname phone")
      .populate("restaurant", "_id restaurantName businessAddress phone")
      .populate("driver", "_id firstname lastname phone")
      .lean();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const data = {
      _id: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.deliveryAddress,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      notes: order.notes,
      products: order.products,
      createdAt: order.createdAt,
      client: order.client
        ? {
            _id: order.client._id,
            name: `${order.client.firstname || ""} ${order.client.lastname || ""}`.trim(),
            phone: order.client.phone,
          }
        : null,
      restaurant: order.restaurant
        ? {
            _id: order.restaurant._id,
            restaurantName: order.restaurant.restaurantName,
            businessAddress: order.restaurant.businessAddress,
            phone: order.restaurant.phone,
          }
        : null,
      driver: order.driver
        ? {
            _id: order.driver._id,
            name: `${order.driver.firstname || ""} ${order.driver.lastname || ""}`.trim(),
            phone: order.driver.phone,
          }
        : null,
    };

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const [
      totalDrivers,
      activeDrivers,
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyForPickupOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      unassignedOrders,
      todayOrders,
      todayRevenueResult,
    ] = await Promise.all([
      DriverModel.countDocuments(),
      DriverModel.countDocuments({
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        userstatus: UserStatus.ACTIVE,
      }),
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ status: OrderStatus.PENDING }),
      OrderModel.countDocuments({ status: OrderStatus.PREPARING }),
      OrderModel.countDocuments({ status: OrderStatus.READY_FOR_PICKUP }),
      OrderModel.countDocuments({ status: OrderStatus.OUT_FOR_DELIVERY }),
      OrderModel.countDocuments({ status: OrderStatus.DELIVERED }),
      OrderModel.countDocuments({ status: OrderStatus.CANCELLED }),
      OrderModel.countDocuments({
        driver: null,
        status: OrderStatus.READY_FOR_PICKUP,
      }),
      OrderModel.countDocuments({
        createdAt: { $gte: startOfDay },
      }),
      OrderModel.aggregate([
        {
          $match: {
            status: OrderStatus.DELIVERED,
            createdAt: { $gte: startOfDay },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    const todayRevenue =
      todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalDrivers,
        activeDrivers,
        totalOrders,
        pendingOrders,
        preparingOrders,
        readyForPickupOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        unassignedOrders,
        todayOrders,
        todayRevenue,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getDrivers,
  getOrders,
  assignDriver,
  getDriverById,
  getOrderById,
  getDashboard,
};
