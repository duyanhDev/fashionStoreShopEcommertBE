const BlogModel = require("./../Model/BlogSchema");
const { uploadFileToCloudinary } = require("./../services/Cloudinary");
const slugify = require("slugify");
const CreateBlog = async ({
  title,
  tip,
  content,
  slug,
  regex,
  author,
  files,
}) => {
  if (!title || !tip || !content || !regex || !author) {
    throw new Error("Không truyền đủ tham số");
  }

  console.log("xxx", files);

  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // ví dụ: 5765
  const slugTilte =
    slugify(slug, { lower: true, strict: true, locale: "vi" }) +
    `-${randomSuffix}`;
  let imageUrls = [];

  // Nếu có ảnh gửi lên
  if (files) {
    const imgFiles = Array.isArray(files) ? files : [files];

    console.log(imgFiles);

    for (const file of imgFiles) {
      const results = await uploadFileToCloudinary(file); // <- Trả về mảng

      if (Array.isArray(results)) {
        results.forEach((item) => {
          if (item?.secure_url) {
            imageUrls.push({ url: item.secure_url });
          }
        });
      }
    }
  }

  const newBlog = new BlogModel({
    title,
    tip,
    content,
    slug: slugTilte,
    regex,
    img: imageUrls,
    author,
  });

  await newBlog.save();
  return newBlog;
};
const updateBlogView = async (slug) => {
  if (!slug) {
    throw new Error("Không tồn tại blog");
  }

  const blog = await BlogModel.findOneAndUpdate(
    { slug },
    { $inc: { view: 1 } }, // Tăng view
    { new: true } // Trả về blog đã được cập nhật
  );

  if (!blog) {
    throw new Error("Không tìm thấy blog");
  }

  return blog;
};

module.exports = {
  CreateBlog,
  updateBlogView,
};
