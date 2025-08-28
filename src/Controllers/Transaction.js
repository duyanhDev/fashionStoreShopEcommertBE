const { showRevenue } = require("../services/transaction");

const getRevenue = async (req, res) => {
  try {
    const data = await showRevenue();

    return res.status(200).json({
      EC: 0,
      message: "Doanh thu",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getRevenue,
};
