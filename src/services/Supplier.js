const Supplier = require("../Model/Supplier");

const CreateSupplier = async (data) => {
  try {
    const result = await Supplier.create(data);

    return result;
  } catch (error) {
    console.log(error);
  }
};

const FindAllSupplier = async () => {
  try {
    const result = await Supplier.find({}).sort({ createdAt: -1 });

    return result;
  } catch (error) {
    console.log(error);
  }
};

const FindOneIdSupplier = async (id) => {
  try {
    const result = await Supplier.findById(id);

    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  CreateSupplier,
  FindAllSupplier,
  FindOneIdSupplier,
};
