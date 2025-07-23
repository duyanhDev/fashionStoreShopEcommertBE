const express = require("express");
const verifyToken = require("../Middlewares/auth");
const checkPermission = require("../Middlewares/checkPermission");
const isAdmin = require("../Middlewares/isAdmin");
const RouterAPI = express.Router();
const {
  AddProductsAPI,
  ListProductsAPI,
  ListOneProductAPI,
  UpdateProductsAPI,
  PutFeedbackProductAPI,
  PutFeedbackProductsAPI,
  CategoryGenderAPI,
  CategoryGenderFitterAPI,
  toggleLikeRatingAPI,
  toggleLikeReply,
  ListSlugProductAPI,
  AddProductsFromExcelAPI,
  updateViewProductController,
} = require("./../Controllers/Products");
const {
  CreateCategoryAPI,
  ListCategoryAPI,
  ListCategoryOneAPI,
  UpdateOneCatogryAPI,
  DeleteOneCategoryAPI,
} = require("../Controllers/Category");

const {
  RegisterUserAPI,
  LoginUserAPI,
  ListUserAPI,
  ListOneUserAPI,
  UpDateProfileUserAPI,
  Forgotpassword,
  ChanglePasswordAPI,
  DeleteUser,
  sendOTP,
  verifyOTPAndRegister,
} = require("./../Controllers/Auth");
const {
  addToCart,
  getCartProduct,
  RemoveCartProductfirst,
  UpdateCartQuantity,
  addMultipleToCart,
} = require("./../Controllers/Cart");
const {
  CreateOrder,
  listOderUserId,
  UpDateOrder,
  getTotalProductsSoldByType,
  ListOderProducts,
  getTotalProductsSold,
  getOrderOneProduct,
  UpDateDelivered,
  UpDateCompleted,
  UpDateOrderStatus,
  filterOrdersByStatus,
} = require("../Controllers/Oder");

const { searchProductsByNameAPI } = require("../Controllers/SearchProductsAPI");
const { BotChatAPI } = require("../Controllers/BotChatApi");

const {
  getNotificationsAPI,
  updateReadNocatifionsAPI,
  AllReadNotificationsAPI,
  DeleteAllNotificationsAPI,
} = require("../Controllers/Notifications");

/// mess

const {
  sendMessageCutomerAPI,
  getMessages,
  sendMessageToAdminAPI,
  getMessagesList,
  UpdateStatusIsRead,
  getMessagesSenderList,
} = require("./../Controllers/MessageChat");

const {
  addVoucherAPI,
  listVoucherAPI,
  getListOneVoucherAPI,
  updateVoucher,
} = require("../Controllers/Voucher");
const { RefreshToken } = require("../services/Auth");
const {
  addToWishlist,
  getWishlist,
  RemoveToWishList,
} = require("../Controllers/WishList");
const {
  createBlogController,
  updateBlogController,
  getAllBlogController,
} = require("../Controllers/Blog");
const {
  handleGeminiRequest,
  generateBlogByGemini,
} = require("../Controllers/Gemini");
const {
  CreateSupplierAPI,
  FindAllSupplierAPI,
  FindOneIdSupplierAPI,
} = require("../Controllers/Supplier");

//product
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Thành công
 */
RouterAPI.get("/products", ListProductsAPI);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Thêm mới một sản phẩm
 *     tags: [Products]
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 */

RouterAPI.post("/products", verifyToken, isAdmin, AddProductsAPI);

// thêm sản phẩm mới bằng execl
RouterAPI.post(
  "/products/excel",
  verifyToken,
  isAdmin,
  AddProductsFromExcelAPI
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của một sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của sản phẩm
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin sản phẩm
 */
RouterAPI.get("/products/:id", ListOneProductAPI);

RouterAPI.get("/products-slug/:slug", ListSlugProductAPI);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Cập nhật thông tin chi tiết của một sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của sản phẩm
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cập nhật thông tin sản phẩm
 */
RouterAPI.put("/products/:id", verifyToken, isAdmin, UpdateProductsAPI);

// đánh giá
/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: đánh giá 1 sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của sản phẩm
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: đánh giá sản phẩm
 */
RouterAPI.post("/feedback", PutFeedbackProductAPI);

// đánh giá
/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: đánh giá nhiều sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của sản phẩm
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: đánh giá sản phẩm
 */
RouterAPI.post("/feedbacks-products", PutFeedbackProductsAPI);

RouterAPI.post("/like", toggleLikeRatingAPI);

RouterAPI.post("/products/replies", toggleLikeReply);

// gender products

RouterAPI.get("/categoryProductsFilter", CategoryGenderAPI);
RouterAPI.get(
  "/categoryfilter/:gender/:category/:page",
  CategoryGenderFitterAPI
);

// update view sản phẩm

RouterAPI.post("/product/update-view/:slug", updateViewProductController);

// Category

RouterAPI.post("/category", verifyToken, isAdmin, CreateCategoryAPI);

RouterAPI.get("/category", ListCategoryAPI);

RouterAPI.get("/category/:id", ListCategoryOneAPI);

RouterAPI.put("/category/:id", verifyToken, isAdmin, UpdateOneCatogryAPI);

RouterAPI.delete("/category/:id", verifyToken, isAdmin, DeleteOneCategoryAPI);

// Auth

RouterAPI.post("/register", RegisterUserAPI);
RouterAPI.post("/register-admin", verifyToken, isAdmin, RegisterUserAPI);
RouterAPI.post("/login", LoginUserAPI);
RouterAPI.get("/users", ListUserAPI);
RouterAPI.get("/profile-users", ListOneUserAPI);
// cập nhật profile cho user
RouterAPI.put("/updateProfile", UpDateProfileUserAPI);
// cập nhật profile admin
RouterAPI.put(
  "/updateProfile-admin",
  verifyToken,
  isAdmin,
  UpDateProfileUserAPI
);
RouterAPI.put("/changel-passsword", ChanglePasswordAPI);
RouterAPI.post("/forgetpassword", Forgotpassword);
RouterAPI.post("/refresh-token", RefreshToken);
RouterAPI.delete("/delete-user/:id", verifyToken, isAdmin, DeleteUser);

// Cart
RouterAPI.post("/cart", addToCart);
RouterAPI.post("/cart/add-many", addMultipleToCart);
RouterAPI.get("/cart/:userId", getCartProduct);
RouterAPI.put("/cart/:cartId/:itemId", RemoveCartProductfirst);
RouterAPI.put("/cart-update/:cartId/:itemId", UpdateCartQuantity);
// oders
RouterAPI.post("/order", CreateOrder);
RouterAPI.get("/order/:userId", listOderUserId);
RouterAPI.get("/get-total-products-sold", getTotalProductsSoldByType);
RouterAPI.get("/get-quantity-all", getTotalProductsSold);
RouterAPI.put(
  "/order/:id",
  verifyToken,
  checkPermission("order_approval"),
  UpDateOrder
); // duyệt đơn hàng
RouterAPI.post(
  "/check-orderShipping",
  verifyToken,
  checkPermission("order_approval"),
  UpDateDelivered
);
RouterAPI.post(
  "/check-orderCompleted",
  verifyToken,
  checkPermission("order_approval"),
  UpDateCompleted
);
RouterAPI.put("/update-order/:id", UpDateOrderStatus); // cập nhật trạng thái đơn hàng order_approval

RouterAPI.put(
  "/update-order-admin/:id",
  verifyToken,
  checkPermission("order_approval"),
  UpDateOrderStatus
); // cập nhật trạng thái đơn hàng order_approval

// all hóa đơn thanh toán order
RouterAPI.get("/get-order-all", ListOderProducts);
RouterAPI.get("/get-order-one/:id", getOrderOneProduct);

// lọc oder theo trạng thái

RouterAPI.post("/filter-order/:status", filterOrdersByStatus);

// notifications

RouterAPI.get("/notification/:userId", getNotificationsAPI);
RouterAPI.post("/notification/:id", updateReadNocatifionsAPI);
RouterAPI.put("/update-notification", AllReadNotificationsAPI);
RouterAPI.delete("/delete-notifications/:userId", DeleteAllNotificationsAPI);

// search

RouterAPI.get("/search/:page", searchProductsByNameAPI);

/// chat

RouterAPI.post("/customer/send", sendMessageCutomerAPI);
RouterAPI.post(
  "/admin/send",
  verifyToken, // Phải xác thực trước
  checkPermission("customer_support"),
  sendMessageToAdminAPI
);
RouterAPI.get("/message", getMessages);
RouterAPI.get("/message/all-users", getMessagesList);
RouterAPI.post("/update-isread", UpdateStatusIsRead);
RouterAPI.get("/get-list-sender/:sender", getMessagesSenderList);

// Voucher

RouterAPI.post("/add-voucher", verifyToken, isAdmin, addVoucherAPI);
RouterAPI.get("/voucher", listVoucherAPI);
RouterAPI.get("/voucher/:id", getListOneVoucherAPI);
RouterAPI.put("/update-voucher/:id", verifyToken, isAdmin, updateVoucher);

RouterAPI.post("/send-otp", sendOTP);
RouterAPI.post("/verify-otp", verifyOTPAndRegister);

// danh sách yêu thích

RouterAPI.post("/add-wishlist", addToWishlist);
RouterAPI.get("/get-wishlist/:userId", getWishlist);
RouterAPI.post("/remove-wishlist", RemoveToWishList);

// blog

RouterAPI.post("/create-blog", createBlogController);
RouterAPI.put("/post-view/:slug", updateBlogController);
RouterAPI.get("/all-blog", getAllBlogController);

RouterAPI.post("/ChatAI", BotChatAPI);
RouterAPI.post("/genminiAi", handleGeminiRequest);
RouterAPI.post("/generate-ai-blog", generateBlogByGemini);

// nhà cung cấp

RouterAPI.post("/create-supplier", CreateSupplierAPI);
RouterAPI.get("/supplier", FindAllSupplierAPI);
RouterAPI.get("/supplier-one/:id", FindOneIdSupplierAPI);
module.exports = RouterAPI;
