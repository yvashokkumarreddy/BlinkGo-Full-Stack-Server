import mongoose from "mongoose";
import CounterModel from "./CounterModel.js"; // make sure you have a counter collection

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    category: [
      {
        type: mongoose.Schema.Types.Mixed, // ✅ can be ObjectId or String
        ref: "category",
      },
    ],
    categoryId: {
      type: Number, // link to parent categoryId
      required: true,
    },
    subCategoryId: {
      type: Number, // auto-incremented subcategory ID
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-increment subCategoryId
// subCategorySchema.pre("save", async function (next) {
//   if (this.isNew) {
//     try {
//       const counter = await CounterModel.findByIdAndUpdate(
//         { id: "subCategoryId" }, // counter key for subcategories
//         { $inc: { seq: 1 } },
//         { new: true, upsert: true }
//       );
//       this.subCategoryId = counter.seq;
//     } catch (err) {
//       return next(err);
//     }
//   }
//   next();
// });

const SubCategoryModel = mongoose.model("subCategory", subCategorySchema);

export default SubCategoryModel;
