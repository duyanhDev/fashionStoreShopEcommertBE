const express = require("express");
const http = require("http");
const app = express();
const connectDB = require("./Config/db");
const RouterAPI = require("./Routes/Routes");
require("dotenv").config();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const port = process.env.PORT;
const qs = require("qs");
const crypto = require("crypto");
const { Server } = require("socket.io");
const server = http.createServer(app);

const passport = require("passport");
const configurePassport = require("./Config/passport");
const authRoutes = require("./Routes/auth");
const session = require("express-session");
const startCron = require("./Cron/cron"); // file chứa cron
const Order = require("./Model/Order");
// Cấu hình CORS cho Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "https://fashionstoreshopecommertbe.onrender.com",
      "https://fashion-store-shop-ecommert.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: [
      "https://fashionstoreshopecommertbe.onrender.com",
      "https://fashion-store-shop-ecommert.vercel.app", // Xóa dấu `/` ở cuối
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"], // thêm x-requested-with vào đây
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

app.use(fileUpload());

// Route cơ bản
app.get("/", (req, res) => {
  res.send("Hello World 1234 !");
});

const config = {
  app_id: "554",
  key1: "8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn",
  key2: "uUfsWgfLkRLzq6W2uNXTCxrfxs51auny",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};
app.post("/zalopay-callback", async (req, res) => {
  try {
    const callback_data = req.body;

    // Verify callback data
    const data =
      callback_data.app_id +
      "|" +
      callback_data.app_trans_id +
      "|" +
      callback_data.app_user +
      "|" +
      callback_data.amount +
      "|" +
      callback_data.app_time +
      "|" +
      callback_data.embed_data +
      "|" +
      callback_data.item;

    const mac = crypto
      .createHmac("sha256", config.key2)
      .update(data)
      .digest("hex");

    // Kiểm tra tính toàn vẹn của callback data
    if (mac !== callback_data.mac) {
      console.error("Invalid MAC");
      return res.status(400).json({
        return_code: -1,
        return_message: "MAC không hợp lệ",
      });
    }

    // Parse embed_data và item
    const embed_data = JSON.parse(callback_data.embed_data);
    const item = JSON.parse(callback_data.item);

    // Xử lý theo trạng thái giao dịch
    switch (parseInt(callback_data.status)) {
      case 1: // Thanh toán thành công
        // Cập nhật trạng thái đơn hàng trong database
        await Order.findOneAndUpdate(
          { app_trans_id: callback_data.app_trans_id },
          {
            status: "PAID",
            zp_trans_id: callback_data.zp_trans_id,
            payment_time: new Date(parseInt(callback_data.app_time)),
          }
        );

        // Gửi email xác nhận thanh toán cho khách hàng
        await sendPaymentConfirmationEmail({
          email: embed_data.email,
          orderId: callback_data.app_trans_id,
          amount: callback_data.amount,
        });

        break;

      case 2: // Giao dịch thất bại
        await Order.findOneAndUpdate(
          { app_trans_id: callback_data.app_trans_id },
          {
            status: "FAILED",
            error_message: callback_data.error_message,
          }
        );
        break;

      case 3: // Giao dịch hoàn tiền
        await Order.findOneAndUpdate(
          { app_trans_id: callback_data.app_trans_id },
          {
            status: "REFUNDED",
            refund_time: new Date(parseInt(callback_data.app_time)),
          }
        );
        break;

      default:
        console.warn("Unexpected transaction status:", callback_data.status);
    }

    // Trả về response cho ZaloPay
    return res.status(200).json({
      return_code: 1,
      return_message: "success",
    });
  } catch (error) {
    console.error("Callback processing error:", error);
    return res.status(500).json({
      return_code: 0,
      return_message: "Callback processing failed",
    });
  }
});

// Thêm Router API
app.use("/api/v1/", RouterAPI);
app.use("/auth", authRoutes);
app.set("io", io);
// Kết nối Socket.IO
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

const userSocketMap = new Map();

let OnlineCount = 0;
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  OnlineCount++;

  io.emit("updateOnlineCount", OnlineCount);

  socket.on("register", ({ userId }) => {
    socket.userId = userId;
    userSocketMap.set(userId, socket.id);
    socket.join(userId);
    console.log(`User registered: ${userId} with socketId: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    OnlineCount--;
    io.emit("updateOnlineCount", OnlineCount);
    if (socket.userId) {
      userSocketMap.delete(socket.userId);
    }
    console.log("User disconnected:", socket.id);
  });
});
// Kết nối DB và khởi động server

app.post("/api/sepay/webhook", async (req, res) => {
  const { content, transferAmount } = req.body;
  const match = content.match(/DH(\w+)/);
  const orderId = match ? match[1] : null;

  if (!orderId)
    return res
      .status(400)
      .json({ success: false, message: "Order ID not found" });

  const order = await Order.findById(orderId);
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  // So sánh số tiền
  if (order.totalAmount !== transferAmount)
    return res.status(400).json({ success: false, message: "Amount mismatch" });

  order.paymentStatus = "COMPLETED";
  await order.save();

  res.json({ success: true });
});

(async () => {
  try {
    await connectDB();
    startCron();
    server.listen(port, () => {
      console.log(`Backend zero app listening on port ${port}`);
    });
  } catch (error) {
    console.log(">>check error connection db", error);
  }
})();
