const bcrypt = require("bcryptjs");
const UserModel = require("../Models/UsersModel");
const createToken = require("../utils/createToken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let isPasswordValid = false;

    if (typeof user.comparePassword === "function") {
      isPasswordValid = await user.comparePassword(password);
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);
    const basicUser = {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      userType: user.userType,
    };

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        token,
        user: user.id
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

const logout = async (req, res) => {
  return res.status(200).json({ message: "Logout successful" });
};

module.exports = {
  login,
  logout,
};
