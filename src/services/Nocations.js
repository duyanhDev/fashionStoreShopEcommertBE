const Notifications = require("../Model/Notifications");

const getNotifications = async (userId) => {
  try {
    const data = await Notifications.find({ userId: userId }).sort({
      createdAt: -1,
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};
const updateReadNocatifions = async (id) => {
  try {
    const data = await Notifications.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
module.exports = { getNotifications, updateReadNocatifions };
