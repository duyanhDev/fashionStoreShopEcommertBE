const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  normalizedName: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "unisex"],
    default: "unisex",
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  brand: {
    type: String,
  },
  care: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  }, // giá nhập
  discount: {
    type: Number,
    default: 0,
  },
  discountedPrice: {
    type: Number,
  }, // giá giảm
  stock: {
    type: Number,
    default: 0,
  },
  sold: {
    type: Number,
    default: 0,
  },
  variants: [
    {
      color: {
        type: String,
        required: true,
      },
      sizes: [
        {
          size: {
            type: String,
            required: true,
          },
          quantity: {
            type: Number,
            default: 0,
            min: 0,
          },
          sold: {
            type: Number,
            default: 0,
          },
        },
      ],
      images: [
        {
          url: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
  ratings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: {
        type: String,
      },
      images: [
        {
          type: String,
        },
      ],

      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
      replies: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
          },
          content: {
            type: String,
            required: true,
          },
          likes: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Users",
            },
          ],
          createdAt: {
            type: Date,
            default: Date.now,
          },

          replies: [
            {
              userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users",
              },
              content: {
                type: String,
                required: true,
              },
              likes: [
                {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Users",
                },
              ], // Người dùng like phản hồi cấp 2
              createdAt: {
                type: Date,
                default: Date.now,
              },
            },
          ],
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  costPrice: {
    type: Number, // giá bán hàng
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.discountedPrice = this.price * (1 - this.discount / 100);
  this.normalizedName = this.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  next();
});

// Virtual để tính số tiền nhập hàng (totalCost)
productSchema.virtual("totalCost").get(function () {
  return this.price * this.stock;
});
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ name: "text" });
productSchema.index({ normalizedName: 1 });
productSchema.index({ searchKeywords: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ category: 1 });
productSchema.index({ color: 1 });
productSchema.index({ size: 1 });

module.exports = mongoose.model("Product", productSchema);
