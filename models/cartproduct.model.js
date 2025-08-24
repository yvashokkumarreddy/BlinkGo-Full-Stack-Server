import mongoose from "mongoose";
import CounterModel from "./counterModel.js";

const cartProductSchema = new mongoose.Schema(
  {
    cartId: {
      type: Number,
      unique: true, // auto-increment
    },
    productId: {
      type: Number, // store Product's auto-incremented productId
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // reference User _id
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-increment cartId
cartProductSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await CounterModel.findByIdAndUpdate(
        { _id: "cartId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.cartId = counter.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const CartProductModel = mongoose.model("cartProduct", cartProductSchema);

export default CartProductModel;
