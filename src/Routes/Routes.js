const express = require("express");
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
  SendverifyFileOTPUser,
  verifyOTPUser,
  DeleteUser,
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

const { addVoucherAPI, listVoucherAPI } = require("../Controllers/Voucher");
const { RefreshToken } = require("../services/Auth");
const {
  addToWishlist,
  getWishlist,
  RemoveToWishList,
} = require("../Controllers/WishList");
const {
  createBlogController,
  updateBlogController,
} = require("../Controllers/Blog");
const { handleGeminiRequest } = require("../Controllers/Gemini");

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

RouterAPI.post("/products", AddProductsAPI);

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
RouterAPI.put("/products/:id", UpdateProductsAPI);

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

RouterAPI.post(
  "/products/:productId/ratings/:ratingId/replies",
  toggleLikeReply
);

// gender products

RouterAPI.get("/categoryProductsFilter", CategoryGenderAPI);
RouterAPI.get(
  "/categoryfilter/:gender/:category/:page",
  CategoryGenderFitterAPI
);

// Category

RouterAPI.post("/category", CreateCategoryAPI);

RouterAPI.get("/category", ListCategoryAPI);

RouterAPI.get("/category/:id", ListCategoryOneAPI);

RouterAPI.put("/category/:id", UpdateOneCatogryAPI);

RouterAPI.delete("/category/:id", DeleteOneCategoryAPI);

// Auth

RouterAPI.post("/register", RegisterUserAPI);
RouterAPI.post("/login", LoginUserAPI);
RouterAPI.get("/users", ListUserAPI);
RouterAPI.get("/profile-users", ListOneUserAPI);
RouterAPI.put("/updateProfile", UpDateProfileUserAPI);
RouterAPI.put("/changel-passsword", ChanglePasswordAPI);
RouterAPI.post("/forgetpassword", Forgotpassword);
RouterAPI.post("/refresh-token", RefreshToken);
RouterAPI.delete("/delete-user/:id", DeleteUser);

// Cart
RouterAPI.post("/cart", addToCart);
RouterAPI.post("/cart/add-many", addMultipleToCart);
RouterAPI.get("/cart/:userId", getCartProduct);
RouterAPI.put("/cart/:cartId/:itemId", RemoveCartProductfirst);
RouterAPI.put("/cart-update/:cartId/:itemId", UpdateCartQuantity);
// oders
RouterAPI.post("/order", CreateOrder);
RouterAPI.get("/order/:userId", listOderUserId);
RouterAPI.put("/order/:id", UpDateOrder);
RouterAPI.get("/get-total-products-sold", getTotalProductsSoldByType);
RouterAPI.get("/get-quantity-all", getTotalProductsSold);
RouterAPI.post("/check-orderShipping", UpDateDelivered);
RouterAPI.post("/check-orderCompleted", UpDateCompleted);
RouterAPI.put("/update-order/:id", UpDateOrderStatus); // cập nhật trạng thái đơn hàng
// all hóa đơn thanh toán order
RouterAPI.get("/get-order-all", ListOderProducts);
RouterAPI.get("/get-order-one/:id", getOrderOneProduct);

// lọc oder theo trạng thái

RouterAPI.post("/filter-order/:status", filterOrdersByStatus);

// notifications

RouterAPI.get("/notification/:userId", getNotificationsAPI);
RouterAPI.post("/notification/:id", updateReadNocatifionsAPI);

// search

RouterAPI.get("/search/:page", searchProductsByNameAPI);

/// chat

RouterAPI.post("/customer/send", sendMessageCutomerAPI);
RouterAPI.post("/admin/send", sendMessageToAdminAPI);
RouterAPI.get("/message", getMessages);
RouterAPI.get("/message/all-users", getMessagesList);
RouterAPI.post("/update-isread", UpdateStatusIsRead);
RouterAPI.get("/get-list-sender/:sender", getMessagesSenderList);

// Voucher

RouterAPI.post("/add-voucher", addVoucherAPI);
RouterAPI.get("/voucher", listVoucherAPI);

// otp

RouterAPI.post("/otp", SendverifyFileOTPUser);
RouterAPI.put("/veryfy-otp", verifyOTPUser);

// danh sách yêu thích

RouterAPI.post("/add-wishlist", addToWishlist);
RouterAPI.get("/get-wishlist/:userId", getWishlist);
RouterAPI.post("/remove-wishlist", RemoveToWishList);

// blog

RouterAPI.post("/create-blog", createBlogController);
RouterAPI.put("/post-view/:slug", updateBlogController);

RouterAPI.post("/ChatAI", BotChatAPI);
RouterAPI.post("/genminiAi", handleGeminiRequest);

module.exports = RouterAPI;
