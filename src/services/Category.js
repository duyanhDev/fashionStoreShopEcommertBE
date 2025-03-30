const Category = require("./../Model/Category");

const AddCategory = async (name, description) => {
  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      console.log("Danh mục đã tồn tại");
      return;
    }

    const newCategory = await Category.create({ name, description });

    return newCategory;
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
  }
};

const ListCategory = async () => {
  try {
    const data = await Category.find({}).sort({ _id: 1 });
    return data;
  } catch (error) {
    console.log(`Đã xảy ra lỗi:`, error);
  }
};
const ListOneCategory = async (id) => {
  try {
    const data = await Category.findOne({ _id: id });
    return data;
  } catch (error) {
    console.log(`Đã xảy ra lỗi:`, error);
  }
};

const UpdateOneCatogry = async (id, name, description) => {
  try {
    const data = await Category.updateOne(
      { _id: id },
      { name: name, description: description }
    );
    return data;
  } catch (error) {
    console.log(`Đã xảy ra lỗi:`, error);
  }
};

const DeleteOneCategory = async (id) => {
  try {
    const data = await Category.deleteOne({ _id: id });
    return data;
  } catch (error) {
    console.log(`Đã xảy ra lỗi:`, error);
  }
};
module.exports = {
  AddCategory,
  ListCategory,
  ListOneCategory,
  UpdateOneCatogry,
  DeleteOneCategory,
};
