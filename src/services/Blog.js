const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tip: {
      type: String,
      required: true, // ✅ sửa chính tả
    },
    content: {
      type: String,
      required: true,
    },
    slug: String,
    regex: {
      type: String,
      trim: true,
    },
    img: [
      {
        url: {
          type: String,
          required: false,
        },
      },
    ],
    view: {
      type: Number,
      default: 0,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", blogSchema);
