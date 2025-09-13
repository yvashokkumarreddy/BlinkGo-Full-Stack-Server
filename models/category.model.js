import mongoose from "mongoose";
import CounterModel from "./counterModel.js";

const categorySchema = new mongoose.Schema({
  name: { type: String, default: "" },
  image: { type: String, default: "" },
  categoryId: { type: Number, required: true ,unique:true},
  parentCategory: { type: Number, default: null },
}, { timestamps: true });

categorySchema.pre("save", async function(next) {
  if (this.isNew) {
    try {
      // const counter = await CounterModel.findOneAndUpdate(
      //   { id: "categoryId" },
      //   { $inc: { seq: 1 } },
      //   // { new: true, upsert: true }
      // );
      // this.categoryId = counter.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const CategoryModel = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default CategoryModel;
