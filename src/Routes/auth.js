const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../Middlewares/auth"); // Import middleware
const User = require("../Model/User");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

// Route đăng nhập bằng Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Route callback sau khi Google xác thực
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Tạo JWT token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Chuyển hướng về frontend với token
    res.redirect(
      `https://fashion-store-shop-ecommert.vercel.app/?token=${token}`
    );
  }
);

// Route kiểm tra thông tin user (bảo vệ bằng middleware)
router.get("/user", authMiddleware, (req, res) => {
  res.json({
    message: "Đã xác thực thành công",
    _id: req.userId,
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
    role: req.user.role,
    avatar: req.user.avatar, // Trả về avatar
  });
});

// ========== FACEBOOK LOGIN ==========
router.post("/facebook", async (req, res) => {
  console.log("Facebook login...");

  const { accessToken, userID } = req.body;

  try {
    // Lấy thông tin từ Facebook
    const fbRes = await axios.get(
      `https://graph.facebook.com/v12.0/${userID}?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const fbUser = fbRes.data;

    // ✅ Tìm user theo facebookId hoặc email
    let user = await User.findOne({
      $or: [{ facebookId: fbUser.id }, { email: fbUser.email }],
    });

    // ✅ Nếu chưa có user, thì tạo mới
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      user = new User({
        facebookId: fbUser.id,
        name: fbUser.name,
        email: fbUser.email || "",
        password: randomPassword,
        avatar: fbUser.picture?.data?.url || "",
      });
      await user.save();
    }

    // ✅ Nếu có user nhưng chưa có facebookId, thì cập nhật
    if (!user.facebookId) {
      user.facebookId = fbUser.id;
      await user.save();
    }

    // ✅ Tạo JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error("Lỗi xác thực Facebook:", err.response?.data || err.message);
    res.status(500).json({ error: "Lỗi xác thực Facebook" });
  }
});

// ========== USER INFO ==========
router.get("/user", authMiddleware, (req, res) => {
  res.json({
    message: "Đã xác thực thành công",
    _id: req.userId,
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
    role: req.user.role,
    avatar: req.user.avatar,
  });
});

module.exports = router;
