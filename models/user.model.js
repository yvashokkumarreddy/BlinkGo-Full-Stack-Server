import mongoose from "mongoose";
import CounterModel from "./counterModel.js";

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },  
  user_id: { type: Number, unique: true }, 
  name: { type: String, required: [true, "Provide name"] },
  email: { type: String, required: [true, "Provide email"], unique: true },
  password: { type: String, required: [true, "Provide password"] },
  avatar: { type: String, default: "" },
  mobile: { type: Number, default: null },
  refresh_token: { type: String, default: "" },
  verify_email: { type: Boolean, default: false },
  last_login_date: { type: Date, default: "" },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Suspended"],
    default: "Active",
  },
  address_details: [{ type: mongoose.Schema.ObjectId, ref: "address" }],
  shopping_cart: [{ type: mongoose.Schema.ObjectId, ref: "cartProduct" }],
  orderHistory: [{ type: mongoose.Schema.ObjectId, ref: "order" }],
  forgot_password_otp: { type: String, default: null },
  forgot_password_expiry: { type: Date, default: "" },
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await CounterModel.findByIdAndUpdate(
        { _id: "user_id" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.user_id = counter.seq;

      // assign userId if not already set
      if (!this.userId) {
        this.userId = `USER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// ✅ Fix OverwriteModelError
const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
