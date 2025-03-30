const jwt = require("jsonwebtoken");
const Users = require("../Model/User");
require("dotenv").config(); // Fix: gọi config() để load env

const authMiddleware = async (req, res, next) => {
  console.log("JWT_SECRET từ env:", process.env.JWT_SECRET);

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Không có token trong request" });
  }

  const token = authHeader.split(" ")[1]; // Lấy token từ "Bearer <token>"
  console.log("Token:", token);

  if (!token) {
    return res.status(401).json({ message: "Token bị thiếu" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Lấy user từ database
    const user = await Users.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    req.user = user; // Lưu toàn bộ user vào req.user
    req.userId = user._id; // Giữ lại userId nếu cần
    next();
  } catch (err) {
    console.error("Lỗi xác thực token:", err.message); // Log lỗi
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = authMiddleware;
