const { uploadFileToCloudinary } = require("./../services/Cloudinary");
const {
  AddProducts,
  ListProducts,
  ListOneProducts,
  UpdateProducts,
  PutFeedbackProduct,
  PutFeedbackProducts,
  ProductFilter,
  CategoryGenderFitter,
  toggleLikeRating,
} = require("./../services/Product");
const Products = require("./../Model/Product");
const { json } = require("express");

const AddProductsAPI = async (req, res) => {
  const {
    name,
    gender,
    description,
    category,
    brand,
    care,
    price,
    discount,
    stock,
    size,
    color,
    costPrice,
  } = req.body;

  // Parse sizes and colors into arrays
  const sizeArray = Array.isArray(size)
    ? size
    : size.split(",").map((item) => item.trim());
  const colorArray = Array.isArray(color)
    ? color
    : color.split(",").map((item) => item.trim());

  // Upload images and associate them with colors
  let variants = [];

  if (req.files && req.files.images) {
    try {
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      // Ensure the number of colors matches the number of uploaded images
      if (files.length !== colorArray.length) {
        return res.status(400).json({
          success: false,
          message: "Số lượng ảnh phải khớp với số lượng màu sắc",
        });
      }

      // Upload all images at once using uploadFileToCloudinary
      const resultImages = await uploadFileToCloudinary(files);

      // Process each color and its associated image
      for (let i = 0; i < colorArray.length; i++) {
        const result = resultImages[i]; // Lấy kết quả tương ứng
        if (!result || !result.secure_url) {
          throw new Error(`Không thể tải lên ảnh cho màu ${colorArray[i]}`);
        }

        const variant = {
          color: colorArray[i],
          sizes: sizeArray.map((size) => ({
            size,
            quantity: stock,
            sold: 0,
          })),
          images: [{ url: result.secure_url }],
        };
        variants.push(variant);
      }
    } catch (uploadError) {
      console.error("Lỗi khi tải ảnh lên Cloudinary:", uploadError.message);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi khi tải ảnh lên Cloudinary" });
    }
  }
  const totalStock = variants.reduce(
    (acc, variant) =>
      acc + variant.sizes.reduce((sum, sz) => sum + (sz.quantity || 0), 0),
    0
  );
  const productData = {
    name,
    gender,
    description,
    category,
    brand,
    care,
    price,
    discount,
    totalStock,
    variants,
    costPrice,
  };

  try {
    const data = await AddProducts(productData);
    return res.status(200).json({
      EC: 0,
      data: data,
      message: "Thêm sản phẩm thành công",
    });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi khi thêm sản phẩm" });
  }
};

const ListProductsAPI = async (req, res) => {
  try {
    const data = await ListProducts();
    return res.status(201).json({
      EC: 0,
      data: data,
    });
  } catch (error) {
    console.error("Error list product:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error adding product" });
  }
};

const ListOneProductAPI = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await ListOneProducts(id);

    return res.status(201).json({
      EC: 0,
      data: data,
    });
  } catch (error) {
    console.error("Error list product:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error adding product" });
  }
};

// const UpdateProductsAPI = async (req, res) => {

//   try {
//     const {
//       name,
//       gender,
//       description,
//       category,
//       brand,
//       care,
//       price,
//       stock,
//       sold,
//       size,
//       color,
//       costPrice,
//     } = req.body;
//     const { id } = req.params;

//     // Lấy thông tin sản phẩm cũ từ database
//     const existingProduct = await Products.findById(id);
//     if (!existingProduct) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy sản phẩm",
//       });
//     }

//     // Xử lý size: giữ lại giá trị cũ nếu không có giá trị mới
//     const sizeArray = size
//       ? Array.isArray(size)
//         ? size
//         : size.split(",").map((item) => item.trim())
//       : existingProduct.size;

//     // Xử lý color: giữ lại giá trị cũ nếu không có giá trị mới
//     const colorArray = color
//       ? Array.isArray(color)
//         ? color
//         : color.split(",").map((item) => item.trim())
//       : existingProduct.color;

//     // Xử lý hình ảnh
//     let images = [...existingProduct.images];
//     if (req.files && req.files.images) {
//       const files = Array.isArray(req.files.images)
//         ? req.files.images
//         : [req.files.images];

//       // Xử lý màu mới và ảnh tương ứng
//       try {
//         const existingColors = existingProduct.color || [];
//         const newColors = colorArray.filter(
//           (color) => !existingColors.includes(color)
//         );

//         if (files.length !== newColors.length) {
//           return res.status(400).json({
//             success: false,
//             message:
//               "Số lượng ảnh mới phải khớp với số lượng màu mới được thêm vào",
//           });
//         }

//         // Gắn ảnh mới với màu mới
//         for (let i = 0; i < newColors.length; i++) {
//           const resultImage = await uploadFileToCloudinary(files[i]);
//           images.push({ color: newColors[i], url: resultImage.secure_url });
//         }
//       } catch (uploadError) {
//         console.error("Lỗi khi tải lên hình ảnh:", uploadError.message);
//         return res.status(500).json({
//           success: false,
//           message: "Lỗi khi tải lên hình ảnh",
//         });
//       }
//     }

//     // Tạo object chứa các trường cần update
//     const updateFields = {
//       name: name || existingProduct.name,
//       gender: gender || existingProduct.gender,
//       description: description || existingProduct.description,
//       category: category || existingProduct.category,
//       brand: brand || existingProduct.brand,
//       care: care || existingProduct.care,
//       price: price ? Number(price) : existingProduct.price,
//       stock: stock ? Number(stock) : existingProduct.stock,
//       sold: sold ? Number(sold) : existingProduct.sold,
//       size: sizeArray,
//       color: colorArray,
//       images: images,
//       costPrice: costPrice || existingProduct.costPrice,
//     };

//     // Update sản phẩm
//     const updatedProduct = await Products.findByIdAndUpdate(id, updateFields, {
//       new: true, // Trả về document sau khi update
//     });

//     return res.status(200).json({
//       success: true,
//       data: updatedProduct,
//       message: "Cập nhật sản phẩm thành công",
//     });
//   } catch (error) {
//     console.error("Lỗi cập nhật sản phẩm:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Lỗi khi cập nhật sản phẩm",
//     });
//   }
// };

// sửa feeckack

const UpdateProductsAPI = async (req, res) => {
  try {
    const {
      name,
      gender,
      description,
      category,
      brand,
      care,
      price,
      discount,
      stock,
      sold,
      size,
      color,
      costPrice,
    } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm là bắt buộc",
      });
    }

    const existingProduct = await Products.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const parseArray = (input) => {
      if (!input) return [];
      return Array.isArray(input)
        ? input.map((item) => String(item).trim()).filter(Boolean)
        : String(input)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    };

    const sizeArray = parseArray(size);
    const colorArray = parseArray(color);

    console.log("Parsed arrays:", { sizeArray, colorArray, stock });

    if (req.files?.images && colorArray.length > 0) {
      const filesCount = Array.isArray(req.files.images)
        ? req.files.images.length
        : 1;

      if (filesCount !== colorArray.length) {
        return res.status(400).json({
          success: false,
          message: `Số lượng ảnh (${filesCount}) phải khớp với số màu (${colorArray.length})`,
        });
      }
    }

    let variants = JSON.parse(JSON.stringify(existingProduct.variants || []));

    const findOrCreateVariant = (color) => {
      let variant = variants.find((v) => v.color === color);
      if (!variant) {
        variant = {
          color,
          sizes: [],
          images: [],
        };
        variants.push(variant);
      }
      return variant;
    };

    const updateVariantSizes = (
      variant,
      sizesToUpdate,
      stockValue = 0,
      isAddStock = false
    ) => {
      const existingSizesMap = new Map(variant.sizes.map((s) => [s.size, s]));

      if (sizesToUpdate.length > 0) {
        sizesToUpdate.forEach((sizeValue) => {
          if (existingSizesMap.has(sizeValue)) {
            const existingSize = existingSizesMap.get(sizeValue);
            existingSize.quantity = isAddStock
              ? (existingSize.quantity || 0) + Number(stockValue || 0)
              : Number(stockValue || existingSize.quantity || 0);
          } else {
            variant.sizes.push({
              size: sizeValue,
              quantity: Number(stockValue || 0),
              sold: 0,
            });
          }
        });
      } else if (stockValue !== undefined) {
        variant.sizes.forEach((sizeObj) => {
          sizeObj.quantity = isAddStock
            ? (sizeObj.quantity || 0) + Number(stockValue)
            : Number(stockValue);
        });
      }
    };

    // ✅ Upload ảnh nếu có
    if (req.files?.images) {
      try {
        const files = Array.isArray(req.files.images)
          ? req.files.images
          : [req.files.images];

        for (let i = 0; i < colorArray.length; i++) {
          const currentColor = colorArray[i];
          const variant = findOrCreateVariant(currentColor);

          const resultImage = await uploadFileToCloudinary(files[i]);
          variant.images.push({ url: resultImage.secure_url });

          if (sizeArray.length > 0) {
            updateVariantSizes(variant, sizeArray, stock, false);
          }
        }
      } catch (uploadError) {
        console.error("Lỗi khi tải lên hình ảnh:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi tải lên hình ảnh: " + uploadError.message,
        });
      }
    }

    // ✅ Trường hợp cộng thêm stock vào size/color cụ thể
    if (!req.files?.images && sizeArray.length > 0 && colorArray.length > 0) {
      colorArray.forEach((currentColor) => {
        const variant = findOrCreateVariant(currentColor);
        updateVariantSizes(variant, sizeArray, stock, true); // ✅ cộng thêm
      });
    }

    // ✅ Nếu chỉ có size (không màu) => cập nhật tất cả variants
    if (!req.files?.images && colorArray.length === 0 && sizeArray.length > 0) {
      variants.forEach((variant) => {
        updateVariantSizes(variant, sizeArray, stock, false);
      });
    }

    // ✅ Nếu chỉ có stock → cộng thêm cho tất cả
    if (
      stock !== undefined &&
      sizeArray.length === 0 &&
      colorArray.length === 0
    ) {
      variants.forEach((variant) => {
        updateVariantSizes(variant, [], stock, true);
      });
    }

    // ✅ Cập nhật sold nếu có
    if (sold !== undefined && variants.length > 0) {
      const totalSizes = variants.reduce(
        (acc, variant) => acc + variant.sizes.length,
        0
      );
      if (totalSizes > 0) {
        const soldPerSize = Math.floor(Number(sold) / totalSizes);
        let remainingSold = Number(sold) - soldPerSize * totalSizes;

        variants.forEach((variant) => {
          variant.sizes.forEach((sizeObj, index) => {
            sizeObj.sold =
              soldPerSize +
              (remainingSold > 0 && index === 0 ? remainingSold : 0);
            if (index === 0) remainingSold = 0;
          });
        });
      }
    }

    const totalStock = variants.reduce(
      (acc, variant) =>
        acc +
        variant.sizes.reduce(
          (sum, sizeObj) => sum + (sizeObj.quantity || 0),
          0
        ),
      0
    );

    const totalSold = variants.reduce(
      (acc, variant) =>
        acc +
        variant.sizes.reduce((sum, sizeObj) => sum + (sizeObj.sold || 0), 0),
      0
    );

    const finalPrice =
      price !== undefined ? Number(price) : existingProduct.price;
    const finalDiscount =
      discount !== undefined ? Number(discount) : existingProduct.discount;
    const discountedPrice = finalPrice * (1 - finalDiscount / 100);

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (gender !== undefined) updateFields.gender = gender;
    if (description !== undefined) updateFields.description = description;
    if (category !== undefined) updateFields.category = category;
    if (brand !== undefined) updateFields.brand = brand;
    if (care !== undefined) updateFields.care = care;
    if (price !== undefined) updateFields.price = finalPrice;
    if (discount !== undefined) updateFields.discount = finalDiscount;
    if (costPrice !== undefined) updateFields.costPrice = Number(costPrice);

    updateFields.stock = totalStock;
    updateFields.sold = sold !== undefined ? Number(sold) : totalSold;
    updateFields.discountedPrice = discountedPrice;
    updateFields.variants = variants;
    updateFields.updatedAt = new Date();

    console.log("Update fields:", {
      stock: updateFields.stock,
      sold: updateFields.sold,
      variantsCount: variants.length,
    });

    const updatedProduct = await Products.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Không thể cập nhật sản phẩm",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedProduct,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật sản phẩm",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const PutFeedbackProductAPI = async (req, res) => {
  try {
    const { id, userId, rating, review } = req.body;

    const imagesUrl = [];

    if (req.files && req.files.images) {
      console.log(req.files.images);

      let result = req.files.images;
      let resultImage = await uploadFileToCloudinary(result);
      console.log(resultImage);

      imagesUrl.push(resultImage.secure_url);
    }
    console.log(imagesUrl);

    const data = await PutFeedbackProduct(
      id,
      userId,
      rating,
      review,
      imagesUrl
    );

    return res.status(200).json({
      EC: "cập nhật thành công",
      data: data,
    });
  } catch (error) {}
};

const PutFeedbackProductsAPI = async (req, res) => {
  try {
    const { id, userId, rating, review } = req.body;

    const imagesUrl = [];

    if (req.files && req.files.images) {
      console.log("Tệp nhận được trong API:", req.files.images);

      const resultImages = await uploadFileToCloudinary(req.files.images);

      resultImages.forEach((result) => {
        if (result && result.secure_url) {
          imagesUrl.push(result.secure_url);
        }
      });
    }

    console.log("URL ảnh đã tải lên:", imagesUrl);

    const data = await PutFeedbackProducts(
      id,
      userId,
      rating,
      review,
      imagesUrl
    );

    return res.status(200).json({
      EC: "cập nhật thành công",
      data: data,
    });
  } catch (error) {
    console.error("Lỗi trong PutFeedbackProductsAPI:", error);
    return res.status(500).json({
      EC: "lỗi server",
      error: error.message,
    });
  }
};
const CategoryGenderAPI = async (req, res) => {
  const page = parseInt(req.query.page || "1", 10); // Đảm bảo page là số nguyên
  const {
    gender,
    category,
    minPrice,
    maxPrice,
    sortName,
    sortPrice,
    sortDate,
    sortSold,
    care,
    size,
    color,
  } = req.query;

  try {
    const { products, totalPages, currentPage } = await ProductFilter({
      gender,
      category,
      minPrice,
      maxPrice,
      sortName,
      sortPrice,
      sortDate,
      sortSold,
      care,
      size,
      color,
      page,
    });

    return res.status(200).json({
      EC: 0,
      data: products,
      totalPages,
      currentPage,
    });
  } catch (error) {
    console.error("Error in CategoryGenderAPI:", error);
    return res.status(500).json({
      EC: 1,
      message: "Internal Server Error",
    });
  }
};

const toggleLikeRatingAPI = async (req, res) => {
  try {
    const { productId, ratingId, userId } = req.body;

    // Call the toggleLikeRating function
    const { product, action } = await toggleLikeRating(
      productId,
      ratingId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: `Rating successfully ${action}`,
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const CategoryGenderFitterAPI = async (req, res) => {
  const page = parseInt(req.params.page || "1", 10); // Ensure page is an integer
  const { gender, category } = req.params;
  try {
    const { products, totalPages, currentPage } = await CategoryGenderFitter(
      gender,
      category,
      page
    );
    return res.status(200).json({
      EC: 0,
      data: products,
      totalPages,
      currentPage,
    });
  } catch (error) {
    console.error("Error in CategoryGenderAPI:", error);
    return res.status(500).json({
      EC: 1,
      message: "Internal Server Error",
    });
  }
};

// phản hồi đánh giá của admin

const toggleLikeReply = async (req, res) => {
  const { productId, ratingId } = req.params;
  const { userId, content } = req.body;

  console.log(userId, content);

  try {
    const product = await Products.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const rating = product.ratings.id(ratingId);
    if (!rating) return res.status(404).json({ message: "Rating not found" });

    const check = true;
    rating.replies.push({ userId, content, check });

    await product.save();

    return (
      res.status(200),
      json({
        EC: 0,
        message: "Phản hồi thành công",
      })
    );
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

module.exports = {
  AddProductsAPI,
  ListProductsAPI,
  ListOneProductAPI,
  UpdateProductsAPI,
  PutFeedbackProductAPI,
  PutFeedbackProductsAPI,
  CategoryGenderAPI,
  CategoryGenderFitterAPI,
  toggleLikeRatingAPI,
  toggleLikeReply,
};
