import mongoose from "mongoose";
import CounterModel from "./counterModel.js";

const cartProductSchema = new mongoose.Schema(
  {
     // auto-increment
    cartId: { type: Number, required: true }, // unique per user
    items: [
      {
      cartItemId: { type: Number, unique: true, required: true },
      productId: {type: Number, required:true},
      quantity: { type: Number, default: 1 },
      price: {type: Number, required: true },
      status: {type: Boolean,default: true}
      }
    ],
    user_id: { type: Number, ref: "Customers", required: true },
  },
  { timestamps: true }
);

// Pre-save hook for auto-increment
cartProductSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Generate cartItemId
      const counterItem = await CounterModel.findOneAndUpdate(
        { id: "cartItemId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.cartItemId = counterItem.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const CartProductModel = mongoose.model("cartProduct", cartProductSchema);

export default CartProductModel;
