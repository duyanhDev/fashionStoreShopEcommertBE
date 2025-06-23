const { CreateBlog, updateBlogView, getAllBlog } = require("../services/Blog");

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
    console.log("check", blog);

    res.status(201).json({ message: "Tạo blog thành công", blog });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateBlogController = async (req, res) => {
  try {
    const { slug } = req.params;

    const data = await updateBlogView(slug);

    return res.status(201).json({ view: "Tăng view thành công", data });
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
module.exports = {
  createBlogController,
  updateBlogController,
  getAllBlogController,
};
