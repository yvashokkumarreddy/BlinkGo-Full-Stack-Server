import mongoose from "mongoose";
import CounterModel from "./counterModel.js"; // make sure you have a counter collection

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    categoryId: { type: Number, unique: true }, // auto-incremented numeric ID
    parentCategory: { type: Number, default: null }, // for subcategories, reference parent categoryId
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-increment categoryId
categorySchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await CounterModel.findByIdAndUpdate(
        { _id: "categoryId" }, // counter key for categories
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.categoryId = counter.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const CategoryModel = mongoose.model("category", categorySchema);

export default CategoryModel;
