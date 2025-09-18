const {
  CreateBlog,
  updateBlogView,
  getAllBlog,
  getDetailSlug,
  newUpdateBlog,
} = require("../services/Blog");

const createBlogController = async (req, res) => {
  try {
    const blog = await CreateBlog({
      title: req.body.title,
      tip: req.body.tip,
      content: req.body.content,
      slug: req.body.slug,
      regex: req.body.regex,
      userId: req.body.userId,
      files: req.files.img,
      readTime: req.body.readTime,
      featured: req.body.featured,
    });

    res.status(201).json({ message: "Tạo blog thành công", blog });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateBlogController = async (req, res) => {
  try {
    const { slug } = req.params;

    const data = await updateBlogView(slug);

    return res.status(201).json({ EC: 0, view: "Tăng view thành công", data });
  } catch (error) {
    res.status(400).json({ message: err.message });
  }
};

const getAllBlogController = async (req, res) => {
  try {
    const data = await getAllBlog();

    return res.status(200).json({
      EC: 0,
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const getDetailSlugController = async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await getDetailSlug(slug);

    return res.status(200).json({
      EC: 0,
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const newUpdateBlogAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const { dataBlog } = req.body;
    const data = await newUpdateBlog(id, dataBlog);

    return res.status(200).json({
      EC: 0,
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  createBlogController,
  updateBlogController,
  getAllBlogController,
  getDetailSlugController,
  newUpdateBlogAPI,
};
