const {
  CreateSupplier,
  FindAllSupplier,
  FindOneIdSupplier,
} = require("../services/Supplier");

const CreateSupplierAPI = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      phone,
      email,
      address,
      website,
      taxCode,
      notes,
    } = req.body;

    if (
      !name ||
      !contactPerson ||
      !phone ||
      !email ||
      !address ||
      !website ||
      !taxCode ||
      !notes
    ) {
      throw new Error("Thiếu trường");
    }

    const formdata = {
      name: name,
      contactPerson: contactPerson,
      phone: phone,
      email: email,
      address: address,
      website: website,
      taxCode: taxCode,
      notes: notes,
    };

    const data = await CreateSupplier(formdata);

    return res.status(200).json({
      EC: 0,
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const FindAllSupplierAPI = async (req, res) => {
  try {
    const data = await FindAllSupplier();

    return res.status(200).json({
      EC: 0,
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const FindOneIdSupplierAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await FindOneIdSupplier(id);

    return res.status(200).json({
      EC: 0,
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  CreateSupplierAPI,
  FindAllSupplierAPI,
  FindOneIdSupplierAPI,
};
