const { createChangeModel, getChangeModel } = require("../services/Change");

const createChangeModelAPI = async (req, res) => {
  try {
    const { newChangelog } = req.body;

    const saved = await createChangeModel(newChangelog);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getChangeModelAPI = async (req, res) => {
  try {
    const data = await getChangeModel();
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { createChangeModelAPI, getChangeModelAPI };
