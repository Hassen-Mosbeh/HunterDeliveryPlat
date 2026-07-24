const mongoose = require("mongoose");
const CategoryModel = require("../../Models/CategoryModel");
const ProductModel = require("../../Models/ProductModel");
const OrderModel = require("../../Models/OrderModel");
const { OrderStatus } = require("../../utils/enums");

const getDashboard = async (req, res) => {
  try {
    const restaurantId = req.user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalCategories,
      totalProducts,
      totalOrders,
      pendingOrders,
      acceptedOrders,
      preparingOrders,
      readyOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      todayRevenueResult,
    ] = await Promise.all([
      CategoryModel.countDocuments({ restaurant: restaurantId }),
      ProductModel.countDocuments({ restaurant: restaurantId }),
      OrderModel.countDocuments({ restaurant: restaurantId }),
      OrderModel.countDocuments({ restaurant: restaurantId, status: OrderStatus.PENDING }),
      OrderModel.countDocuments({ restaurant: restaurantId, status: OrderStatus.ACCEPTED }),
      OrderModel.countDocuments({ restaurant: restaurantId, status: OrderStatus.PREPARING }),
      OrderModel.countDocuments({ restaurant: restaurantId, status: OrderStatus.READY_FOR_PICKUP }),
      OrderModel.countDocuments({ restaurant: restaurantId, status: OrderStatus.DELIVERED }),
      OrderModel.countDocuments({ restaurant: restaurantId, status: OrderStatus.CANCELLED }),
      OrderModel.countDocuments({
        restaurant: restaurantId,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }),
      OrderModel.aggregate([
        {
          $match: {
            restaurant: new mongoose.Types.ObjectId(restaurantId),
            status: OrderStatus.DELIVERED,
            createdAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
      ]),
    ]);

    const todayRevenue =
      todayRevenueResult.length > 0 ? todayRevenueResult[0].totalRevenue : 0;

    return res.status(200).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: {
        totalCategories,
        totalProducts,
        totalOrders,
        pendingOrders,
        acceptedOrders,
        preparingOrders,
        readyOrders,
        deliveredOrders,
        cancelledOrders,
        todayOrders,
        todayRevenue,
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

module.exports = {
  getDashboard,
};
