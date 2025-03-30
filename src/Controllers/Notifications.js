const {
  getNotifications,
  updateReadNocatifions,
} = require("../services/Nocations");

const getNotificationsAPI = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await getNotifications(userId);

    return res.status(200).json({
      EC: 0,
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

const updateReadNocatifionsAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateReadNocatifions(id);
    return res.status(200).json({
      EC: 0,
      data: result,
    });
  } catch (error) {}
};

module.exports = { getNotificationsAPI, updateReadNocatifionsAPI };
