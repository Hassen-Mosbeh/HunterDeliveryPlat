const mongoose = require("mongoose");
const OrderModel = require("../../Models/OrderModel");
const { OrderStatus } = require("../../utils/enums");

const findRestaurantOrder = async (restaurantId, orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid order id");
  }

  return OrderModel.findOne({
    _id: orderId,
    restaurant: restaurantId,
  });
};

const getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { status } = req.query;
    const query = {
      restaurant: restaurantId,
    };

    if (status !== undefined) {
      const normalizedStatus = Number(status);

      if (!Object.values(OrderStatus).includes(normalizedStatus)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      query.status = normalizedStatus;
    }

    const orders = await OrderModel.find(query)
      .populate("client", "firstname lastname phone")
      .populate("driver", "firstname lastname phone")
      .populate("products.product", "name image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "Orders retrieved successfully",
      data: {
        orders,
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

const getOrderById = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    const order = await findRestaurantOrder(restaurantId, id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.populate([
      { path: "client", select: "firstname lastname phone" },
      { path: "driver", select: "firstname lastname phone" },
      { path: "products.product", select: "name image price" },
    ]);

    return res.status(200).json({
      status: "success",
      message: "Order retrieved successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    if (error && error.message === "Invalid order id") {
      return res.status(400).json({ message: "Invalid order id" });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    const order = await findRestaurantOrder(restaurantId, id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({ message: "Order cannot be accepted" });
    }

    order.status = OrderStatus.PREPARING;

    await order.save();

    return res.status(200).json({
      status: "success",
      message: "Order accepted successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    if (error && error.message === "Invalid order id") {
      return res.status(400).json({ message: "Invalid order id" });
    }

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

const rejectOrder = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    const order = await findRestaurantOrder(restaurantId, id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({ message: "Order cannot be rejected" });
    }

    order.status = OrderStatus.CANCELLED;

    await order.save();

    return res.status(200).json({
      status: "success",
      message: "Order rejected successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    if (error && error.message === "Invalid order id") {
      return res.status(400).json({ message: "Invalid order id" });
    }

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

const updateOrderStatus = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const order = await findRestaurantOrder(restaurantId, id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.DELIVERED
    ) {
      if (order.status === OrderStatus.CANCELLED) {
        return res.status(400).json({
          message: "Cancelled orders cannot be updated.",
        });
      }

      return res.status(400).json({
        message: "Delivered orders cannot be updated.",
      });
    }

    if (order.status !== OrderStatus.PREPARING) {
      return res.status(400).json({
        message: "Only preparing orders can be updated.",
      });
    }

    if (status === undefined) {
      return res.status(400).json({ message: "status is required" });
    }

    const normalizedStatus = Number(status);

    if (!Object.values(OrderStatus).includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    if (normalizedStatus !== OrderStatus.READY_FOR_PICKUP) {
      return res.status(400).json({
        message: "Restaurant can only update an order to READY_FOR_PICKUP.",
      });
    }

    order.status = OrderStatus.READY_FOR_PICKUP;

    await order.save();

    return res.status(200).json({
      status: "success",
      message: "Order status updated successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    if (error && error.message === "Invalid order id") {
      return res.status(400).json({ message: "Invalid order id" });
    }

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
  getRestaurantOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
};
