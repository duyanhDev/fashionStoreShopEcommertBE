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

//product

RouterAPI.get("/products", ListProductsAPI);

RouterAPI.post("/products", AddProductsAPI);

RouterAPI.get("/products/:id", ListOneProductAPI);

RouterAPI.put("/products/:id", UpdateProductsAPI);

RouterAPI.post("/feedback", PutFeedbackProductAPI);
RouterAPI.post("/feedbacks-products", PutFeedbackProductsAPI);

RouterAPI.post("/like", toggleLikeRatingAPI);

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
RouterAPI.delete("/delete-user/:id", DeleteUser);

// Cart
RouterAPI.post("/cart", addToCart);
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
// all hóa đơn thanh toán order
RouterAPI.get("/get-order-all", ListOderProducts);
RouterAPI.get("/get-order-one/:id", getOrderOneProduct);
RouterAPI.post("/ChatAI", BotChatAPI);

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
module.exports = RouterAPI;
