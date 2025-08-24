import mongoose from "mongoose";
import CounterModel from "./counterModel.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: Array, default: [] },

    categoryId: { type: Number, required: true },
    subCategoryId: { type: Number, required: true },

    productId: {
      type: Number,
      unique: true,
    },

    category: [
      {
        type: mongoose.Schema.Types.Mixed,
        ref: "category",
      },
    ],
    subCategory: [
      {
        type: mongoose.Schema.Types.Mixed,
        ref: "subCategory",
      },
    ],

    unit: { type: String, default: "" },
    stock: { type: Number, default: null },
    price: { type: Number, default: null },
    discount: { type: Number, default: null },
    description: { type: String, default: "" },
    more_details: { type: Object, default: {} },
    publish: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Pre-save hook for auto-increment productId
productSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await CounterModel.findByIdAndUpdate(
        { _id: "productId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.productId = counter.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

productSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 10, description: 5 } }
);

const ProductModel = mongoose.model("product", productSchema);

export default ProductModel;
