const bcrypt = require("bcryptjs");
const UserModel = require("../Models/UsersModel");

const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          userType: user.userType,
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

const updateMe = async (req, res) => {
  try {
    const updates = {};

    if (req.body.email !== undefined) {
      updates.email = req.body.email.toLowerCase().trim();
    }

    if (req.body.phone !== undefined) {
      updates.phone = req.body.phone.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          userType: user.userType,
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

    return res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "currentPassword and newPassword are required",
      });
    }

    const user = await UserModel.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let isPasswordValid = false;

    if (typeof user.comparePassword === "function") {
      isPasswordValid = await user.comparePassword(currentPassword);
    } else {
      isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const deleteMe = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
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
  getMe,
  updateMe,
  changePassword,
  deleteMe,
};
