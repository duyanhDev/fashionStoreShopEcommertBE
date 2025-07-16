const { uploadFileToCloudinary } = require("./../services/Cloudinary");
const {
  RegisterUser,
  LoginUser,
  SendverifyFileOTP,
  verifyOTP,
} = require("./../services/Auth");
const Users = require("./../Model/User");
const nodemailer = require("nodemailer");
require("dotenv").config;

const RegisterUserAPI = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    let avatarUrl = "";

    if (req.files && req.files.avatar) {
      const files = req.files.avatar;
      const result = await uploadFileToCloudinary(files);

      if (result && result.length > 0) {
        avatarUrl = result[0].secure_url;
      } else {
        return res.status(400).json({
          EC: 1,
          EM: "Không thể tải ảnh lên Cloudinary",
        });
      }
    }

    const dataUser = await RegisterUser(
      name,
      email,
      password,
      isAdmin,
      avatarUrl
    );

    // Trường hợp email đã tồn tại
    if (!dataUser.success) {
      return res.status(400).json({
        EC: 1,
        EM: dataUser.message,
      });
    }

    return res.status(200).json({
      EC: 0,
      EM: "Đăng ký thành công",
      data: dataUser.user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi máy chủ",
    });
  }
};

const LoginUserAPI = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await LoginUser(email, password);

    return res.status(200).json({
      EC: 0,
      data: {
        token: data.token,
        refreshToken: data.refreshToken,
        user: data.user,
      },
    });
  } catch (error) {
    return res.status(400).json({
      EC: 1,
      message: error.message,
    });
  }
};

const ListUserAPI = async (req, res) => {
  try {
    const users = await Users.find({});

    return res.status(200).json({
      EC: 0,
      data: users,
    });
  } catch (error) {
    console.log(error);
  }
};

const ListOneUserAPI = async (req, res) => {
  const { id } = req.query;

  const users = await Users.findOne({ _id: id });

  return res.status(201).json({
    EC: 0,
    data: users,
  });
};

// uploadprofile

const UpDateProfileUserAPI = async (req, res) => {
  try {
    const {
      id,
      name,
      city,
      district,
      ward,
      phone,
      gender,
      dateOfBirth,
      height,
      weight,
      role,
      permissions,
    } = req.body;
    console.log(
      id,
      name,
      city,
      district,
      ward,
      phone,
      gender,
      dateOfBirth,
      height,
      weight,
      role,
      permissions
    );

    const avatar = req.files?.avatar;

    console.log("avtar", avatar);

    // Tìm người dùng
    const UpdateUser = await Users.findById(id);

    if (!UpdateUser) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    // Cập nhật dữ liệu
    const updatedData = {
      name: name || UpdateUser.name,
      "address.city": city || UpdateUser.address.city,
      "address.district": district || UpdateUser.address.district,
      "address.ward": ward || UpdateUser.address.ward,
      phone: phone || UpdateUser.phone,
      gender: gender || UpdateUser.gender,
      dateOfBirth: dateOfBirth || UpdateUser.dateOfBirth,
      height: height || UpdateUser.height,
      weight: weight || UpdateUser.weight,
      role: role || UpdateUser.role,
      permissions: permissions || UpdateUser.permissions || "",
    };

    // Nếu có avatar mới
    if (avatar) {
      try {
        const result = await uploadFileToCloudinary(avatar);
        updatedData.avatar = result[0].secure_url;
      } catch (err) {
        return res.status(500).json({ error: "Tải ảnh lên thất bại" });
      }
    }

    // Cập nhật trong DB
    const updatedUser = await Users.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    return res
      .status(200)
      .json({ message: "Cập nhật thành công", user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// cập nhật mật khẩu
const ChanglePasswordAPI = async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;

    if (!id || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "Thiếu thông tin cần thiết" });
    }

    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    // so sánh mật khẩu cũ

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu cũ không chính xác",
      });
    }

    // Cập nhật mật khẩu
    user.password = newPassword;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {}
};

const Forgotpassword = async (req, res) => {
  try {
    let { email } = req.body;

    // Tìm người dùng theo email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email không tồn tại" });
    }

    // Thiết lập transporter để gửi email
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Tạo mật khẩu mới
    function generatePassword(length = 8) {
      const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let retVal = "";
      for (let i = 0; i < length; i++) {
        retVal += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return retVal;
    }
    const newPassword = generatePassword(); // Mật khẩu bạn tạo

    // Thiết lập thông tin email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Mật khẩu mới của bạn",
      html: `<p>Mật khẩu mới của bạn là: <strong>${newPassword}</strong></p>`, // Gửi mật khẩu gốc cho người dùng qua email
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    // Cập nhật mật khẩu đã mã hóa vào cơ sở dữ liệu
    user.password = newPassword;
    await user.save();

    return res
      .status(200)
      .json({ message: "Mật khẩu mới đã được gửi tới email của bạn" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Đã xảy ra lỗi, vui lòng thử lại sau" });
  }
};

// gửi mã otp

const SendverifyFileOTPUser = async (req, res) => {
  let { email } = req.body;
  if (!email) {
    throw new Error("Email không tồn tại");
  }
  const user = await SendverifyFileOTP(email);

  return res.status(200).json({
    EC: 0,
    data: user.otp,
  });
};

const verifyOTPUser = async (req, res) => {
  try {
    let { email, otp } = req.body;
    console.log(email, otp);

    const result = await verifyOTP(email, otp); // Nhận object { success, message }
    console.log(result);

    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result.success ? email : null, // Trả về email nếu OTP đúng
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const DeleteUser = async (req, res) => {
  try {
    let { id } = req.params;

    const user = await Users.deleteOne({ _id: id });
    const io = req.app.get("io");
    io.emit("userDeleted", { userId: id }); // phát đến toàn bộ client
    return res.status(201).json({
      EC: 0,
      message: "Bạn đã xóa thành công tài khoản",
      data: user,
    });
  } catch (error) {}
};

module.exports = {
  RegisterUserAPI,
  LoginUserAPI,
  ListUserAPI,
  ListOneUserAPI,
  UpDateProfileUserAPI,
  ChanglePasswordAPI,
  Forgotpassword,
  SendverifyFileOTPUser,
  verifyOTPUser,
  DeleteUser,
};
