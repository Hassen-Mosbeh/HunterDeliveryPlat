const mongoose = require("mongoose");
const ProductModel = require("../Models/ProductModel");
const CategoryModel = require("../Models/CategoryModel");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      preparationTime,
      isAvailable,
    } = req.body;
    const restaurantId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({ message: "price is required" });
    }

    if (!category) {
      return res.status(400).json({ message: "category is required" });
    }

    if (
      preparationTime === undefined ||
      preparationTime === null ||
      preparationTime === ""
    ) {
      return res.status(400).json({ message: "preparationTime is required" });
    }

    const normalizedName = name.trim().toLowerCase();
    const normalizedDescription = description ? description.trim() : "";
    const normalizedPrice = Number(price);
    const normalizedPreparationTime = Number(preparationTime);

    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if (
      !Number.isFinite(normalizedPreparationTime) ||
      normalizedPreparationTime < 1
    ) {
      return res.status(400).json({
        message: "Preparation time must be at least 1 minute",
      });
    }

    if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message: "isAvailable must be boolean",
      });
    }

    if (!normalizedName) {
      return res.status(400).json({ message: "name is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const categoryExists = await CategoryModel.exists({
      _id: category,
      restaurant: restaurantId,
    });

    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    const existingProduct = await ProductModel.findOne({
      restaurant: restaurantId,
      name: normalizedName,
    });

    if (existingProduct) {
      return res
        .status(409)
        .json({ message: "Product with this name already exists" });
    }

    const product = await ProductModel.create({
      name: normalizedName,
      description: normalizedDescription,
      price: normalizedPrice,
      image: typeof image === "string" ? image.trim() : "",
      restaurant: restaurantId,
      category,
      preparationTime: normalizedPreparationTime,
      isAvailable: isAvailable === undefined ? true : isAvailable,
    });

    return res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: {
        product,
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

const getProducts = async (req, res) => {
  try {
    const restaurantId = req.user.id;

    const products = await ProductModel.find({
      restaurant: restaurantId,
    })
      .populate("category", "_id name")
      .sort({ name: 1 });

    return res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      data: {
        products,
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

const getProductById = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await ProductModel.findOne({
      _id: id,
      restaurant: restaurantId,
    }).populate("category", "_id name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Product retrieved successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    if (error && error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product id" });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;
    const {
      name,
      description,
      price,
      image,
      category,
      preparationTime,
      isAvailable,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    if (price !== undefined) {
      const normalizedPrice = Number(price);

      if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
        return res.status(400).json({
          message: "Price must be greater than 0",
        });
      }
    }

    if (preparationTime !== undefined) {
      const normalizedPreparationTime = Number(preparationTime);

      if (
        !Number.isFinite(normalizedPreparationTime) ||
        normalizedPreparationTime < 1
      ) {
        return res.status(400).json({
          message: "Preparation time must be at least 1 minute",
        });
      }
    }

    if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message: "isAvailable must be boolean",
      });
    }

    const product = await ProductModel.findOne({
      _id: id,
      restaurant: restaurantId,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      name === undefined &&
      description === undefined &&
      price === undefined &&
      image === undefined &&
      category === undefined &&
      preparationTime === undefined &&
      isAvailable === undefined
    ) {
      return res.status(400).json({ message: "No fields to update" });
    }

    if (name !== undefined) {
      const normalizedName = name.trim().toLowerCase();

      if (!normalizedName) {
        return res.status(400).json({ message: "name is required" });
      }

      const existingProduct = await ProductModel.findOne({
        restaurant: restaurantId,
        name: normalizedName,
        _id: { $ne: id },
      });

      if (existingProduct) {
        return res
          .status(409)
          .json({ message: "Product with this name already exists" });
      }

      product.name = normalizedName;
    }

    if (description !== undefined) {
      product.description = description ? description.trim() : "";
    }

    if (price !== undefined) {
      product.price = normalizedPrice;
    }

    if (image !== undefined) {
      product.image = typeof image === "string" ? image.trim() : "";
    }

    if (category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: "Invalid category id" });
      }

      const categoryExists = await CategoryModel.exists({
        _id: category,
        restaurant: restaurantId,
      });

      if (!categoryExists) {
        return res.status(404).json({ message: "Category not found" });
      }

      product.category = category;
    }

    if (preparationTime !== undefined) {
      product.preparationTime = Number(preparationTime);
    }

    if (isAvailable !== undefined) {
      product.isAvailable = isAvailable;
    }

    await product.save();

    await product.populate("category", "_id name");

    return res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    if (error && error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product id" });
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

const deleteProduct = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await ProductModel.findOneAndDelete({
      _id: id,
      restaurant: restaurantId,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error && error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product id" });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
