const ChangeModel = require("../Model/ChangeSchema");

const createChangeModel = async (ChangelogModel) => {
  try {
    const newChangelog = new ChangeModel(ChangelogModel);

    const saved = await newChangelog.save();

    return saved;
  } catch (error) {
    console.log(error);
  }
};

const getChangeModel = async () => {
  try {
    const data = await ChangeModel.find({}).sort({ createdAt: -1 });

    return data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createChangeModel, getChangeModel };
