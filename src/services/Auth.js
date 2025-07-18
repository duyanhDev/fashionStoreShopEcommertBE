const Users = require("./../Model/User");
const jwt = require("jsonwebtoken");
require("dotenv").config;

// RegisterUser.js
const RegisterUser = async (name, email, password, isAdmin = false, avatar) => {
  try {
    const existingUser = await Users.findOne({ email });
    console.log(existingUser);
    if (existingUser) {
      return {
        success: false,
        message: "Email đã tồn tại",
      };
    }

    const newUser = new Users({ name, email, password, isAdmin, avatar });
    await newUser.save();

    return {
      success: true,
      user: newUser,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

const LoginUser = async (email, password) => {
  try {
    const user = await Users.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    return {
      token,
      refreshToken,
      user: user,
    };
  } catch (error) {
    throw error;
  }
};

const RefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await Users.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  RefreshToken,
};
