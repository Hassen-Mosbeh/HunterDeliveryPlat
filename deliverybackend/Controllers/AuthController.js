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
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
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
  res.clearCookie("accessToken", { path: "/" });

  return res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
};
module.exports = {
  login,
  logout,
};
