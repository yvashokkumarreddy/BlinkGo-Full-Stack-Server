import mongoose from "mongoose";
import CounterModel from "./CounterModel.js";

const userSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true },
  name: { type: String, required: [true, "Provide name"] },
  email: { type: String, required: [true, "Provide email"], unique: true },
  password: { type: String, required: [true, "Provide password"] },
  avatar: { type: String, default: "" },
  mobile: { type: Number, default: null },
  refresh_token: { type: String, default: "" },
  verify_email: { type: Boolean, default: false },
  last_login_date: { type: Date, default: null },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Suspended"],
    default: "Active",
  },
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },

  // ✅ New fields
  cartId: { type: Number, unique: true, required: true },
  addressId: { type: Number, unique: true, required: true },

  address_details: [{ type: mongoose.Schema.ObjectId, ref: "address" }],
  shopping_cart: [{ type: mongoose.Schema.ObjectId, ref: "cartProduct" }],
  orderHistory: [{ type: mongoose.Schema.ObjectId, ref: "order" }],
  forgot_password_otp: { type: String, default: null },
  forgot_password_expiry: { type: Date, default: null },
}, { timestamps: true });

// Pre-save hook to auto-increment user_id
userSchema.pre("save", async function (next) {
  if (!this.user_id) {
    const lastUser = await this.constructor.findOne().sort({ user_id: -1 });
    this.user_id = lastUser ? lastUser.user_id + 1 : 1;
  }
  if (!this.addressId) {
    const lastUser = await this.constructor.findOne().sort({ addressId: -1 });
    this.addressId = lastUser ? lastUser.addressId + 1 : 1;
  }
  if (!this.cartId) {
    const lastUser = await this.constructor.findOne().sort({ cartId: -1 });
    this.cartId = lastUser ? lastUser.cartId + 1 : 1;
  }
  next();
});

// ✅ Prevent OverwriteModelError
const UserModel = mongoose.models.Customers || mongoose.model("Customers", userSchema);

export default UserModel;
