const { CreateBlog, updateBlogView } = require("../services/Blog");

const createBlogController = async (req, res) => {
  try {
    const blog = await CreateBlog({
      title: req.body.title,
      tip: req.body.tip,
      content: req.body.content,
      slug: req.body.slug,
      regex: req.body.regex,
      author: req.body.author,
      files: req.files.img,
    });
    console.log("check", req.files.img);

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
module.exports = {
  createBlogController,
  updateBlogController,
};
