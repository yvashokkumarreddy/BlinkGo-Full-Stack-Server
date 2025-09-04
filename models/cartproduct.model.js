import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    cartItemId: { type: Number, required: true },
  productId: { type: Number,ref: "Products", required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  status: { type: Boolean, default: true },
  discount: { type: Number, default: null }
});

const cartSchema = new mongoose.Schema(
  {
    cartId: { type: Number, required: true, unique: true }, // comes from user model
    user_id: { type: Number, ref: "Customers", required: true },
    items: [cartItemSchema], // all cart items inside one cart
  },
  { timestamps: true }
);
cartSchema.index({ user_id: 1, "items.cartItemId": 1 }, { unique: true });
const CartModel = mongoose.model("carts", cartSchema);

export default CartModel;
