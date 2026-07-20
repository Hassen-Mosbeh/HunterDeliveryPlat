const CategoryModel = require("../Models/CategoryModel");
const ProductModel = require("../Models/ProductModel");


const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const restaurantId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const normalizedName = name.trim().toLowerCase();

    const normalizedDescription = description ? description.trim() : "";

    const existingCategory = await CategoryModel.findOne({
      restaurant: restaurantId,
      name: normalizedName,
    });

    if (existingCategory) {
      return res
        .status(409)
        .json({ message: "Category with this name already exists" });
    }

    const category = await CategoryModel.create({
      name: normalizedName,
      description: normalizedDescription,
      restaurant: restaurantId,
    });

    return res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: {
        category,
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

const getCategories = async (req, res) => {
  try {
    const restaurantId = req.user.id;

    const categories = await CategoryModel.find({
      restaurant: restaurantId,
    }).sort({ name: 1 });

    return res.status(200).json({
      status: "success",
      message: "Categories retrieved successfully",
      data: {
        categories,
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

const getCategoryById = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    const category = await CategoryModel.findOne({
      _id: id,
      restaurant: restaurantId,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Category retrieved successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    if (error && error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category id" });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await CategoryModel.findOne({
      _id: id,
      restaurant: restaurantId,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (!name && description === undefined) {
      return res.status(400).json({ message: "No fields to update" });
    }

    if (name) {
      const normalizedName = name.trim().toLowerCase();
      const existingCategory = await CategoryModel.findOne({
        restaurant: restaurantId,
        name: normalizedName,
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res
          .status(409)
          .json({ message: "Category with this name already exists" });
      }

      category.name = normalizedName;
    }

    if (description !== undefined) {
      category.description = description ? description.trim() : "";
    }

    await category.save();

    return res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    if (error && error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category id" });
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

const deleteCategory = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { id } = req.params;

    const product = await ProductModel.findOne({
      category: id,
      restaurant: restaurantId,
    });

    if (product) {
      return res.status(400).json({
        message: "Cannot delete category because it contains products.",
      });
    }

    const category = await CategoryModel.findOneAndDelete({
      _id: id,
      restaurant: restaurantId,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error && error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category id" });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
