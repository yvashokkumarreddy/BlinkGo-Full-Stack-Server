import mongoose from "mongoose";
import CounterModel from "./counterModel.js";

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },  // 👈 Add this (UUID or custom string)

  user_id: { type: Number, unique: true }, // existing auto-increment field

  name: {
    type: String,
    required: [true, "Provide name"],
  },
  email: {
    type: String,
    required: [true, "provide email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "provide password"],
  },
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
  address_details: [
    { type: mongoose.Schema.ObjectId, ref: "address" },
  ],
  shopping_cart: [
    { type: mongoose.Schema.ObjectId, ref: "cartProduct" },
  ],
  orderHistory: [
    { type: mongoose.Schema.ObjectId, ref: "order" },
  ],
  forgot_password_otp: { type: String, default: null },
  forgot_password_expiry: { type: Date, default: "" },
  role: {
    type: String,
    enum: ["ADMIN", "USER"],
    default: "USER",
  },
}, {
  timestamps: true,
});

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Incremental numeric ID
      const counter = await CounterModel.findByIdAndUpdate(
        { _id: "user_id" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.user_id = counter.seq;

      // Custom userId field
      this.userId = `USER-${Date.now()}-${Math.floor(Math.random() * 1000)}`; 
      // e.g. USER-1755972312345-421
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
