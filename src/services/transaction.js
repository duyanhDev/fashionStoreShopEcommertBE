const Transaction = require("../Model/transactionSchema");

const showRevenue = async () => {
  try {
    const data = await Transaction.find({}).sort({ createdAt: -1 }).exec();

    return data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  showRevenue,
};
