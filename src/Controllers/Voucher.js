const { addVoucher, listVoucher } = require("../services/Voucher");

const addVoucherAPI = async (req, res) => {
  try {
    let {
      code,
      discountType,
      discountValue,
      minOrderValue,
      startDate,
      endDate,
      usageLimit,
      user,
      appliedUsers,
      userGroup,
      content,
    } = req.body;

    if (!code || !discountType || !discountValue || !startDate || !endDate) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }
    startDate = new Date(startDate);
    endDate = new Date(endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Ngày bắt đầu hoặc ngày kết thúc không hợp lệ." });
    }

    // Tạo object voucher
    const voucherData = {
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      startDate,
      endDate,
      usageLimit: usageLimit || 1,
      usedCount: 0,
      status: true,
      user: user || null,
      appliedUsers: appliedUsers || [],
      userGroup: userGroup || "all",
      content,
    };

    const newVoucher = await addVoucher(voucherData);

    return res.status(201).json({
      message: "Thêm voucher thành công",
      voucher: newVoucher,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// danh sách voucher

const listVoucherAPI = async (req, res) => {
  try {
    let data = await listVoucher();
    return res.status(200).json({
      EC: 0,
      data: data,
    });
  } catch (error) {
    console.error("Error in listVoucherAPI:", error);
    return res.status(500).json({
      Ec: 1,
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  addVoucherAPI,
  listVoucherAPI,
};
