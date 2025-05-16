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
    console.log("stock", stock);
    console.log("sold", sold);

    // Lấy thông tin sản phẩm cũ từ database
    const existingProduct = await Products.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Xử lý size thành mảng
    const sizeArray = size
      ? Array.isArray(size)
        ? size
        : size.split(",").map((item) => item.trim())
      : [];
    const colorArray = color
      ? Array.isArray(color)
        ? color
        : color.split(",").map((item) => item.trim())
      : [];

    // Sao chép variants cũ
    let variants = [...existingProduct.variants];

    // Xử lý hình ảnh và variants nếu có ảnh mới
    if (req.files && req.files.images) {
      try {
        const files = Array.isArray(req.files.images)
          ? req.files.images
          : [req.files.images];

        if (files.length !== colorArray.length) {
          return res.status(400).json({
            success: false,
            message: "Số lượng ảnh phải khớp với số màu mới",
          });
        }

        for (let i = 0; i < colorArray.length; i++) {
          const resultImage = await uploadFileToCloudinary(files[i]);
          const existingVariant = variants.find(
            (variant) => variant.color === colorArray[i]
          );

          if (existingVariant) {
            existingVariant.images.push({ url: resultImage.secure_url });

            // Cập nhật sizes mà không trùng lặp
            const updatedSizes = [];
            const existingSizesMap = new Map(
              existingVariant.sizes.map((s) => [s.size, s])
            );

            sizeArray.forEach((size) => {
              if (existingSizesMap.has(size)) {
                // Nếu size đã tồn tại, giữ nguyên quantity và sold cũ, chỉ cập nhật nếu có thay đổi
                const existingSize = existingSizesMap.get(size);
                updatedSizes.push({
                  size,
                  quantity: existingSize.quantity || stock,
                  sold: existingSize.sold || 0, // Giữ nguyên sold cũ, không cập nhật từ req.body
                });
              } else {
                // Nếu size mới, thêm mới với quantity và sold
                updatedSizes.push({
                  size,
                  quantity: stock,
                  sold: 0, // Giá trị sold mặc định cho size mới
                });
              }
            });

            existingVariant.sizes = updatedSizes;
          } else {
            const newVariant = {
              color: colorArray[i],
              sizes: sizeArray.map((size) => ({
                size,
                quantity: stock,
                sold: 0, // Giá trị sold mặc định cho variant mới
              })),
              images: [{ url: resultImage.secure_url }],
            };
            variants.push(newVariant);
          }
        }
      } catch (uploadError) {
        console.error("Lỗi khi tải lên hình ảnh:", uploadError.message);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi tải lên hình ảnh",
        });
      }
    } else if (sizeArray.length > 0) {
      // Nếu không có ảnh mới nhưng có size mới, cập nhật sizes cho variant "black"
      const blackVariantIndex = variants.findIndex(
        (variant) => variant.color === "đen"
      );

      if (blackVariantIndex !== -1) {
        // Cập nhật sizes cho variant "black" mà không trùng lặp
        const updatedSizes = [];
        const existingSizesMap = new Map(
          variants[blackVariantIndex].sizes.map((s) => [s.size, s])
        );

        sizeArray.forEach((size) => {
          if (existingSizesMap.has(size)) {
            // Nếu size đã tồn tại, giữ nguyên sold cũ, chỉ cập nhật quantity
            const existingSize = existingSizesMap.get(size);
            updatedSizes.push({
              size,
              quantity: stock || existingSize.quantity,
              sold: existingSize.sold || 0,
            });
          } else {
            // Nếu size mới, thêm mới với quantity và sold
            updatedSizes.push({
              size,
              quantity: stock,
              sold: 0, // Giá trị sold mặc định cho size mới
            });
          }
        });

        variants[blackVariantIndex].sizes = updatedSizes;
      } else if (sizeArray.length > 0) {
        // Nếu không tìm thấy variant "black" và có size mới, thêm variant "black"
        variants.push({
          color: "đen",
          sizes: sizeArray.map((size) => ({
            size,
            quantity: stock,
            sold: 0,
          })),
          images: existingProduct.variants.find((v) => v.images.length > 0)
            ?.images || [{ url: "default-image-url" }],
        });
      }
    }

    // Phân bổ giá trị sold từ req.body cho tất cả sizes trong variants (nếu cần)
    if (sold !== undefined && variants.length > 0) {
      const totalSizes = variants.reduce(
        (acc, variant) => acc + variant.sizes.length,
        0
      );
      const soldPerSize =
        totalSizes > 0 ? Math.floor(Number(sold) / totalSizes) : 0;

      variants.forEach((variant) => {
        variant.sizes.forEach((sizeObj) => {
          sizeObj.sold = soldPerSize; // Phân bổ sold đều cho từng size
        });
      });
    }

    console.log(variants.sizes);

    const totalStock = variants.reduce(
      (acc, variant) =>
        acc + variant.sizes.reduce((sum, sz) => sum + (sz.quantity || 0), 0),
      0
    );
    // Tính toán giá sau giảm giá
    const finalCostPrice = price || existingProduct.price;
    const finalDiscount = discount || existingProduct.discount;
    const discountedPrice = finalCostPrice * (1 - finalDiscount / 100);

    // Tạo object chứa các trường cần update
    const updateFields = {
      name: name || existingProduct.name,
      gender: gender || existingProduct.gender,
      description: description || existingProduct.description,
      category: category || existingProduct.category,
      brand: brand || existingProduct.brand,
      care: care || existingProduct.care,
      price: price ? Number(price) : existingProduct.price,
      discount: finalDiscount,
      stock: totalStock,
      sold: sold ? Number(sold) : existingProduct.sold,
      costPrice: costPrice ? Number(costPrice) : existingProduct.costPrice,
      discountedPrice,
      variants,
    };

    // Update sản phẩm
    const updatedProduct = await Products.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      data: updatedProduct,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật sản phẩm",
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
};
