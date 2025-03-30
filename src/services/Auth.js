const Users = require("./../Model/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
require("dotenv").config;

let transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "dangtrinhduyanh100202@gmail.com",
    pass: "qfmc zizc ppdg ldjg",
  },
});

const RegisterUser = async (name, email, password, isAdmin = false, avatar) => {
  try {
    // Kiểm tra email đã tồn tại hay chưa
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      throw new Error("Email đã tồn tại");
    }

    // Tạo người dùng mới
    const newUser = new Users({ name, email, password, isAdmin, avatar });

    // Lưu vào cơ sở dữ liệu
    return await newUser.save();
  } catch (error) {
    // Trả lỗi để xử lý bên ngoài
    throw error;
  }
};

const LoginUser = async (email, password) => {
  try {
    const user = await Users.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
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

const SendverifyFileOTP = async (email) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo OTP 6 chữ số
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

    // Mã hóa OTP
    const hashedOTP = await bcrypt.hash(otp, 10);

    let user = await Users.findOneAndUpdate(
      { email },
      { otp: hashedOTP, otpExpires: otpExpires },
      { new: true }
    );

    if (!user) {
      return { success: false, message: "Email không tồn tại!" };
    }
    const mailOptions = {
      from: "your-email@gmail.com",
      to: email,
      subject: "Mã OTP của bạn",
      text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
    };

    await transporter.sendMail(mailOptions);
    return otp;
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống", error };
  }
};

const verifyOTP = async (email, otp) => {
  try {
    const user = await Users.findOne({ email });

    if (!user || !user.otp || user.otpExpires < new Date()) {
      return { success: false, message: "OTP không hợp lệ hoặc đã hết hạn" };
    }

    // So sánh OTP nhập vào với OTP đã mã hóa
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return { success: false, message: "OTP không chính xác" };
    }

    // Xóa OTP sau khi xác thực thành công
    await Users.findOneAndUpdate(
      { email },
      { $unset: { otp: 1, otpExpires: 1 } }
    );

    return { success: true, message: "Xác thực OTP thành công" };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống", error };
  }
};
module.exports = {
  RegisterUser,
  LoginUser,
  SendverifyFileOTP,
  verifyOTP,
};
