const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../Middlewares/auth"); // Import middleware

const router = express.Router();

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
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
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

module.exports = router;
