const mongoose = require("mongoose");
const { OrderStatus, PaymentMethod, PaymentStatus } = require("../utils/enums");

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtOrder: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "driver",
      default: null,
    },
    products: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "products must contain at least one item",
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: Number,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentStatus: {
      type: Number,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    status: {
      type: Number,
      enum: Object.values(OrderStatus || {}),
      default: OrderStatus ? OrderStatus.PENDING : 0,
    },
    estimatedDeliveryTime: {
      type: Number,
      min: 1,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

orderSchema.pre("validate", async function () {
  if (!Array.isArray(this.products) || this.products.length === 0) {
    return;
  }

  const productIds = this.products.map((item) => item.product);
  const ProductModel = require("./ProductModel");
  const products = await ProductModel.find({ _id: { $in: productIds } }).select(
    "restaurant",
  );

  if (products.length !== productIds.length) {
    this.invalidate("products", "One or more products are invalid");
    return;
  }

  const firstRestaurantId = String(products[0].restaurant);
  const hasMixedRestaurants = products.some(
    (product) => String(product.restaurant) !== firstRestaurantId,
  );

  if (hasMixedRestaurants) {
    this.invalidate(
      "products",
      "All products in an order must belong to the same restaurant",
    );
    return;
  }

  const orderRestaurantId = this.restaurant
    ? String(this.restaurant)
    : firstRestaurantId;

  if (orderRestaurantId !== firstRestaurantId) {
    this.invalidate(
      "restaurant",
      "Order restaurant must match all product restaurants",
    );
    return;
  }
});

orderSchema.index({ client: 1 });

orderSchema.index({ restaurant: 1 });

orderSchema.index({ driver: 1 });

orderSchema.index({ status: 1 });

orderSchema.index({ driver: 1, status: 1 });
module.exports = mongoose.model("order", orderSchema);
